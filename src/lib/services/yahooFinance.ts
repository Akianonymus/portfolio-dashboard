import yahooFinance from "yahoo-finance2";
yahooFinance.suppressNotices(["yahooSurvey"]);

// Result types for error handling
export interface YahooFinanceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Error handling utility that returns result instead of throwing
const handleYahooFinanceError = (
  error: unknown,
  operation: string,
  symbol: string
): YahooFinanceResult<never> => {
  console.error(`Yahoo Finance ${operation} error for ${symbol}:`, error);

  const errorMessage = error instanceof Error ? error.message : String(error);

  if (errorMessage.includes("rate limit")) {
    return {
      success: false,
      error: `Rate limit exceeded for ${symbol}. Please try again later.`,
    };
  }

  if (errorMessage.includes("not found") || errorMessage.includes("No data")) {
    return {
      success: false,
      error: `Stock symbol ${symbol} not found or has no data.`,
    };
  }

  return {
    success: false,
    error: `Failed to fetch ${operation} data for ${symbol}: ${errorMessage}`,
  };
};

export const searchStock = async (query: string) => {
  try {
    const results = await yahooFinance.search(query);

    if (!results || results.quotes.length === 0) {
      return {
        success: false,
        error: `No results found for query: ${query}`,
      };
    }

    // Prefer NSE exchange, otherwise choose the first result
    const nseStock = results.quotes.find(
      (quote) => "exchange" in quote && quote.exchange === "NSI"
    );
    const selectedStock = nseStock || results.quotes[0];

    return {
      success: true,
      data: selectedStock,
    };
  } catch (error) {
    return handleYahooFinanceError(error, "search", query);
  }
};

export const getQuote = async (symbol: string) => {
  try {
    const quote = await yahooFinance.quoteSummary(symbol, {
      modules: ["earnings", "price", "summaryDetail"],
    });
    return {
      success: true,
      data: quote,
    };
  } catch (error) {
    return handleYahooFinanceError(error, "quote", symbol);
  }
};

export const getStockDataByNameYahoo = async (name: string) => {
  try {
    let symbol: string | null = null;
    // First search for the stock by name
    const searchResult = await searchStock(name);

    if (!searchResult.success || !searchResult.data) {
      return {
        success: false,
        error: `Failed to search for stock: ${name}`,
      };
    }

    if ("symbol" in searchResult.data) {
      symbol = searchResult.data.symbol as string;
    }

    if (!symbol) {
      return {
        success: false,
        error: `No symbol found for stock: ${name}`,
      };
    }

    // Then get quote and earnings using the found symbol
    const quoteResult = await getQuote(symbol);

    if (!quoteResult.success || !quoteResult.data) {
      return {
        success: false,
        error: `Failed to get quote for ${symbol}`,
      };
    }

    const quote = quoteResult.data;
    const stockData = {
      symbol: quote.price?.symbol?.replace(/\..*/, ""),
      name:
        quote.price?.longName || quote.price?.shortName || quote.price?.symbol,
      exchange: quote.price?.exchange,
      currentPrice: quote.price?.regularMarketPrice || 0,
      peRatio: Number(
        (
          quote.summaryDetail?.trailingPE ??
          quote.summaryDetail?.forwardPE ??
          0
        ).toFixed(2)
      ),
      latestEarnings: quote?.earnings?.financialsChart || null,
      currency: quote.price?.currency || "INR",
      marketCap: quote.price?.marketCap || 0,
      volume: quote.price?.regularMarketVolume || 0,
      lastUpdated: new Date().toISOString(),
    };

    return {
      success: true,
      data: stockData,
    };
  } catch (error) {
    return handleYahooFinanceError(error, "stock data", name);
  }
};
