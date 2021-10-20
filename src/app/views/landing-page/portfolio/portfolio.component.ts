import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

import { ModalComponent } from 'src/app/components/modal/modal.component';

import { PortfolioSource } from './portfolio-source.class';
import { PortfolioService } from './portfolio.service';
import { LandingPageService } from '../landing-page.service';
import { PortfolioMeta } from 'src/app/interfaces/portfolio';
import { storageHandler } from 'src/app/helpers/storage';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
})
export class PortfolioComponent extends PortfolioSource implements OnInit {
  @ViewChild('agGrid') agGrid: AgGridAngular;
  @Input('meta') meta: PortfolioMeta;

  onEdit: boolean = false;
  onAdd: boolean = false;

  constructor(
    public portfolioService: PortfolioService,
    public landingPageService: LandingPageService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    super(portfolioService);
  }

  ngOnInit(): void {
    // Check if portfolio data exists in local storage, else fetch from API
    this.isLoading = true;
    storageHandler('LOCAL', this.meta.title).subscribe(
      (storedData) => {
        const { timestamp, data } = JSON.parse(storedData);
        this.timestamp = new Date(timestamp);
        this.portfolioTable$.next(data);
        this.isLoading = false;
      },
      (err) => {
        setTimeout(() => {
          const resultObs$ = this.portfolioService.fetchDataArr(this.meta.tickers);
          this.displayPortfolioTable(resultObs$, true, this.meta.title);
        }, this.meta.delayMultiplier * 1500);
      }
    );
  }

  onRefreshHandler() {
    const resultObs$ = this.portfolioService.fetchDataArr(this.meta.tickers);
    this.displayPortfolioTable(resultObs$, true, this.meta.title);
  }

  // Adding new stocks to portfolio
  onAddHandler(event: any[]) {
    // Function runs whenever user re-searches another stock upon re-init
    // Should only be triggered when there is a new item in event
    if (event.length === 0) return;

    // Mapping new items to table format
    const addedItems = event.map((item) => this.portfolioService.mapData(item));

    this.portfolioTable$.pipe(take(1)).subscribe((prevData) => {
      // Check if items to add already exists in portfolio
      const itemExists = addedItems.map((newItem) =>
        prevData.filter((oldItem) => oldItem.ticker === newItem.ticker)
      );
      if (itemExists[0].length > 0) {
        console.log('exists!', itemExists);
        return;
      }

      // Add new items to existing table
      const updatedData = [...prevData, ...addedItems];
      localStorage.setItem(
        this.meta.title,
        JSON.stringify({ timestamp: new Date(), data: updatedData })
      );
      this.portfolioTable$.next(updatedData);
    });
  }

  // To select specific stocks from portfolio
  onEditHandler() {
    this.onEdit = true;
  }

  // To delete selected stocks from portfolio
  onSaveHandler(): void {
    const selectedNodes = this.agGrid.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    console.log(selectedData);

    if (selectedData.length === 0) {
      this._snackBar.open('No items selected!', 'Close', { duration: 3000 });
      return;
    }

    this.portfolioTable$.pipe(take(1)).subscribe((data) => {
      const updatedData = data.filter((item) => !selectedData.includes(item));
      this.portfolioTable$.next(updatedData);
      this.onEdit = false;
      localStorage.setItem(
        this.meta.title,
        JSON.stringify({ timestamp: new Date(), data: updatedData })
      );
      this._snackBar.open('Portfolio successfully updated!', 'Close', { duration: 3000 });
    });
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

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (!result) return;
      this.landingPageService.userPortfolio$.pipe(take(1)).subscribe((data) => {
        const index = data.findIndex((item) => item.title === this.meta.title);
        data.splice(index, 1);
        this.landingPageService.userPortfolio$.next(data);
      });
    });
  }
}
