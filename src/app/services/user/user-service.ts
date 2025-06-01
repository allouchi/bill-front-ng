import { Observable } from "rxjs";
import { env } from "../../../environments/env";
import User from "../../models/User";
import { IUserService } from "./user.interface";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { IRolesService } from './roles.interface';
import RolesRef from '../../models/RolesRef';

@Injectable({ providedIn: 'root' })
export class UserService implements IUserService, IRolesService {
  private readonly apiURL = env.apiURL;
  private readonly USER_PATH: string = `${this.apiURL}` + '/users';

  private readonly ROLES_PATH: string = `${this.apiURL}` + '/roles';

  constructor(private readonly http: HttpClient) {}

  deleteUser(id: number): Observable<User> {
    return this.http.delete<User>(`${this.USER_PATH}/${id}`);
  }
  findUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.USER_PATH}`);
  }
  login(user: User): Observable<User> {
    return this.http.get<User>(
      `${this.USER_PATH}/${user.email}/${user.password}`
    );
  }

  logout(): Observable<string> {
    return this.http.get<string>(`${this.USER_PATH}/logout`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.USER_PATH}/add`, user);
  }

  editUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.USER_PATH}/edit`, user);
  }
  findByEmailAndPassword(email: string, password: string): Observable<User> {
    return this.http.get<User>(`${this.USER_PATH}/${email}/${password}`);
  }

  getRoles(): Observable<RolesRef[]> {
    return this.http.get<RolesRef[]>(`${this.ROLES_PATH}`);
  }
}
