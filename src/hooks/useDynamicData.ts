import { useCallback, useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { portfolioApi, withRetry } from "@/lib/services/api";
import {
  PortfolioHolding,
  SectorSummary,
  PortfolioSummary,
} from "@/types/portfolio";
import { portfolioData } from "@/data/portfolioData";
import {
  calculateSectorSummaries,
  calculatePortfolioSummary,
} from "@/lib/utils/portfolioCalculations";

// Individual stock data fetcher using dynamic portfolio API
const fetchIndividualStockData = async (stockName: string) => {
  try {
    const data = await withRetry(() =>
      portfolioApi.getDynamicPortfolio([stockName])
    );
    // Return the first stock's data from the portfolio response
    return data.holdings.find((holding) => holding.name === stockName) || null;
  } catch (error) {
    console.error(`Failed to fetch data for ${stockName}:`, error);
    return null;
  }
};

// Calculate portfolio data from individual stock data
const calculatePortfolioData = (
  stockNames: string[],
  stockDataMap: Record<string, any>,
  portfolioData: any[]
): {
  holdings: PortfolioHolding[];
  sectorSummaries: SectorSummary[];
  portfolioSummary: PortfolioSummary;
} => {
  const holdings: PortfolioHolding[] = portfolioData.map((stock) => {
    const investment = stock.purchasePrice * stock.quantity;
    const dynamicInfo = stockDataMap[stock.name];

    const currentPrice = dynamicInfo?.currentPrice || 0;
    const presentValue = currentPrice * stock.quantity;
    const gainLoss = presentValue - investment;
    const gainLossPercentage =
      investment === 0 ? 0 : (gainLoss / investment) * 100;

    return {
      ...stock,
      symbol: dynamicInfo?.symbol || stock.name,
      exchange: dynamicInfo?.exchange || "NSE",
      currentPrice,
      peRatio: dynamicInfo?.peRatio || 0,
      latestEarnings: dynamicInfo?.latestEarnings || {
        period: undefined,
        amount: 0,
      },
      investment,
      presentValue,
      gainLoss,
      gainLossPercentage,
      portfolioPercentage: 0, // Will be calculated after total value is known
    };
  });

  // Calculate total present value for portfolio percentages
  const totalPresentValue = holdings.reduce(
    (sum, h) => sum + h.presentValue,
    0
  );

  const holdingsWithPercentages = holdings.map((holding) => ({
    ...holding,
    portfolioPercentage:
      totalPresentValue === 0
        ? 0
        : (holding.presentValue / totalPresentValue) * 100,
  }));

  // Use shared calculation functions
  const sectorSummaries = calculateSectorSummaries(holdingsWithPercentages);
  const portfolioSummary = calculatePortfolioSummary(holdingsWithPercentages);

  return {
    holdings: holdingsWithPercentages,
    sectorSummaries,
    portfolioSummary,
  };
};

export const useDynamicData = (stockNames: string[]) => {
  const queryClient = useQueryClient();
  const [stockDataMap, setStockDataMap] = useState<Record<string, any>>({});
  const [stockLoadingStates, setStockLoadingStates] = useState<
    Record<string, any>
  >({});
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number>(
    Date.now()
  );
  const [allStocksCompleted, setAllStocksCompleted] = useState<boolean>(false);

  // Create a single query key for all stocks
  const queryKey = useMemo(() => {
    const sortedNames = [...stockNames].sort();
    return ["dynamicPortfolioData", sortedNames.join(",")];
  }, [stockNames]);

  // Main query that triggers individual stock fetches
  const {
    data: mainData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      // Update timestamp to trigger the effect
      const timestamp = Date.now();
      setLastFetchTimestamp(timestamp);
      setAllStocksCompleted(false); // Reset completion state when starting new fetch
      return { triggered: true, timestamp };
    },
    enabled: stockNames.length > 0,
    staleTime: 15 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Effect to fetch individual stock data
  useEffect(() => {
    if (stockNames.length === 0) return;

    const fetchStocks = async () => {
      // Initialize loading states
      const newLoadingStates: Record<string, any> = {};
      stockNames.forEach((name) => {
        newLoadingStates[name] = {
          isLoading: true,
          isFetching: false,
          hasData: false,
          error: null,
        };
      });
      setStockLoadingStates(newLoadingStates);

      // Fetch each stock individually
      const promises = stockNames.map(async (stockName, index) => {
        // Add a small delay to make incremental loading visible
        if (index > 0) {
          await new Promise((resolve) => setTimeout(resolve, 200 * index));
        }

        try {
          const data = await fetchIndividualStockData(stockName);

          setStockDataMap((prev) => ({
            ...prev,
            [stockName]: data,
          }));

          setStockLoadingStates((prev) => ({
            ...prev,
            [stockName]: {
              isLoading: false,
              isFetching: false,
              hasData: !!data,
              error: null,
            },
          }));

          return { stockName, data, success: true };
        } catch (error) {
          setStockLoadingStates((prev) => ({
            ...prev,
            [stockName]: {
              isLoading: false,
              isFetching: false,
              hasData: false,
              error,
            },
          }));
          return { stockName, data: null, success: false, error };
        }
      });

      await Promise.allSettled(promises);

      // Mark all stocks as completed
      setAllStocksCompleted(true);
    };

    fetchStocks();
  }, [stockNames, lastFetchTimestamp]); // Use timestamp instead of mainData

  // Calculate portfolio data
  const portfolioDataResult = useMemo(() => {
    return calculatePortfolioData(stockNames, stockDataMap, portfolioData);
  }, [stockNames, stockDataMap]);

  const refreshDynamicData = useCallback(() => {
    // Trigger a refetch of the main query which will trigger the effect
    refetch();
  }, [refetch]);

  const isUpdating = isFetching && !isLoading;

  // Convert stockLoadingStates to array format for component
  const stockLoadingStatesArray = useMemo(() => {
    return stockNames.map((stockName) => ({
      stockName,
      ...stockLoadingStates[stockName],
    }));
  }, [stockNames, stockLoadingStates]);

  // Check if any stocks are still loading
  const isAnyStockLoading = useMemo(() => {
    return Object.values(stockLoadingStates).some((state) => state.isLoading);
  }, [stockLoadingStates]);

  return {
    holdings: portfolioDataResult.holdings,
    sectorSummaries: portfolioDataResult.sectorSummaries,
    portfolioSummary: portfolioDataResult.portfolioSummary,
    isUpdating,
    isLoading: isLoading || isAnyStockLoading,
    error,
    refreshDynamicData,
    stockLoadingStates: stockLoadingStatesArray,
    allStocksCompleted,
  };
};
