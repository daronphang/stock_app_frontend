import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { BehaviorSubject, fromEvent, of, Subscription } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { SearchEvent } from 'src/app/interfaces/generic';
import { PortfolioService } from '../../views/landing-page/portfolio/portfolio.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input('originalArr') originalArr: any[] = [];
  @Input('searchClass') searchClass: string = 'search';
  @Input('showIcon') showIcon: boolean = true;
  @Output() results = new EventEmitter<SearchEvent>();
  @ViewChild('searchBox') searchBox: ElementRef;

  input: string; // Needed as InputEvent fires on every key trigger
  inputSub: Subscription;
  autocompleteResults$ = new BehaviorSubject<any[]>([]);
  stockExchanges: string[] = ['NMS', 'NYQ', 'SES', 'HKG'];

  constructor(private http: HttpClient, private portfolioService: PortfolioService) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    let takeValue = 0;
    this.inputSub = fromEvent(this.searchBox.nativeElement, 'input')
      .pipe(
        map((e) => this.input),
        debounceTime(1000),
        distinctUntilChanged()
      )
      .pipe(
        switchMap((input: string) => {
          const value = input.trim().toLowerCase();

          // For landing page only to trigger loading component
          this.results.emit({ results: [], input: 'SEARCHING' });

          // return original array of items if input is empty
          if (!value) {
            return of(null); // will be checked in subscribe
          }
          return this.fetchAutocomplete(value);
        }),
        map((autocompleteData: any) => {
          // If user clears searchbox
          if (!autocompleteData) return [];

          // Check if no results are returned
          if (autocompleteData.count === 0) return [];

          let quotes: any[] = autocompleteData.quotes;
          // Clean results to include stock exchanges only
          quotes = quotes.map((item) => {
            if (!this.stockExchanges.includes(item.exchange)) return null;
            return item.symbol;
            // return {
            //   name: item.shortname,
            //   ticker: item.symbol,
            // };
          });

          // Filter null values
          quotes = quotes.filter((item) => item);
          return quotes;
        }),
        switchMap((tickers: string[]) => {
          this.results.emit({ results: [], input: 'SEARCHING' });

          if (tickers.length === 0) {
            return of([]);
          }

          // Fetch 2nd API call to get data for each stock
          takeValue = Math.ceil(tickers.length / 5);
          return this.portfolioService.fetchDataArr(tickers);
        }),
        tap((results) => {
          // This tap is needed to end 2nd API subscription using take() method
          // input subscription SHOULD NOT END as it still needs to read changes to input
          // results are emitted in chunks; autocompleteHandler will emit value in final()
          console.log(results);
          this.autocompleteResults$.next(results);
          this.onAutocompleteHandler(takeValue);
        })
      )
      .subscribe(
        (results) => {},
        (err) => {
          this.portfolioService.errorMsgs$.pipe(take(1)).subscribe((msgs) => {
            this.portfolioService.errorMsgs$.next([
              ...msgs,
              `An error occured while searching: ${err}`,
            ]);
          });
          this.results.emit({ results: [], input: 'DISPLAY_ERROR' });
        }
      );
  }

  ngOnDestroy() {
    this.inputSub.unsubscribe();
  }

  fetchAutocomplete(value: string) {
    const headers = {
      'x-rapidapi-host': 'yh-finance.p.rapidapi.com',
      'x-rapidapi-key': '9484f772fbmsh9f388e9e7326eddp1f626ejsnc3ef33d3f125',
    };

    const response$ = this.http.get(`https://yh-finance.p.rapidapi.com/auto-complete?q=${value}`, {
      headers: new HttpHeaders(headers),
    });
    return response$.pipe(catchError((err) => this.portfolioService.handleError(err, value)));
  }

  onAutocompleteHandler(takeValue: number) {
    const finalResults: any[] = [];

    this.autocompleteResults$.pipe(take(takeValue)).subscribe(
      (data) => {
        if (data.length === 0) return this.results.emit({ results: [], input: this.input });
        finalResults.push(...data);
      },
      (err) => {},
      () => {
        this.results.emit({ results: finalResults, input: this.input });
      }
    );
  }

  onSearchHandler(input: string) {
    const value = input.trim().toLowerCase();
    let filteredArr: any[] = [];

    // return original array of items if input is empty
    if (!value) {
      return this.results.emit({ results: this.originalArr, input: ' hello' });
    }

    // Filters original array based on user input
    // For arrays containing values only i.e. ['hello awesome', 'hello world awesome']
    if (typeof this.originalArr[0] !== 'object') {
      this.originalArr.forEach((item) => {
        // Push item if user types in full name
        if (
          this.originalArr.filter(
            (fullName) => fullName.toString().toLowerCase().indexOf(value) === 0
          ).length > 0
        ) {
          filteredArr.push(item);
          return;
        }

        // Push item if user types in partial name
        let stringArr: string[] = item.toString().toLowerCase().split(' '); // ['hello', 'world', 'awesome']
        if (stringArr.filter((word) => word.indexOf(value) === 0).length > 0) {
          filteredArr.push(item);
        }
      });
    }

    // For arrays containing objects i.e. [{hello: "hello world"}]
    else {
      this.originalArr.forEach((obj) => {
        let entries = Object.entries(obj);
        for (const [key, value] of entries) {
          // Push item if user types in full name
          if (obj[key].toString().toLowerCase().indexOf(value) === 0) {
            filteredArr.push(obj);
            break;
          }

          let stringArr: string[] = obj[key].toString().toLowerCase().split(' ');
          if (stringArr.filter((word) => word.indexOf(this.input) === 0).length > 0) {
            filteredArr.push(obj);
            break;
          }
        }
      });
    }
    return this.results.emit({ results: filteredArr, input: this.input });
  }
}
