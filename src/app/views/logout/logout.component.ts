import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { HeaderService } from 'src/app/components/header/header.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
})
export class LogoutComponent implements OnInit {
  number: number = 3;
  constructor(private headerService: HeaderService, private router: Router) {
    this.headerService.showHeader = false;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000);

    setInterval(() => {
      this.number -= 1;
    }, 1000);
  }
}
