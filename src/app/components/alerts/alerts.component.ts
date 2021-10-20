import { Component, Input, OnInit } from '@angular/core';

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

  constructor() {}

  ngOnInit(): void {
    if (this.timeout) {
      setTimeout(() => {
        this.hide = true;
      }, 5000);
    }
  }

  onCloseHandler() {
    this.hide = true;
  }
}
