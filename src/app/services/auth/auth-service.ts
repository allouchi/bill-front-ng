import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../environments/env';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  url = env.apiURL + "/auth/login";

  constructor(private readonly http: HttpClient) { }

  login(credentials: { username: string; password: string }) {   
    return this.http.post<any>(this.url, credentials);
  }

}
