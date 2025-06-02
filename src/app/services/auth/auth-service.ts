import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../environments/env';
import { AuthResponse } from '../../models/AuthResponse';
import User from '../../models/User';
import { LibelleCompanyService } from '../shared/libelle-company-service';
import { SharedDataService } from '../shared/shared-data-service';
import { catchError, throwError } from 'rxjs';
import { CustomError } from '../error/CustomError';
import Role from '../../models/Role';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = env.apiURL + '/users/login';
  userRoles: Role[] = [];
  user!: User | null;
  libelleHeader: string = '';

  constructor(
    private readonly http: HttpClient,
    private readonly libelleCompanyService: LibelleCompanyService,
    private readonly sharedDataService: SharedDataService
  ) {}

  login(credentials: { username: string; password: string }) {
    return this.http
      .post<AuthResponse>(this.url, credentials, {
        withCredentials: true,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            return throwError(
              () =>
                new CustomError(
                  'Connexion impossible au serveur.',
                  'ERR_CONNECTION_REFUSED'
                )
            );
          } else {
            return throwError(
              () => new CustomError(error.error.code, error.error.message)
            );
          }
        })
      );
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
    this.sharedDataService.setSelectCompany(authResponse.company!);
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
    if (this.user && this.user.roles) {
      const match = this.user.roles.find((r) => expectedRoles.includes(r.roleName));
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
