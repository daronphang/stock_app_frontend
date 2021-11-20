import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { AppService } from 'src/app/app.service';
import { LoggedUser, LoginResponse } from 'src/app/interfaces/auth';
import { PortfolioService } from '../../landing-page/portfolio/portfolio.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loggedUser: LoggedUser = { name: '', email: '' };
  isAuthenticated: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private appService: AppService,
    private portfolioService: PortfolioService
  ) {}

  public authenticateUserHandler(email: string, password: string) {
    const headers = new HttpHeaders({
      Authorization: btoa('Basic ' + `${email}:${password}`),
    });
    return this.http
      .get<LoginResponse>('http://localhost:4280/daron/auth/login', {
        withCredentials: true,
        headers: headers,
      })
      .pipe(
        catchError((err) => this.appService.handleError(err)),
        tap((response) => {
          this.loggedUser = {
            email: response.email,
            name: response.name,
          };
          this.isAuthenticated = true;
        })
      );
  }

  public signupHandler(formValue: any) {
    return this.http
      .post('http://localhost:4280/daron/auth/signup', formValue, {
        withCredentials: true,
      })
      .pipe(catchError((err) => this.appService.handleError(err)));
  }

  public autoLoginHandler() {
    return this.http
      .get<LoginResponse>('http://localhost:4280/daron/verify-logged-status', {
        withCredentials: true,
      })
      .pipe(
        catchError((err) => {
          this.isAuthenticated = false;
          return of(false);
        }),
        map((res) => {
          if (typeof res === 'object') {
            const user = res;
            delete user.message;
            this.isAuthenticated = true;
            this.loggedUser = user;
            return true;
          }
          return this.router.createUrlTree(['/login']);
        })
      );
  }
}
