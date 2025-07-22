import { useMemo } from "react";
import {
  Stock,
  PortfolioHolding,
  SectorSummary,
  PortfolioSummary,
  SectorData,
} from "@/types/portfolio";
import {
  mockStocks,
  simulatePriceUpdate,
  portfolioSummary as mockPortfolioSummary,
  sectorData as mockSectorData,
} from "@/data/mockPortfolio";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const fetchPortfolioData = async (): Promise<Stock[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedStocks = mockStocks.map((stock) =>
        simulatePriceUpdate(stock)
      );
      resolve(updatedStocks);
    }, 1000);
  });
};

export const usePortfolio = () => {
  const queryClient = useQueryClient();

  const {
    data: stocks = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery<Stock[]>({
    queryKey: ["portfolioData"],
    queryFn: fetchPortfolioData,
    refetchInterval: 15000, // Refetch every 15 seconds
    initialData: mockStocks, // Use mock data as initial data
    staleTime: 10000, // Data is considered fresh for 10 seconds
  });

  const lastUpdated = useMemo(() => new Date(), [isFetching]); // Update timestamp when fetching starts

  // Calculate portfolio holdings with derived values
  const holdings = useMemo<PortfolioHolding[]>(() => {
    const totalValue = stocks.reduce(
      (sum, stock) => sum + stock.currentPrice * stock.quantity,
      0
    );

    return stocks.map((stock) => {
      const investment = stock.purchasePrice * stock.quantity;
      const presentValue = stock.currentPrice * stock.quantity;
      const gainLoss = presentValue - investment;
      const gainLossPercentage =
        investment === 0 ? 0 : (gainLoss / investment) * 100; // Handle division by zero
      const portfolioPercentage =
        totalValue === 0 ? 0 : (presentValue / totalValue) * 100; // Handle division by zero

      return {
        ...stock,
        investment,
        presentValue,
        gainLoss,
        gainLossPercentage,
        portfolioPercentage,
      };
    });
  }, [stocks]);

  // Group holdings by sector
  const sectorSummaries = useMemo<SectorSummary[]>(() => {
    const sectorMap = new Map<string, PortfolioHolding[]>();

    holdings.forEach((holding) => {
      const existing = sectorMap.get(holding.sector) || [];
      sectorMap.set(holding.sector, [...existing, holding]);
    });

    return Array.from(sectorMap.entries()).map(
      ([sectorName, sectorHoldings]) => {
        const totalInvestment = sectorHoldings.reduce(
          (sum, h) => sum + h.investment,
          0
        );
        const totalPresentValue = sectorHoldings.reduce(
          (sum, h) => sum + h.presentValue,
          0
        );
        const totalGainLoss = totalPresentValue - totalInvestment;
        const gainLossPercentage =
          totalInvestment === 0 ? 0 : (totalGainLoss / totalInvestment) * 100; // Handle division by zero

        return {
          name: sectorName,
          totalInvestment,
          totalPresentValue,
          totalGainLoss,
          gainLossPercentage,
          holdings: sectorHoldings,
        };
      }
    );
  }, [holdings]);

  // Calculate overall portfolio summary
  const portfolioSummary = useMemo<PortfolioSummary>(() => {
    const totalInvestment = holdings.reduce((sum, h) => sum + h.investment, 0);
    const totalPresentValue = holdings.reduce(
      (sum, h) => sum + h.presentValue,
      0
    );
    const totalGainLoss = totalPresentValue - totalInvestment;
    const gainLossPercentage =
      totalInvestment === 0 ? 0 : (totalGainLoss / totalInvestment) * 100; // Handle division by zero

    return {
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      gainLossPercentage,
      lastUpdated,
    };
  }, [holdings, lastUpdated]);

  // Get static sector data from mock data
  const staticSectorData = useMemo<SectorData[]>(() => {
    return mockSectorData;
  }, []);

  // Get static portfolio summary from mock data
  const staticPortfolioSummary = useMemo<PortfolioSummary>(() => {
    return {
      ...mockPortfolioSummary,
      lastUpdated,
    };
  }, [lastUpdated]);

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["portfolioData"] });
  };

  return {
    holdings,
    sectorSummaries,
    portfolioSummary,
    staticSectorData,
    staticPortfolioSummary,
    isUpdating: isFetching, // Use isFetching to indicate updates
    refreshData,
  };
};
