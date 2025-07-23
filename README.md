# Dynamic Portfolio Dashboard

A real-time portfolio management dashboard built with Next.js, TypeScript, and Tailwind CSS that fetches live stock data from Yahoo Finance and Google Finance APIs.

## Features

- **Real-time Stock Data**: Fetches current market prices from Yahoo Finance
- **Financial Metrics**: Retrieves P/E ratios and earnings data from Google Finance
- **Dynamic Updates**: Auto-refreshes data every 15 seconds
- **Sector Grouping**: Organizes stocks by sector with summary statistics
- **Interactive UI**: Modern, responsive design with dark/light theme support
- **Error Handling**: Graceful handling of API failures and rate limits
- **Performance Optimized**: Caching and memoization for better performance

## Technology Stack

- **Frontend**: Next.js 15.4.2, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI components
- **Data Fetching**: TanStack Query (React Query)
- **APIs**: Yahoo Finance (unofficial), Google Finance (web scraping)
- **Build Tool**: Turbopack

## Prerequisites

- Node.js 18+
- Yarn package manager

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Akianonymus/portfolio-dashboard
cd portfolio-dashboard
```

2. Install dependencies:

```bash
yarn install
```

3. Start the development server:

```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── portfolio/
│   │       ├── static/    # Static portfolio data endpoint
│   │       └── dynamic/   # Dynamic data with live prices
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── PortfolioTable.tsx # Main portfolio table
│   ├── SectorGrouping.tsx # Sector-wise grouping
│   └── PortfolioSummaryCard.tsx # Portfolio summary
├── data/                 # Static data
│   └── portfolioData.ts  # Portfolio holdings data
├── hooks/                # Custom React hooks
│   ├── useDynamicData.ts # Dynamic data fetching
│   └── useStaticPortfolio.ts # Static data fetching
├── lib/                  # Utility libraries
│   └── services/         # API services
│       ├── api.ts        # API client
│       ├── finance.ts    # Finance service orchestrator
│       ├── yahooFinance.ts # Yahoo Finance integration
│       └── googleFinance.ts # Google Finance scraping
└── types/                # TypeScript type definitions
    └── portfolio.ts      # Portfolio-related types
```

## API Endpoints

- `GET /api/portfolio/static` - Returns static portfolio data without external API calls
- `GET /api/portfolio/dynamic?stocks=stock1,stock2` - Returns portfolio data with live prices and financial metrics

## Configuration

### Environment Variables

No environment variables are required for basic functionality. The application uses public APIs and web scraping.

### Customization

To modify the portfolio data, edit `src/data/portfolioData.ts`:

```typescript
export const portfolioData: PortfolioHoldingData[] = [
  {
    id: "1",
    name: "Stock Name",
    sector: "Sector Name",
    purchasePrice: 100.0,
    quantity: 10,
  },
  // Add more stocks...
];
```

## Available Scripts

- `yarn dev` - Start development server with Turbopack
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:

```bash
yarn build
yarn start
```

## Technical Documentation

For detailed technical information including:

- System architecture and data flow
- API specifications and implementation details
- Technical challenges and solutions
- Performance optimizations and security considerations

See [Technical Documentation](doc.md)

## Troubleshooting

### Common Issues

1. **API Rate Limits**: If you encounter rate limit errors, the app will retry automatically
2. **Data Not Loading**: Check browser console for error messages
3. **Build Errors**: Ensure all dependencies are installed with `yarn install`

### Debug Mode

Enable debug logging by checking browser console for detailed error messages and API response logs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Please respect the terms of service for Yahoo Finance and Google Finance when using this application.
