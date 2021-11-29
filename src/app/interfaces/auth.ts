export interface LoggedUser {
  [key: string]: string | undefined;
  name: string;
  email: string;
}

export interface LoginResponse {
  [key: string]: string | undefined;
  message?: string;
  name: string;
  email: string;
}

export interface AuthInput {
  [key: string]: string;
  label: string;
  type: string;
  fcn: string;
  errorMsg: string;
  placeholder: string;
}
