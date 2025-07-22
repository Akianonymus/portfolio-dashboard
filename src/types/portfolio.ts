export interface Stock {
  id: string;
  name: string;
  symbol: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
  exchange: "NSE" | "BSE";
  currentPrice: number;
  peRatio: number;
  latestEarnings: string;
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

// New interfaces for the enhanced portfolio data
export interface SectorData {
  name: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  gainLossPercentage: number;
  portfolioPercentage: number;
}

export interface PortfolioData {
  stocks: Stock[];
  summary: PortfolioSummary;
  sectors: SectorData[];
}
