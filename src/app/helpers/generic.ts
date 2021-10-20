import { TickerObj } from '../interfaces/generic';

// Convert any[] to ['TSLA', 'MU']
export function tickerConverter(arr: TickerObj[]) {
  return arr.map((obj) => obj.ticker);
}
