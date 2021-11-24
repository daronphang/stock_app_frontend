import { Component, OnInit, Input } from '@angular/core';
import { take } from 'rxjs/operators';
import { AlertsService } from '../alerts.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
})
export class MessageComponent implements OnInit {
  @Input('message') message: string;
  @Input('id') id: number;
  @Input('timeout') timeout: boolean;
  @Input('msgClass') msgClass: string;
  @Input('delay') delay: string;

  finalClass: string = 'message';
  duration: string = '0s';

  constructor(private alertsService: AlertsService) {}

  ngOnInit(): void {
    this.finalClass += ` ${this.msgClass}`;
    // If user enables timeout
    if (this.timeout) {
      const timeout = Number(this.delay.substr(0, this.delay.length - 1));
      this.duration = '1s';
      setTimeout(() => {
        this.onCloseHandler();
      }, timeout * 1000 + 1000);
    }
  }

  onCloseHandler() {
    this.alertsService.messages$.pipe(take(1)).subscribe((msgs) => {
      const index = msgs.findIndex((item) => item['id'] === this.id);
      msgs.splice(index, 1);
      this.alertsService.messages$.next(msgs);
    });
  }
}
