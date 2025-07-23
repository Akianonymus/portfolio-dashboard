# Technical Documentation: Dynamic Portfolio Dashboard

## System Architecture Overview

The Dynamic Portfolio Dashboard is built as a full-stack Next.js application with the following architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   API Routes    │◄──►│   APIs          │
│                 │    │                 │    │                 │
│ - React         │    │ - Static Data   │    │ - Yahoo Finance │
│ - TypeScript    │    │ - Dynamic Data  │    │ - Google Finance│
│ - Tailwind CSS  │    │ - Error Handling│    │                 │
│ - React Query   │    │ - Caching       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Data Flow Architecture

### 1. Frontend to Backend Communication

**Frontend API Client (`src/lib/services/api.ts`)**

- Provides centralized API client for frontend components
- Handles HTTP requests to backend API routes
- Implements retry logic and error handling
- Manages response parsing and type safety

**API Endpoints:**

- `GET /api/portfolio/static` - Returns static portfolio data
- `GET /api/portfolio/dynamic?stocks=stock1,stock2` - Returns live data

### 2. Backend Data Processing

**Static Portfolio Route (`src/app/api/portfolio/static/route.ts`)**

- Reads static portfolio data from `src/data/portfolioData.ts`
- Performs basic calculations (investment, portfolio percentages)
- Returns structured data without external API calls
- Fast response time for initial page load

**Dynamic Portfolio Route (`src/app/api/portfolio/dynamic/route.ts`)**

- Accepts comma-separated stock names as query parameter
- Orchestrates parallel API calls to Yahoo Finance and Google Finance
- Processes and merges data from multiple sources
- Implements caching with 15-second TTL
- Handles partial failures gracefully

### 3. External API Integration

**Yahoo Finance Service (`src/lib/services/yahooFinance.ts`)**

- Uses unofficial `yahoo-finance2` library
- Implements search functionality to find stock symbols
- Fetches real-time quotes and financial data
- Handles rate limiting and error scenarios
- Returns structured data with current prices and P/E ratios

**Google Finance Service (`src/lib/services/googleFinance.ts`)**

- Implements web scraping using Cheerio
- Parses HTML to extract P/E ratios and earnings data
- Handles different page structures and data formats
- Implements fallback strategies for data extraction
- Returns earnings per share and period information

**Finance Service Orchestrator (`src/lib/services/finance.ts`)**

- Coordinates calls between Yahoo Finance and Google Finance
- Ensures data consistency across sources
- Handles parallel processing for multiple stocks
- Provides unified interface for data fetching

## API Endpoints Detailed Specification

### Frontend API Routes

#### 1. Static Portfolio Endpoint

```
GET /api/portfolio/static
```

**Purpose:** Provides fast access to portfolio structure without external API calls

**Response Format:**

```typescript
{
  success: boolean;
  data: {
    holdings: PortfolioHolding[];
    sectorSummaries: SectorSummary[];
    portfolioSummary: PortfolioSummary;
    lastUpdated: string;
  };
}
```

**Use Cases:**

- Initial page load
- Fallback when dynamic data fails
- Fast portfolio structure display

#### 2. Dynamic Portfolio Endpoint

```
GET /api/portfolio/dynamic?stocks=stock1,stock2,stock3
```

**Purpose:** Fetches live market data and financial metrics

**Parameters:**

- `stocks`: Comma-separated list of stock names

**Response Format:**

```typescript
{
  success: boolean;
  data: {
    holdings: PortfolioHolding[];
    sectorSummaries: SectorSummary[];
    portfolioSummary: PortfolioSummary;
    lastUpdated: string;
  };
}
```

**Headers:**

- `Cache-Control: public, max-age=15` - 15-second caching

### Backend Processing Flow

#### Data Processing Pipeline

1. **Input Validation**

   - Validate stock names parameter
   - Filter empty or invalid entries
   - Return 400 error for malformed requests

2. **Parallel Data Fetching**

   - Process all stocks concurrently using `Promise.allSettled()`
   - Fetch from Yahoo Finance for current prices
   - Fetch from Google Finance for P/E ratios and earnings
   - Handle individual stock failures gracefully

3. **Data Transformation**

   - Merge data from multiple sources
   - Calculate derived values (present value, gain/loss, percentages)
   - Normalize data formats and handle missing values

4. **Sector Grouping**

   - Group stocks by sector
   - Calculate sector-level summaries
   - Sort sectors by total investment

5. **Portfolio Summary**
   - Calculate total portfolio metrics
   - Update last modified timestamp
   - Apply caching headers

## Key Technical Challenges and Solutions

### 1. Unofficial API Integration

**Challenge:** Yahoo Finance and Google Finance don't provide official public APIs

**Solution:**

- **Yahoo Finance**: Used `yahoo-finance2` library which provides a stable interface to Yahoo Finance data
- **Google Finance**: Implemented web scraping using Cheerio to parse HTML and extract financial metrics
- **Fallback Strategy**: Implemented graceful degradation when APIs fail

**Implementation Details:**

```typescript
// Yahoo Finance integration with error handling
export const getStockDataByNameYahoo = async (name: string) => {
  try {
    const searchResult = await searchStock(name);
    const quoteResult = await getQuote(symbol);
    return { success: true, data: processedData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Google Finance scraping with multiple parsing strategies
export async function getStockDataBySymbolGoogle(
  symbol: string,
  exchange: string
) {
  const $ = cheerio.load(html);
  // Multiple approaches to find P/E ratio and earnings data
  // Fallback strategies for different page structures
}
```

### 2. Rate Limiting and API Reliability

**Challenge:** External APIs have rate limits and may be unreliable

**Solution:**

- **Retry Logic**: Implemented exponential backoff with `withRetry()` utility
- **Parallel Processing**: Used `Promise.allSettled()` to handle partial failures
- **Caching**: 15-second cache on dynamic API responses
- **Graceful Degradation**: Return fallback data when APIs fail

**Implementation:**

```typescript
// Retry utility with exponential backoff
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }
};
```

### 3. Real-time Data Updates

**Challenge:** Maintaining live data updates without overwhelming APIs

**Solution:**

- **React Query**: Used TanStack Query for efficient data fetching and caching
- **Configurable Intervals**: 15-second refresh interval with configurable stale time
- **Background Updates**: Updates data in background without blocking UI
- **Optimistic Updates**: Show cached data while fetching fresh data

**Implementation:**

```typescript
// React Query configuration for dynamic updates
const { data, isLoading, isFetching } = useQuery({
  queryKey: ["dynamicPortfolioData", stockNames],
  queryFn: () => fetchDynamicPortfolioData(stockNames),
  refetchInterval: 15000, // 15 seconds
  staleTime: 15 * 1000, // Consider stale after 15 seconds
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

### 4. Data Consistency and Type Safety

**Challenge:** Ensuring data consistency across multiple sources and maintaining type safety

**Solution:**

- **TypeScript Interfaces**: Comprehensive type definitions for all data structures
- **Data Normalization**: Consistent data format across different sources
- **Validation**: Input validation on API endpoints
- **Error Boundaries**: Graceful handling of malformed data

**Implementation:**

```typescript
// Comprehensive type definitions
export interface PortfolioHolding {
  id: string;
  name: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
  symbol: string;
  exchange: string;
  currentPrice: number;
  peRatio: number;
  latestEarnings: EarningsData;
  investment: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  portfolioPercentage: number;
}
```

### 5. Performance Optimization

**Challenge:** Handling large portfolios with multiple API calls efficiently

**Solution:**

- **Parallel Processing**: Process all stocks concurrently
- **Memoization**: React Query for efficient data caching
- **Lazy Loading**: Load data only when needed
- **Optimized Rendering**: React.memo and useMemo for component optimization

**Implementation:**

```typescript
// Parallel processing of multiple stocks
const processAllStocks = async (stockNames: string[]) => {
  const stockPromises = stockNames.map(async (name) => {
    return getBatchStockDataByName([name]).then((results) => results[0]);
  });
  return Promise.allSettled(stockPromises);
};
```

### 6. Error Handling and User Experience

**Challenge:** Providing good user experience when APIs fail or data is unavailable

**Solution:**

- **Comprehensive Error Handling**: Catch and handle all types of errors
- **User-Friendly Messages**: Clear error messages for different scenarios
- **Loading States**: Show loading indicators during data fetching
- **Fallback Data**: Always provide some data even when APIs fail

**Implementation:**

```typescript
// Graceful error handling with fallback data
results.forEach((result, index) => {
  if (result.status === "fulfilled") {
    return result.value;
  } else {
    // Add placeholder data for failed requests
    return {
      name: stockNames[index],
      success: false,
      data: {
        /* fallback data */
      },
      error: result.reason?.message || "Failed to fetch data",
    };
  }
});
```

## Security Considerations

### 1. Input Validation

- Validate all user inputs on API endpoints
- Sanitize stock names to prevent injection attacks
- Implement proper error handling without exposing sensitive information

### 2. API Security

- No API keys required (uses public endpoints)
- Implement rate limiting to prevent abuse
- Use proper HTTP headers and status codes

### 3. Data Protection

- No sensitive data stored in client-side code
- Implement proper CORS policies
- Use HTTPS for all external API calls

## Performance Metrics

### Response Times

- **Static API**: < 50ms (no external calls)
- **Dynamic API**: 2-5 seconds (depending on number of stocks)
- **Cache Hit**: < 100ms (cached responses)

### Scalability Considerations

- **Horizontal Scaling**: Stateless API routes can be scaled horizontally
- **Caching Strategy**: 15-second cache reduces API load
- **Parallel Processing**: Efficient handling of multiple stocks
- **Memory Usage**: Minimal memory footprint with efficient data structures

## Future Enhancements

### 1. Advanced Caching

- Implement Redis for distributed caching
- Add cache warming strategies
- Implement cache invalidation policies

### 2. Real-time Updates

- Implement WebSocket connections for real-time updates
- Add server-sent events for live data streaming
- Implement push notifications for significant changes

### 3. Data Analytics

- Add historical data tracking
- Implement performance analytics
- Add portfolio optimization suggestions

### 4. Enhanced Error Handling

- Implement circuit breaker pattern
- Add detailed error logging and monitoring
- Implement automatic recovery mechanisms

## Conclusion

The Dynamic Portfolio Dashboard successfully addresses the challenges of building a real-time financial application with unofficial APIs. The solution demonstrates:

- **Robust Architecture**: Well-structured codebase with clear separation of concerns
- **Reliable Data Fetching**: Comprehensive error handling and fallback strategies
- **Performance Optimization**: Efficient caching and parallel processing
- **User Experience**: Responsive design with real-time updates
- **Maintainability**: Type-safe code with comprehensive documentation

The application serves as a solid foundation for portfolio management and can be extended with additional features and integrations as needed.
