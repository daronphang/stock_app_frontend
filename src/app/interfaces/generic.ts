export interface SearchEvent {
  [key: string]: string | any[];
  input: string;
  results: any[];
}

export interface TickerObj {
  [key: string]: string;
  ticker: string;
}
