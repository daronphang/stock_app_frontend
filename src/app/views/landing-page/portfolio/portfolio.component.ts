import { Component, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, switchMap, take, takeUntil, tap, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

import { ModalComponent } from 'src/app/components/modal/modal.component';

import { PortfolioSource } from './portfolio-source.class';
import { PortfolioService } from './portfolio.service';
import { LandingPageService } from '../landing-page.service';
import { PortfolioMeta, PortfolioTable } from 'src/app/interfaces/portfolio';
import { storageHandler } from 'src/app/helpers/storage';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
})
export class PortfolioComponent extends PortfolioSource implements OnInit {
  @ViewChild('agGrid') agGrid: AgGridAngular;
  @Input('meta') meta: PortfolioMeta;
  @Input('dataSource') dataSource$ = new BehaviorSubject<any[]>([]);
  @Input('onCreate') onCreate: boolean;
  @Output() deletePortfolio = new EventEmitter<string>();
  onEdit: boolean = false;
  onAdd: boolean = false;
  newPortfolioName: string;
  sameNameError: boolean = false;

  // Observable to manually complete dataSource$ in takeUntil()
  notifier$ = new Subject();

  constructor(
    private appService: AppService,
    public portfolioService: PortfolioService,
    public landingPageService: LandingPageService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private http: HttpClient
  ) {
    super(portfolioService, snackBar);
  }

  ngOnInit(): void {
    // If portfolio is newly created, to fetch stock data
    if (this.onCreate) {
      return this.onRefreshHandler();
    }

    // Check if portfolio data exists in session storage, else fetch from API
    this.isLoading = true;

    storageHandler('SESSION', this.meta.portfolioName).subscribe(
      (storedData) => {
        const { timestamp, data } = JSON.parse(storedData);
        this.timestamp = new Date(timestamp);
        this.portfolioTable$.next(data);
        this.isLoading = false;
      },
      (err) => {
        const finalData: any[] = [];
        this.dataSource$.pipe(takeUntil(this.notifier$)).subscribe(
          (data) => {
            if (data[0] === 'completed') this.notifier$.next(true);

            const cleanData = data.filter((item) => item);
            cleanData.forEach((stock) => {
              if (this.meta.tickers.includes(stock.symbol)) {
                const mappedData = this.portfolioService.mapData(stock);
                finalData.push(mappedData);
              }
            });
            if (finalData.length === this.meta.tickers.length) {
              this.notifier$.next(true);
            }
          },
          (err) => {
            // Error will be displayed in alerts
            this.isLoading = false;
          },
          () => {
            this.onFinalize(finalData, true, this.meta.portfolioName);
          }
        );
      }
    );
  }

  onRefreshHandler() {
    const resultObs$ = this.portfolioService.fetchDataArr(this.meta.tickers);
    const takeValue = Math.ceil(this.meta.tickers.length / 5);
    this.displayPortfolioTable(
      resultObs$,
      takeValue,
      [],
      true,
      this.meta.portfolioName,
      'Portfolio updated!',
      'Unable to refresh portfolio'
    );
  }

  // Adding new stocks to portfolio
  onAddHandler(event: string[]) {
    // Function runs whenever user re-searches another stock upon re-init
    // Should only be triggered when there is a new item in event
    // Filter duplicate tickers existing in portfolio
    const addedTickers = event.filter((ticker) => !this.meta.tickers.includes(ticker));
    if (event.length === 0 || addedTickers.length === 0) return;

    this.isLoading = true;

    // Add orderIds of new tickers
    const newTickers = addedTickers.map((ticker, i) => {
      const obj = {
        ticker: ticker,
        orderId: this.meta.tickers.length + i + 1,
      };
      return obj;
    });

    // Add new tickers to database
    this.http
      .post(
        'http://localhost:4280/daron/add-portfolio',
        {
          portfolioName: this.meta.portfolioName,
          newTickers: newTickers,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        catchError((err) => this.appService.handleError(err)),
        switchMap((res) => {
          return this.portfolioTable$.pipe(take(1));
        })
      )
      .subscribe(
        (originalData) => {
          this.isLoading = false;
          this.meta.tickers.push(...addedTickers);
          const addedData$ = this.portfolioService.fetchDataArr(addedTickers);
          const takeValue = Math.ceil(newTickers.length / 5);
          this.displayPortfolioTable(
            addedData$,
            takeValue,
            originalData,
            true,
            this.meta.portfolioName,
            'Successfully added tickers!',
            'Unable to add new tickers:'
          );
        },
        (err) => {
          this.isLoading = false;
          this.snackBar.open(`Error while adding tickers: ${err}`, 'Close', {
            panelClass: 'error-snackbar',
          });
        }
      );
  }

  // To select specific stocks from portfolio
  onEditHandler() {
    this.onEdit = true;
  }

  // To delete selected stocks or sort order from portfolio
  onSaveHandler(): void {
    if (this.newPortfolioName === this.meta.portfolioName) {
      this.sameNameError = true;
      return;
    }
    let newName: string;
    !this.newPortfolioName
      ? (newName = this.meta.portfolioName)
      : (newName = this.newPortfolioName);

    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const deletedData = selectedNodes.map((node) => node.data);
    const deletedTickers = deletedData.map((item) => item.ticker);

    // If user reorders row
    let rowData: PortfolioTable[] = [];
    this.gridApi.forEachNode((node) => rowData.push(node.data));

    const updatedData = rowData.filter((item) => !deletedData.includes(item));
    const updatedTickers = updatedData.map((item) => item.ticker);

    this.isLoading = true;

    this.http
      .post(
        'http://localhost:4280/daron/update-portfolio',
        {
          portfolioName: this.meta.portfolioName,
          newPortfolioName: newName,
          delTickers: deletedTickers,
          tickers: updatedTickers,
        },
        {
          withCredentials: true,
        }
      )
      .pipe(
        catchError((err) => this.appService.handleError(err)),
        switchMap((res) => this.landingPageService.userPortfolio$.pipe(take(1)))
      )
      .subscribe(
        (data) => {
          this.isLoading = false;
          // Update name in userPortfolio$
          const updateIndex = data.findIndex(
            (item) => item.portfolioName === this.meta.portfolioName
          );
          data[updateIndex].portfolioName = newName;
          this.landingPageService.userPortfolio$.next(data);
          // Update tickers for refreshing
          this.meta.tickers = updatedTickers;
          this.portfolioTable$.next(updatedData);
          sessionStorage.setItem(
            newName,
            JSON.stringify({ timestamp: new Date(), data: updatedData })
          );
          this.snackBar.open('Portfolio updated!', 'Close', {
            panelClass: 'success-snackbar',
            duration: 5000,
          });
        },
        (err) => {
          this.isLoading = false;
          this.snackBar.open(`Unable to update portfolio: ${err}`, 'Close', {
            panelClass: 'error-snackbar',
          });
        },
        () => {
          this.onEdit = false;
        }
      );
  }

  // Cancel any editing performed by user
  onCancelHandler() {
    this.onEdit = false;
  }

  // To delete entire portfolio
  onDeletePortfolioHandler() {
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '350px',
      data: {
        title: 'Confirmation',
        content: `Do you want to delete ${this.meta.title} portfolio?`,
        actions: 'confirm',
        default: true,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(
        switchMap((result) => {
          // If user changes decision to not delete
          if (!result) return of(null);
          return this.landingPageService.userPortfolio$.pipe(take(1));
        }),
        switchMap((data) => {
          if (!data) return of(null);
          this.isLoading = true;
          const delIndex = data.findIndex((item) => item.portfolioName === this.meta.portfolioName);
          const updateData = data.reduce((result: PortfolioMeta[], cur, i) => {
            if (i > delIndex) {
              cur.orderId -= 1;
              result.push(cur);
            }
            return result;
          }, []);
          console.log(updateData);

          return this.http.post(
            'http://localhost:4280/daron/delete-portfolio',
            {
              delPortfolioName: this.meta.portfolioName,
              updateList: updateData,
            },
            {
              withCredentials: true,
            }
          );
        }),
        catchError((err) => this.appService.handleError(err))
      )
      .subscribe(
        (res) => {
          this.isLoading = false;
          this.onEdit = false;
          this.deletePortfolio.emit(this.meta.portfolioName);
        },
        (err) => {
          this.isLoading = false;
          this.snackBar.open(`Unable to delete portfolio: ${err}`, 'Close', {
            panelClass: 'error-snackbar',
          });
        }
      );
  }

  onKeyPressEvent(event: string) {
    if (event === 'Escape') {
      this.onEdit = false;
    }
  }
}
