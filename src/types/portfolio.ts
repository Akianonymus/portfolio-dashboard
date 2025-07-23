// Portfolio holding data (static data that doesn't change)
export interface PortfolioHoldingData {
  id: string;
  name: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
}

export interface PortfolioHolding extends PortfolioHoldingData {
  symbol: string;
  exchange: string;
  currentPrice: number;
  peRatio: number;
  latestEarnings: {
    period?: string;
    amount: number;
    type?: "per-share" | "total";
  };
  investment: number;
  presentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  portfolioPercentage: number;
}

export interface SectorSummary {
  name: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  gainLossPercentage: number;
  holdings: PortfolioHolding[];
}

export interface PortfolioSummary {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  gainLossPercentage: number;
  lastUpdated: Date;
}
