

/**
 * Adapter for ICompanyService
 *
 * @author k.ALIANNE
 * @since 15/11/2020
 */
export class CompanyServiceImpl implements ICompanyService {
  private static readonly COMPNAY_PATH: string = "api/companies";

  async createOrUpdate(company: Company): Observable<Company> {
    const isNew: boolean = !company.id || company.id === 0;
    try {
      let response;
      if (isNew) {
        response = await Webservice.getInstance().post(
          CompanyServiceImpl.COMPNAY_PATH,
          company
        );
      } else {
        response = await Webservice.getInstance().put(
          CompanyServiceImpl.COMPNAY_PATH,
          company
        );
      }
      return response.data;
    } catch (error) {
      let messageJson;
      if (error.request !== undefined && error.request.response === "") {
        messageJson = "Problème réseau";
      } else {
        messageJson = decodeMessage(error);
      }
      throw Error(messageJson);
    }
  }

  async findAll(): Observable<Company[]> {
    try {
      const response = await Webservice.getInstance().get(
        `${CompanyServiceImpl.COMPNAY_PATH}`
      );
      return response.data;
    } catch (error) {
      let messageJson;
      if (error.request !== undefined && error.request.response === "") {
        messageJson = "Problème réseau";
      } else {
        messageJson = decodeMessage(error);
      }
      throw Error(messageJson);
    }
  }
  async findAllBySiret(siret: string): Observable<Company[]> {
    try {
      const response = await Webservice.getInstance().get(
        `${CompanyServiceImpl.COMPNAY_PATH}/${siret}`
      );
      return response.data;
    } catch (error) {
      let messageJson;
      if (error.request !== undefined && error.request.response === "") {
        messageJson = "Problème réseau";
      } else {
        messageJson = decodeMessage(error);
      }
      throw Error(messageJson);
    }
  }

  async findByUserName(userName: string): Observable<Company[]> {
    const userPath = "user";
    try {
      const response = await Webservice.getInstance().get(
        `${CompanyServiceImpl.COMPNAY_PATH}/${userPath}/${userName}`
      );
      return response.data;
    } catch (error) {
      let messageJson;
      if (error.request !== undefined && error.request.response === "") {
        messageJson = "Problème réseau";
      } else {
        messageJson = decodeMessage(error);
      }
      throw Error(messageJson);
    }
  }

  async deleteById(id: number): Observable<string> {
    try {
      await Webservice.getInstance().delete(
        `${CompanyServiceImpl.COMPNAY_PATH}/${id}`
      );
      return Observable.resolve("200");
    } catch (error) {
      return Observable.reject(`Error during deleting company with id ${id}`);
    }
  }
}
