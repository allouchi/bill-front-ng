import { Observable } from "rxjs";
import { env } from "../../../environments/env";
import User from "../../models/User";
import { IUserService } from "./user.interface";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";


@Injectable({ providedIn: 'root' })
export class UserService implements IUserService {
  
    private readonly apiURL = env.apiURL;
    private readonly USER_PATH: string = `${this.apiURL}` + '/users';

    constructor(private readonly http: HttpClient){

    }

   login(user: User): Observable<User> {    
      return this.http.get<User>(
        `${this.USER_PATH}/${user.userName}/${user.password}`
      );    
    
  }

  logout(): Observable<string> {
    return this.http.get<string>(
        `${this.USER_PATH}/logout`
      );
  }

   createUser(user: User): Observable<User> {    
       return this.http.post<User>(
        `${this.USER_PATH}`,
        user
      );
     
    }  
   findByEmailAndPassword(email: string, password: string): Observable<User> {    
      return this.http.get<User>(`${this.USER_PATH}/${email}/${password}`)     
  }

}
