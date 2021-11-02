import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({ selector: '[keyPress]' })
export class KeyPressDirective {
  @Output() keyValue = new EventEmitter<string>();
  @HostListener('document:keyup', ['$event']) onKeyUpHandler(event: KeyboardEvent) {
    this.keyValue.emit(event.key);
  }
}
