import { useCallback } from "react";
import {
  PortfolioHolding,
  SectorSummary,
  PortfolioSummary,
} from "@/types/portfolio";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { portfolioApi, withRetry } from "@/lib/services/api";

// Fetch static portfolio data (no external API calls)
const fetchStaticPortfolioData = async (): Promise<{
  holdings: PortfolioHolding[];
  sectorSummaries: SectorSummary[];
  portfolioSummary: PortfolioSummary;
}> => {
  try {
    const data = await withRetry(() => portfolioApi.getStaticPortfolio());
    return {
      holdings: data.holdings,
      sectorSummaries: data.sectorSummaries,
      portfolioSummary: data.portfolioSummary,
    };
  } catch (error) {
    console.error("Failed to fetch static portfolio data:", error);
    throw error;
  }
};

export const useStaticPortfolio = () => {
  const queryClient = useQueryClient();

  const {
    data: portfolioData,
    isLoading,
    isFetching,
    error,
    refetch: refetchStaticPortfolio,
  } = useQuery({
    queryKey: ["staticPortfolioData"],
    queryFn: fetchStaticPortfolioData,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const holdings = portfolioData?.holdings || [];
  const sectorSummaries = portfolioData?.sectorSummaries || [];
  const portfolioSummary = portfolioData?.portfolioSummary || {
    totalInvestment: 0,
    totalPresentValue: 0,
    totalGainLoss: 0,
    gainLossPercentage: 0,
    lastUpdated: new Date(),
  };

  const refreshStaticPortfolio = useCallback(() => {
    // Invalidate the static portfolio data cache
    queryClient.invalidateQueries({
      queryKey: ["staticPortfolioData"],
      exact: true,
    });
  }, [queryClient]);

  const isUpdating = isFetching && !isLoading;

  return {
    holdings,
    sectorSummaries,
    portfolioSummary,
    isUpdating,
    isLoading,
    error,
    refreshStaticPortfolio,
  };
};
