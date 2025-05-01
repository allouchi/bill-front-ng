import Company from "../domains/Company";

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
  createOrUpdate(company: Company): Observable<Company>;

  /**
   * Get all schemas if no project or all schemas for project name in otherwise
   *
   * @param company company name
   * @returns Observable<Company>
   */
  findAllBySiret(siret: string): Observable<Company[]>;

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
  findAll(): Observable<Company[]>;

  /**
   * Delete one facture by it's id
   *
   * @param id facture id to delete
   */
  deleteById(id: number): Observable<String>;
}
