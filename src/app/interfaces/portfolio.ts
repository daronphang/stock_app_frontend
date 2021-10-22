export interface PortfolioTable {
  [key: string]: string;
  ticker: string;
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
  title: string;
  tickers: string[];
  // delayMultiplier: number;
  // storage: boolean;
}

export interface StockSearch {
  [key: string]: string;
  name: string;
  ticker: string;
}

export interface PopoverSearch {
  [key: string]: string;
  ticker: string;
  name: string;
}
