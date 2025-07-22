// Portfolio holding data (static data that doesn't change)
export interface PortfolioHoldingData {
  id: string;
  name: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
}

// Stock data with real-time information
export interface Stock extends PortfolioHoldingData {
  symbol: string;
  exchange: string;
  currentPrice: number;
  peRatio: number;
  latestEarnings: {
    period?: string;
    amount: number;
    type?: "per-share" | "total";
  };
}

export interface PortfolioHolding extends Stock {
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
