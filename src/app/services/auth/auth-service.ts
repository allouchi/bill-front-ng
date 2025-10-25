import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../environments/env';
import { AuthResponse } from '../../models/AuthResponse';
import User from '../../models/User';
import { LibelleCompanyService } from '../shared/libelle-company-service';
import { SharedDataService } from '../shared/shared-data-service';
import Role from '../../models/Role';
import { Observable, tap, throwError } from 'rxjs';
import { RefreshRequest } from '../../models/RefreshRequest';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loginUrl = env.apiURL + '/users/login';
  refreshUrl = env.apiURL + '/users/refresh-token';
  userRoles: Role[] = [];
  user!: User | null;
  libelleHeader: string = '';

  constructor(
    private readonly http: HttpClient,
    private readonly libelleCompanyService: LibelleCompanyService,
    private readonly sharedDataService: SharedDataService
  ) { }

  login(credentials: { username: string; password: string }) {
    return this.http
      .post<AuthResponse>(this.loginUrl, credentials, {
        withCredentials: true,
      })
      .pipe(
        tap((tokens) => {
          this.saveAccessToken(tokens.accessToken);
          this.saveRefreshToken(tokens.refreshToken);
        })
      );
  }

  refreshAccessToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const refreshRequest = new RefreshRequest();
    refreshRequest.refreshToken = refreshToken;

    return this.http
      .post<AuthResponse>(this.refreshUrl, refreshRequest, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.saveAccessToken(res.refreshToken);
        })
      );
  }

  saveAccessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  setUserLang(lang: string) {
    localStorage.setItem('userLang', lang);
  }

  getUserLang(): string | null {
    return localStorage.getItem('userLang');
  }


  saveRefreshToken(token: string) {
    localStorage.setItem('refreshToken', token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getRoles(): Role[] {
    return this.userRoles;
  }

  setUser(authResponse: AuthResponse) {
    this.user = authResponse.user;
    this.userRoles = authResponse.user.roles!;
    let libelleHeader = '';
    if (authResponse.user) {
      libelleHeader =
        authResponse.socialReason +
        ' (' +
        authResponse.user.firstName +
        ' ' +
        authResponse.user.lastName +
        ')';
    }
    this.libelleHeader = libelleHeader;
    this.libelleCompanyService.setMessage(libelleHeader);
    this.sharedDataService.setSelectCompany(authResponse.company);
    this.sharedDataService.setSelectedUser(authResponse.user);
    this.sharedDataService.setSiret(authResponse.company!.siret);
  }

  getUser(): User | null {
    return this.user;
  }

  hasRole(expectedRole: string): boolean {
    const role = this.userRoles.filter((u) => u.roleName === expectedRole);
    if (role) {
      return true;
    }
    return false;
  }

  // Pour plusieurs rôles autorisés :
  hasAnyRole(expectedRoles: string[]): boolean {
    if (this.user?.roles) {
      const match = this.user.roles.find((r) =>
        expectedRoles.includes(r.roleName)
      );
      return !!match;
    }
    return false;
  }

  getLibelleHeader() {
    return this.libelleHeader;
  }

  isAdmin(): boolean {
    if (this.hasRole('ROLE_ADMIN')) {
      return true;
    }
    return false;
  }
}
