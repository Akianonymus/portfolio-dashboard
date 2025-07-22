import { NextResponse } from "next/server";
import { portfolioData } from "@/data/portfolioData";
import {
  PortfolioHolding,
  PortfolioSummary,
  SectorSummary,
} from "@/types/portfolio";

const calculateSectorSummaries = (
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

const calculatePortfolioSummary = (
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

export async function GET() {
  try {
    const holdings: PortfolioHolding[] = portfolioData.map((stock) => {
      const investment = stock.purchasePrice * stock.quantity;

      return {
        ...stock,
        symbol: stock.name,
        exchange: "NSE",
        currentPrice: 0, // Will be populated by dynamic data
        peRatio: 0, // Will be populated by dynamic data
        latestEarnings: {
          period: undefined,
          amount: 0,
        },
        investment,
        presentValue: 0, // Will be calculated when dynamic data arrives
        gainLoss: 0, // Will be calculated when dynamic data arrives
        gainLossPercentage: 0, // Will be calculated when dynamic data arrives
        portfolioPercentage: 0, // Will be calculated when dynamic data arrives
      };
    });

    const sectorSummaries = calculateSectorSummaries(holdings);
    const portfolioSummary = calculatePortfolioSummary(holdings);

    return NextResponse.json({
      success: true,
      data: {
        holdings,
        sectorSummaries,
        portfolioSummary,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Static Portfolio API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch static portfolio data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
