export interface User {
  id: number;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface SignupResponse {
  id: number;
  username: string;
}
