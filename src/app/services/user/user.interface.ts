import { Observable } from "rxjs";
import User from "../../models/User";


/**
 * User fetcher port
 *
 */
export interface IUserService {
  /**
   * Create new user
   *
   * @param user user to create or to update
   * @returns Promise<User>
   */
  createUser(user: User): Observable<User>;

  findUsers(): Observable<User[]>;

  deleteUser(id: number): Observable<User>;

  /**
   * Disconnect user
   *
   * @param user user
   * @returns Promise<void>
   */
  logout(user: User): Observable<string>;
}
