import { Observable } from "rxjs";
import Company from "../../models/Company";


/**
 * Company fetcher port
 *
 */
export interface ICompanyService {
  /**
   * Create new facture for the current project or update it if already exists
   *
   * @param company company to create or to update
   * @returns Observable<Company>
   */
  createOrUpdateCompany(company: Company): Observable<Company>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param company company name
   * @returns Observable<Company>
   */
  findCompaniesBySiret(siret: string): Observable<Company[]>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param company company name
   * @returns Observable<Company>
   */
  findByUserName(siret: string): Observable<Company[]>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param company company name
   * @returns Observable<Company[]>
   */
  findCompanies(): Observable<Company[]>;

  /**
   * Delete one facture by it's id
   *
   * @param id facture id to delete
   */
  deleteCompanyById(id: number): Observable<string>;
}
