import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/components/header/header.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  errorMsg: string;
  isLoading: boolean;
  form = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, Validators.minLength(5)]],
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private headerService: HeaderService,
    private authService: AuthService
  ) {
    headerService.showHeader = false;
  }

  ngOnInit(): void {}

  onSubmitHandler() {
    const { email, password } = this.form.value;
    this.form.disable();
    this.isLoading = true;

    this.authService.authenticateUserHandler(email, password).subscribe(
      (response) => {
        this.isLoading = false;
        this.router.navigate(['/lp']);
      },
      (err) => {
        this.form.enable();
        this.errorMsg = err;
        this.isLoading = false;
      }
    );
  }
}
