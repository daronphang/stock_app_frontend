import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

interface Message {
  [key: string]: string | boolean | number;
  id: number;
  message: string;
  timeout: boolean;
  msgClass: string;
  delay: string;
}

interface Options {
  [key: string]: string | boolean | undefined;
  timeout?: boolean;
  msgClass?: string;
  delay?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  counter: number = 1;
  messages$ = new BehaviorSubject<Message[]>([]);

  constructor() {}

  displayMessage(message: string, options?: Options) {
    this.messages$.pipe(take(1)).subscribe((msgs) => {
      const newMsg: Message = {
        id: this.counter,
        message: message,
        timeout: options?.timeout ? options.timeout : true,
        msgClass: options?.msgClass ? options.msgClass : 'default',
        delay: options?.delay ? options.delay : '4s',
      };

      this.messages$.next([...msgs, newMsg]);
    });
  }
}
