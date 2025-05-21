import { Observable } from "rxjs";
import RolesRef from "../../models/RolesRef";


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
  getRoles(): Observable<RolesRef[]>;
}
