import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { fadeAnimation } from './animations/fade.animation';
import { HeaderService } from './components/header/header.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [fadeAnimation],
})
export class AppComponent {
  constructor(public headerService: HeaderService) {}

  public getRouterOutletState(o: RouterOutlet) {
    return o && o.activatedRouteData && o.activatedRouteData['animationState'];
  }
}
