export interface PortfolioTable {
  [key: string]: string;
  ticker: string;
  earningsDate: string;
  price: string;
  beta: string;
  marketCap: string;
  sharesOut: string;
  evToEbidta: string;
  evToRev: string;
  forwardPE: string;
  priceBook: string;
  forwardEps: string;
  pegRatio: string;
  shortRatio: string;
  fcf: string;
  roe: string;
  currentRatio: string;
  debtToEquity: string;
}

export interface PortfolioMeta {
  [key: string]: string | number | string[] | boolean;
  portfolioName: string;
  tickers: string[];
  orderId: number;
}

export interface GetPortfolio {
  [key: string]: string | PortfolioMeta[];
  message: string;
  results: PortfolioMeta[];
}

export interface StockSearch {
  [key: string]: string;
  name: string;
  ticker: string;
}

export interface ReorderData {
  [key: string]: string | number;
  portfolioName: string;
  orderId: number;
}
