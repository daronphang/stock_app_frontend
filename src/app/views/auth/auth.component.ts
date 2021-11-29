import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, pipe } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';

import { HeaderService } from 'src/app/components/header/header.service';
import { AuthInput } from 'src/app/interfaces/auth';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  errorMsg: string;
  isLoading: boolean;
  isLogin: boolean = true;

  loginForm = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, Validators.minLength(5)]],
  });
  signupForm = this.fb.group({
    firstName: [null, [Validators.required]],
    lastName: [null, [Validators.required]],
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, Validators.minLength(5)]],
  });

  inputFields$ = new BehaviorSubject<AuthInput[]>([
    {
      label: 'Email',
      type: 'text',
      fcn: 'email',
      errorMsg: 'Please enter your email.',
      placeholder: 'Enter Email',
    },
    {
      label: 'Password',
      type: 'password',
      fcn: 'password',
      errorMsg: 'Please enter your password.',
      placeholder: 'Enter Password',
    },
  ]);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private headerService: HeaderService,
    private authService: AuthService,
    private appService: AppService,
    private http: HttpClient
  ) {
    headerService.showHeader = false;
  }

  ngOnInit(): void {}

  onSwitchHandler(type: string) {
    if (type === 'SIGNUP') {
      this.isLogin = false;
      this.inputFields$.next([
        {
          label: 'First Name',
          type: 'text',
          fcn: 'firstName',
          errorMsg: 'Please enter your first name.',
          placeholder: 'Enter First Name',
        },
        {
          label: 'Last Name',
          type: 'text',
          fcn: 'lastName',
          errorMsg: 'Please enter your last name.',
          placeholder: 'Enter Last Name',
        },
        {
          label: 'Email',
          type: 'text',
          fcn: 'email',
          errorMsg: 'Please enter your email.',
          placeholder: 'Enter Email',
        },
        {
          label: 'Password',
          type: 'password',
          fcn: 'password',
          errorMsg: 'Please enter your password.',
          placeholder: 'Enter Password',
        },
      ]);
    }

    if (type === 'LOGIN') {
      this.isLogin = true;
      this.inputFields$.next([
        {
          label: 'Email',
          type: 'text',
          fcn: 'email',
          errorMsg: 'Please enter your email.',
          placeholder: 'Enter Email',
        },
        {
          label: 'Password',
          type: 'password',
          fcn: 'password',
          errorMsg: 'Please enter your password.',
          placeholder: 'Enter Password',
        },
      ]);
    }
  }

  onLoginHandler() {
    const { email, password } = this.loginForm.value;
    this.loginForm.disable();
    this.isLoading = true;

    this.authService.authenticateUserHandler(email, password).subscribe(
      (response) => {
        this.isLoading = false;
        this.router.navigate(['/lp']);
      },
      (err) => {
        this.loginForm.enable();
        this.errorMsg = err;
        this.isLoading = false;
      }
    );
  }

  onSignupHandler() {
    this.authService.signupHandler(this.signupForm.value).subscribe(
      (res) => {
        this.authService.loggedUser = {
          email: this.signupForm.controls['email'].value,
          name: this.signupForm.controls['firstName'].value,
        };
        this.authService.isAuthenticated = true;
        this.router.navigate(['/lp']);
      },
      (err) => {
        this.errorMsg = err;
      }
    );
  }
}
