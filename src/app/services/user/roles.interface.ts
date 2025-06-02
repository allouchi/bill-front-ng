import { Observable } from "rxjs";
import Role from "../../models/Role";


/**
 * UserRoleRef fetcher port
 *
 */
export interface IRolesService {
  /**
   * Find Roles ref
   *
   * @returns Promise<UserRoleRef>
   */
  getRoles(): Observable<Role[]>;
}
