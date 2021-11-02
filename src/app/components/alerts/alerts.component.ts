import { Component, Input, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { PortfolioService } from 'src/app/views/landing-page/portfolio/portfolio.service';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css'],
})
export class AlertsComponent implements OnInit {
  @Input('msg') msg: string;
  @Input('timeout') timeout: boolean = true;
  @Input('alertClass') alertClass: string = 'alert-default';
  @Input('delay') delay: string = '4s';
  hide: boolean = false;

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    if (this.timeout) {
      setTimeout(() => {
        this.hide = true;
        this.portfolioService.errorMsgs$.pipe(take(1)).subscribe((errMsgs) => {
          errMsgs.splice(0, 1);
          this.portfolioService.errorMsgs$.next(errMsgs);
        });
      }, 5000);
    }
  }

  onCloseHandler() {
    this.hide = true;
  }
}
