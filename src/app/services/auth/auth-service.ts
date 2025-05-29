import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from '../../../environments/env';
import { AuthResponse } from '../../models/AuthResponse';
import User from '../../models/User';
import { LibelleCompanyService } from '../shared/libelle-company-service';
import { SharedDataService } from '../shared/shared-data-service';
import { catchError, throwError } from 'rxjs';
import { CustomError } from '../error/CustomError';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = env.apiURL + '/users/login';
  userRole: string = '';
  user!: User | null;
  libelleHeader: string = '';

  constructor(
    private readonly http: HttpClient,
    private readonly libelleCompanyService: LibelleCompanyService,
    private readonly sharedDataService: SharedDataService
  ) {}

  login(credentials: { username: string; password: string }) {
    return this.http.post<AuthResponse>(this.url, credentials).pipe(
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
            () =>
              new CustomError(
                `Erreur ${error.status} : ${error.statusText}`,
                `HTTP_${error.status}`
              )
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

  getRole(): string {
    return this.userRole;
  }

  setUser(authResponse: AuthResponse) {
    this.user = authResponse.user;
    this.userRole = authResponse.user.role!.substring(
      5,

      authResponse.user.role?.length
    );
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
    return this.userRole === expectedRole;
  }

  // Pour plusieurs rôles autorisés :
  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.userRole);
  }

  getLibelleHeader() {
    return this.libelleHeader;
  }

  isAdmin(): boolean {
    if (this.hasRole('ADMIN')) {
      return true;
    }
    return false;
  }
}
