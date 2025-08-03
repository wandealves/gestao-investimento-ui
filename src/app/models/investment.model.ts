export enum AssetType {
  STOCK = 'STOCK',
  REIT = 'REIT',
  FIXED_INCOME = 'FIXED_INCOME',
  CRYPTO = 'CRYPTO',
  FUND = 'FUND'
}

export enum DividendType {
  DIVIDEND = 'DIVIDEND',
  INTEREST_ON_EQUITY = 'INTEREST_ON_EQUITY',
  REIT_INCOME = 'REIT_INCOME',
  FIXED_INCOME_COUPON = 'FIXED_INCOME_COUPON'
}

export interface Investment {
  id: string;
  name: string;
  ticker: string;
  assetType: AssetType;
  purchasePrice: number;
  quantity: number;
  purchaseDate: Date;
  currentPrice?: number;
  sector?: string;
  notes?: string;
}

export interface Dividend {
  id: string;
  investmentId: string;
  type: DividendType;
  amount: number;
  receivedDate: Date;
  exDividendDate?: Date;
  paymentDate?: Date;
}

export interface Portfolio {
  investments: Investment[];
  dividends: Dividend[];
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  totalDividends: number;
}

export interface AssetAllocation {
  assetType: AssetType;
  value: number;
  percentage: number;
  count: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  unrealizedGain: number;
  unrealizedGainPercentage: number;
  dividendYield: number;
  monthlyDividends: number;
  assetAllocation: AssetAllocation[];
}