
/**
 * Adapter for IConsultantService
 *
 * @author k.ALIANNE
 * @since 15/11/2020
 */
export class ConsultantServiceImpl implements IConsultantService {
  private static readonly CONSULTANT_PATH: string = "api/consultants";

  async createOrUpdate(
    consultant: Consultant,
    siret: string
  ): Observable<Consultant> {
    const isNew: boolean = !consultant.id || consultant.id === 0;
    let response;
    try {
      if (isNew) {
        response = await Webservice.getInstance().post(
          `${ConsultantServiceImpl.CONSULTANT_PATH}/${siret}`,
          consultant
        );
      } else {
        response = await Webservice.getInstance().put(
          `${ConsultantServiceImpl.CONSULTANT_PATH}/${siret}`,
          consultant
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

  async findAllBySiret(siret: string): Observable<Consultant[]> {
    try {
      const response = await Webservice.getInstance().get(
        `${ConsultantServiceImpl.CONSULTANT_PATH}/${siret}`
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

  async findAll(): Observable<Consultant[]> {
    try {
      const response = await Webservice.getInstance().get(
        `${ConsultantServiceImpl.CONSULTANT_PATH}`
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

  async deleteById(id: number, siret: string): Observable<string> {
    try {
      await Webservice.getInstance().delete(
        `${ConsultantServiceImpl.CONSULTANT_PATH}/${siret}/${id}`
      );
      return Observable.resolve("200");
    } catch (error) {
      return Observable.reject(`Error during deleting consultant with id ${id}`);
    }
  }
}
