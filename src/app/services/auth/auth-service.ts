import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../environments/env';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = env.apiURL + '/users/login';

  constructor(private readonly http: HttpClient) {}

  login(credentials: { username: string; password: string }) {
    return this.http.post<any>(this.url, credentials);
  }

  saveToken(token: string) {
    localStorage.setItem('jwt', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('jwt');
  }
}
