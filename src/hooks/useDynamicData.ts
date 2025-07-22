import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { portfolioApi, withRetry } from "@/lib/services/api";
import {
  PortfolioHolding,
  SectorSummary,
  PortfolioSummary,
} from "@/types/portfolio";

const fetchDynamicPortfolioData = async (
  stockNames: string[]
): Promise<{
  holdings: PortfolioHolding[];
  sectorSummaries: SectorSummary[];
  portfolioSummary: PortfolioSummary;
}> => {
  if (stockNames.length === 0) {
    return {
      holdings: [],
      sectorSummaries: [],
      portfolioSummary: {
        totalInvestment: 0,
        totalPresentValue: 0,
        totalGainLoss: 0,
        gainLossPercentage: 0,
        lastUpdated: new Date(),
      },
    };
  }

  try {
    const data = await withRetry(() =>
      portfolioApi.getDynamicPortfolio(stockNames)
    );
    return {
      holdings: data.holdings,
      sectorSummaries: data.sectorSummaries,
      portfolioSummary: data.portfolioSummary,
    };
  } catch (error) {
    console.error("Failed to fetch dynamic portfolio data:", error);
    // Return empty data instead of throwing to prevent undefined
    return {
      holdings: [],
      sectorSummaries: [],
      portfolioSummary: {
        totalInvestment: 0,
        totalPresentValue: 0,
        totalGainLoss: 0,
        gainLossPercentage: 0,
        lastUpdated: new Date(),
      },
    };
  }
};

export const useDynamicData = (stockNames: string[]) => {
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => {
    const sortedNames = [...stockNames].sort();
    return ["dynamicPortfolioData", sortedNames.join(",")];
  }, [stockNames]);

  const {
    data: portfolioData,
    isLoading,
    isFetching,
    error,
    refetch: refetchDynamicData,
  } = useQuery({
    queryKey,
    queryFn: () => fetchDynamicPortfolioData(stockNames),
    enabled: stockNames.length > 0,
    refetchInterval: 15000, // Auto-refresh every 30 seconds
    staleTime: 15 * 1000, // Consider data stale after 15 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const refreshDynamicData = useCallback(() => {
    // Invalidate all dynamic portfolio data queries
    queryClient.invalidateQueries({
      queryKey: ["dynamicPortfolioData"],
      exact: false,
    });
  }, [queryClient]);

  const isUpdating = isFetching && !isLoading;

  return {
    holdings: portfolioData?.holdings || [],
    sectorSummaries: portfolioData?.sectorSummaries || [],
    portfolioSummary: portfolioData?.portfolioSummary || {
      totalInvestment: 0,
      totalPresentValue: 0,
      totalGainLoss: 0,
      gainLossPercentage: 0,
      lastUpdated: new Date(),
    },
    isUpdating,
    isLoading,
    error,
    refreshDynamicData,
  };
};
