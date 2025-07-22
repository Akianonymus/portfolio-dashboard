import { NextRequest, NextResponse } from "next/server";
import { getBatchStockDataByName } from "@/lib/services/finance";
import { portfolioData } from "@/data/portfolioData";
import {
  PortfolioHolding,
  PortfolioSummary,
  SectorSummary,
} from "@/types/portfolio";

const processAllStocks = async (stockNames: string[]) => {
  const stockPromises = stockNames.map(async (name) => {
    return getBatchStockDataByName([name]).then((results) => results[0]);
  });

  const results = await Promise.allSettled(stockPromises);

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      // Add placeholder data for failed requests
      return {
        name: stockNames[index],
        success: false,
        data: {
          symbol: stockNames[index],
          exchange: "NSE",
          currentPrice: 0,
          peRatio: 0,
          latestEarnings: {
            quarterly: [],
          },
        },
        data2: {
          eps: 0,
          epsPeriod: undefined,
        },
        error: result.reason?.message || "Failed to fetch data",
      };
    }
  });
};

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stockNamesParam = searchParams.get("stocks");

    if (!stockNamesParam) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing stocks parameter",
          message: "Please provide stocks parameter as comma-separated list",
        },
        { status: 400 }
      );
    }

    const stockNames = stockNamesParam
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    if (stockNames.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid stock names provided",
          message: "Please provide at least one valid stock name",
        },
        { status: 400 }
      );
    }

    const results = await processAllStocks(stockNames);

    const dynamicData: Record<string, any> = {};

    // Ensure we always return data for all requested stocks
    stockNames.forEach((name) => {
      if (!dynamicData[name]) {
        dynamicData[name] = {
          symbol: name,
          exchange: "NSE",
          currentPrice: 0,
          peRatio: 0,
          latestEarnings: {
            period: undefined,
            amount: 0,
          },
        };
      }
    });

    results.forEach((result) => {
      const stockName = result.name;

      if (result?.success && result.data) {
        let earnings = 0;
        let earningsPeriod = undefined;
        let earningsType: "per-share" | "total" | undefined = undefined;

        if (result.data2 && result.data2?.eps) {
          earnings = +result.data2.eps;
          earningsPeriod = result.data2.epsPeriod;
          earningsType = "per-share";
        } else {
          if (
            result.data.latestEarnings &&
            result.data.latestEarnings.quarterly &&
            result.data.latestEarnings.quarterly.length > 0
          ) {
            earningsType = "total";
            // Sort quarterly by year and quarter, then take the latest
            const parseQuarter = (q: string) => {
              const match = q.match(/^(\d)Q(\d{4})$/);
              if (match) {
                return {
                  year: parseInt(match[2]),
                  quarter: parseInt(match[1]),
                };
              }
              return { year: 0, quarter: 0 };
            };

            const sortedQuarterly = [
              ...result.data.latestEarnings.quarterly,
            ].sort((a, b) => {
              const aQ = parseQuarter(a.date);
              const bQ = parseQuarter(b.date);
              if (aQ.year !== bQ.year) {
                return bQ.year - aQ.year;
              }
              return bQ.quarter - aQ.quarter;
            });

            const latestQuarter = sortedQuarterly[0];
            earningsPeriod = latestQuarter.date;
            earnings = latestQuarter.earnings;
          }
        }

        dynamicData[stockName] = {
          symbol: result.data.symbol || stockName,
          exchange: result.data.exchange || "NSE",
          currentPrice: result.data.currentPrice || 0,
          peRatio: result.data.peRatio || 0,
          latestEarnings: {
            period: earningsPeriod,
            amount: earnings,
            type: earningsType,
          },
        };
      } else {
        // Fallback data for failed requests
        dynamicData[stockName] = {
          symbol: stockName,
          exchange: "NSE",
          currentPrice: 0,
          peRatio: 0,
          latestEarnings: {
            period: undefined,
            amount: 0,
          },
        };
      }
    });

    const holdings: PortfolioHolding[] = portfolioData.map((stock) => {
      const investment = stock.purchasePrice * stock.quantity;
      const dynamicInfo = dynamicData[stock.name];

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

    const sectorSummaries = calculateSectorSummaries(holdingsWithPercentages);
    const portfolioSummary = calculatePortfolioSummary(holdingsWithPercentages);

    return NextResponse.json({
      success: true,
      data: {
        holdings: holdingsWithPercentages,
        sectorSummaries,
        portfolioSummary,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Dynamic Portfolio API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dynamic portfolio data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
