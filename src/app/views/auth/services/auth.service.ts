import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';
import { storageHandler } from 'src/app/helpers/storage';
import { LoggedUser } from 'src/app/interfaces/generic';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedUser = new BehaviorSubject<LoggedUser>({ name: '', email: '' });
  isAuthenticated: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  public authenticateUserHandler(email: string, password: string) {
    const headers = new HttpHeaders({
      Authorization: btoa('Basic ' + `${email}:${password}`),
    });
    return this.http
      .get<LoggedUser>('http://127.0.0.1:4280/auth/login', {
        withCredentials: true,
        headers: headers,
      })
      .pipe(
        catchError((err) => this.handleError(err)),
        tap((response) => {
          this.loggedUser.next({
            email: response.email,
            name: response.name,
          });
          sessionStorage.setItem('userPayload', JSON.stringify(this.loggedUser));
        })
      );
  }

  private handleError(errRes: HttpErrorResponse) {
    let errorMsg = 'An unknown error occurred.';
    if (!errRes.error || !errRes.error.error) {
      return throwError(errorMsg);
    }

    switch (errRes.error.error) {
      case 'LOGIN_USER_NOT_EXIST':
        errorMsg = 'No existing credentials found in database.';
        break;
      case 'LOGIN_INVALID_PASSWORD':
        errorMsg = 'Password is invalid.';
        break;
    }
    return throwError(errorMsg);
  }

  public logoutHandler() {
    this.loggedUser.next({ name: '', email: '' });
    sessionStorage.removeItem('userPayload');
    this.router.navigate(['/login']);
  }

  public autoLoginHandler() {
    storageHandler('SESSION', 'userPayload').subscribe(
      (item) => {
        this.loggedUser.next(JSON.parse(item));
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
