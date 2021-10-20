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
import { from, fromEvent, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SearchEvent } from 'src/app/interfaces/generic';

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
  inputValue: string;
  subscription: Subscription;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.subscription = fromEvent(this.searchBox.nativeElement, 'input')
      .pipe(
        map((e) => this.inputValue),
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe((input) => this.onSearchHandler(input));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onSearchHandler(input: string) {
    const filteredValue = input.trim().toLowerCase();
    let filteredArr: any[] = [];

    // return original array of items if input is empty
    if (!filteredValue) {
      return this.results.emit({ results: this.originalArr, input: this.inputValue });
    }

    // Filters original array based on user input
    // For arrays containing values only i.e. ['hello awesome', 'hello world awesome']
    if (typeof this.originalArr[0] !== 'object') {
      this.originalArr.forEach((item) => {
        // Push item if user types in full name
        if (
          this.originalArr.filter(
            (fullName) => fullName.toString().toLowerCase().indexOf(filteredValue) === 0
          ).length > 0
        ) {
          filteredArr.push(item);
          return;
        }

        // Push item if user types in partial name
        let stringArr: string[] = item.toString().toLowerCase().split(' '); // ['hello', 'world', 'awesome']
        if (stringArr.filter((word) => word.indexOf(filteredValue) === 0).length > 0) {
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
          if (obj[key].toString().toLowerCase().indexOf(filteredValue) === 0) {
            filteredArr.push(obj);
            break;
          }

          let stringArr: string[] = obj[key].toString().toLowerCase().split(' ');
          if (stringArr.filter((word) => word.indexOf(filteredValue) === 0).length > 0) {
            filteredArr.push(obj);
            break;
          }
        }
      });
    }
    return this.results.emit({ results: filteredArr, input: this.inputValue });
  }
}
