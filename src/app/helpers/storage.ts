import { Observable, of, throwError } from 'rxjs';

// NOTE
// Handler for retrieving items or adding items to array
// error/data are stored in an Observable<string>
// items are then parsed when subscribed

export function storageHandler(
  loc: string,
  key: string,
  addItem: any = '',
  errMsg: string = '',
  isArray: boolean = false
): Observable<string> {
  let item: string | null;

  // set new items/replace existing items to local/session storage
  loc === 'LOCAL' ? (item = localStorage.getItem(key)) : (item = sessionStorage.getItem(key));

  // Throw error if item does not exist
  if (!item && !addItem) throwError(errMsg);

  // Retrieve item from local/session storage only (need to parse when subscribing)
  if (item && !addItem) {
    return of(item);
  }

  // Adding items to an existing array ONLY
  if (item && addItem && isArray) {
    const parsedItem = JSON.parse(item);
    if (!Array.isArray(parsedItem))
      return throwError('Stored item is not an array. Unable to add provided item');

    parsedItem.push(addItem);
    if (loc === 'LOCAL') localStorage.setItem(key, JSON.stringify(parsedItem));
    if (loc === 'SESSION') sessionStorage.setItem(key, JSON.stringify(parsedItem));
    return of(`${addItem} added successfully to ${loc} storage`);
  }

  // Fallback
  return throwError('Arguments specified are invalid');
}
