import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AuthService } from 'src/app/views/auth/services/auth.service';
import { PortfolioService } from 'src/app/views/landing-page/portfolio/portfolio.service';
import { AlertsService } from '../alerts/alerts.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private appService: AppService,
    private porfolioService: PortfolioService,
    private alertsService: AlertsService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {}

  public logoutHandler() {
    this.http
      .get('http://localhost:4280/daron/logout', { withCredentials: true })
      .pipe(catchError((err) => this.appService.handleError(err)))
      .subscribe(
        (res) => {
          this.authService.loggedUser = { name: '', email: '' };
          this.authService.isAuthenticated = false;
          this.router.navigate(['/logout']);
        },
        (err) => this.alertsService.displayMessage(err)
      );
  }
}
