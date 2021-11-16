import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor() {}

  handleError(err: HttpErrorResponse) {
    if (!err.error && !err.error.error) return throwError('An unknown error occurred.');
    if (!err.error.error) return throwError(err.message);
    return throwError(err.error.message);
  }
}
