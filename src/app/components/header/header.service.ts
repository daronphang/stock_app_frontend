import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  showHeader: boolean = false;

  constructor() {}
}
