import {
  PortfolioHolding,
  PortfolioSummary,
  SectorSummary,
} from "@/types/portfolio";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface StaticPortfolioApiResponse {
  holdings: PortfolioHolding[];
  sectorSummaries: SectorSummary[];
  portfolioSummary: PortfolioSummary;
  lastUpdated: string;
}

interface DynamicPortfolioApiResponse {
  holdings: PortfolioHolding[];
  sectorSummaries: SectorSummary[];
  portfolioSummary: PortfolioSummary;
  lastUpdated: string;
}

const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.message || "API request failed");
  }

  return data.data as T;
};

// Portfolio API
export const portfolioApi = {
  // Fetch static portfolio data (fast, no external calls)
  async getStaticPortfolio(): Promise<StaticPortfolioApiResponse> {
    const response = await fetch("/api/portfolio/static", {
      method: "GET",
    });

    return handleApiResponse<StaticPortfolioApiResponse>(response);
  },

  // Fetch dynamic data with complete calculations
  async getDynamicPortfolio(
    stockNames: string[]
  ): Promise<DynamicPortfolioApiResponse> {
    if (stockNames.length === 0) {
      // Return static data if no stocks provided
      return this.getStaticPortfolio();
    }

    const stocksParam = stockNames.join(",");
    const response = await fetch(
      `/api/portfolio/dynamic?stocks=${encodeURIComponent(stocksParam)}`,
      {
        method: "GET",
      }
    );

    return handleApiResponse<DynamicPortfolioApiResponse>(response);
  },
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i === maxRetries) {
        throw lastError;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }

  throw lastError!;
};
