import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { of, Subscription } from 'rxjs';
import { LandingPageService } from '../landing-page.service';
import { catchError, switchMap, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppService } from 'src/app/app.service';
import { PortfolioMeta, ReorderData } from 'src/app/interfaces/portfolio';

@Component({
  selector: 'app-reorder',
  templateUrl: './reorder.component.html',
  styleUrls: ['./reorder.component.css'],
})
export class ReorderComponent implements OnInit {
  @Output() reorderStatus = new EventEmitter<string>();
  subscription: Subscription;
  portfolioNames: string[] = [];
  isLoading: boolean = false;

  constructor(
    private landingPageService: LandingPageService,
    private appService: AppService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Subscribing to changes in user portfolios
    this.subscription = this.landingPageService.userPortfolio$.subscribe(
      (portfolio) => (this.portfolioNames = portfolio.map((item) => item.portfolioName))
    );
  }

  onSaveHandler() {
    let finalData: PortfolioMeta[];
    this.isLoading = true;
    this.landingPageService.userPortfolio$
      .pipe(
        take(1),
        switchMap((curData) => {
          const rawData = this.portfolioNames.map((item, i) => {
            if (item !== curData[i].portfolioName) {
              return { portfolioName: item, orderId: i + 1 };
            }
            return { portfolioName: '', orderId: 0 };
          });

          // Check if order is same as previous
          const reorderData = rawData.filter((item) => item.portfolioName !== '');
          if (reorderData.length === 0) return of(null);

          // Update finalData with new orderIds
          reorderData.forEach((data) => {
            const index = curData.findIndex((item) => item.portfolioName === data.portfolioName);
            curData[index].orderId = data.orderId;
          });

          finalData = curData.sort(function (a, b) {
            return a.orderId - b.orderId;
          });
          console.log(reorderData);

          return this.http.post(
            'http://localhost:4280/daron/reorder-portfolio',
            {
              updateData: reorderData,
            },
            { withCredentials: true }
          );
        }),
        catchError((err) => this.appService.handleError(err))
      )
      .subscribe(
        (data) => {
          if (!data) return this.reorderStatus.emit('NOCHANGE');
          this.landingPageService.userPortfolio$.next(finalData);
          this.reorderStatus.emit('COMPLETE');
          this.isLoading = false;
        },
        (err) => {
          this.isLoading = false;
          this.snackBar.open(`Error while reordering portfolio: ${err}`, 'Close', {
            panelClass: 'error-snackbar',
          });
        }
      );
  }

  onCancelHandler() {
    this.reorderStatus.emit('CANCEL');
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.portfolioNames, event.previousIndex, event.currentIndex);
  }
}
