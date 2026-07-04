import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthResponse } from '../../models/AuthResponse';
import User from '../../models/User';
import { LibelleCompanyService } from '../shared/libelle-company-service';
import { SharedDataService } from '../shared/shared-data-service';
import Role from '../../models/Role';
import { Observable, tap, throwError } from 'rxjs';
import { RefreshRequest } from '../../models/RefreshRequest';
import { environment } from '../../../environments/environment';
import { IsAuthService } from '../shared/islogin-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loginUrl = environment.authURL + '/login';
  refreshUrl = environment.authURL + '/refresh-token';
  userRoles: Role[] = [];
  user!: User | null;
  libelleHeader: string = '';

  constructor(
    private readonly http: HttpClient,
    private readonly libelleCompanyService: LibelleCompanyService,
    private readonly sharedDataService: SharedDataService,
    private readonly isAuthService: IsAuthService
  ) {
    this.restoreSession();
  }

  /**
   * Rehydrate the in-memory user from the persisted session on a full page reload, so
   * refreshing (F5) or deep-linking does not log the user out. Only restores when a valid
   * access token is still present.
   */
  private restoreSession(): void {
    try {
      if (!this.getAccessToken()) {
        return;
      }
      const raw = localStorage.getItem('authSession');
      if (raw) {
        this.applySession(JSON.parse(raw) as AuthResponse);
        // Re-flag the authenticated state so the shell (nav menu) shows after a reload.
        this.isAuthService.setIsAuth(true);
      }
    } catch {
      localStorage.removeItem('authSession');
    }
  }

  login(credentials: { username: string; password: string }) {
    return this.http
      .post<AuthResponse>(this.loginUrl, credentials)
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
    this.user = null;
    this.userRoles = [];
    this.isAuthService.setIsAuth(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authSession');
  }

  removeAll() {
    this.user = null;
    this.userRoles = [];
    this.isAuthService.setIsAuth(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userLang');
    localStorage.removeItem('authSession');
  }

  getRoles(): Role[] {
    return this.userRoles;
  }

  setUser(authResponse: AuthResponse) {
    // Persist a lightweight session so a page reload can restore it (see restoreSession).
    try {
      localStorage.setItem(
        'authSession',
        JSON.stringify({
          user: authResponse.user,
          company: authResponse.company,
          socialReason: authResponse.socialReason,
        }),
      );
    } catch {
      /* storage full / unavailable — session just won't survive reload */
    }
    this.applySession(authResponse);
  }

  /** Apply an AuthResponse to the in-memory state + dependent services (login and reload). */
  private applySession(authResponse: AuthResponse) {
    this.user = authResponse.user;
    this.userRoles = authResponse.user?.roles ?? [];
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
