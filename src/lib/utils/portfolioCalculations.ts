import {
  PortfolioHolding,
  PortfolioSummary,
  SectorSummary,
} from "@/types/portfolio";

export const calculateSectorSummaries = (
  holdings: PortfolioHolding[]
): SectorSummary[] => {
  const sectorMap = new Map<string, PortfolioHolding[]>();

  holdings.forEach((holding) => {
    const existing = sectorMap.get(holding.sector) || [];
    sectorMap.set(holding.sector, [...existing, holding]);
  });

  return Array.from(sectorMap.entries()).map(([sectorName, sectorHoldings]) => {
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
      totalInvestment === 0 ? 0 : (totalGainLoss / totalInvestment) * 100;

    return {
      name: sectorName,
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      gainLossPercentage,
      holdings: sectorHoldings,
    };
  });
};

export const calculatePortfolioSummary = (
  holdings: PortfolioHolding[]
): PortfolioSummary => {
  const totalInvestment = holdings.reduce((sum, h) => sum + h.investment, 0);
  const totalPresentValue = holdings.reduce(
    (sum, h) => sum + h.presentValue,
    0
  );
  const totalGainLoss = totalPresentValue - totalInvestment;
  const gainLossPercentage =
    totalInvestment === 0 ? 0 : (totalGainLoss / totalInvestment) * 100;

  return {
    totalInvestment,
    totalPresentValue,
    totalGainLoss,
    gainLossPercentage,
    lastUpdated: new Date(),
  };
};
