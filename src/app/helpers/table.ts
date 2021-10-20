import { Sort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';

// dataSource requires setData() function
export function onSortHandler(sort: Sort, dataArr: any[], dataSource: any) {
  if (!sort.active || sort.direction === '') {
    return;
  }

  // Create a shallow copy instance
  // let dataArr = this.dataTableStocks.slice();
  const sortedData = dataArr.sort((a, b) => {
    let firstValue: any = a[sort.active];
    let secondValue: any = b[sort.active];

    if (typeof firstValue === 'string' && !isNaN(parseFloat(firstValue))) {
      firstValue = parseFloat(firstValue);
      secondValue = parseFloat(secondValue);
    }
    const isAsc = sort.direction === 'asc';
    return compareFunction(firstValue, secondValue, isAsc);
  });
  dataSource.setData(sortedData);
}

export function compareFunction(a: number | string, b: number | string, isAsc: boolean) {
  return (a > b ? 1 : a < b ? -1 : 0) * (isAsc ? 1 : -1);
}
