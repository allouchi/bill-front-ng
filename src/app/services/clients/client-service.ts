import Client from "../../models/Client";
import { IClientService } from "./client.interface";


/**
 * Adapter for ICompanyService
 *
 * @author M.ALIANNE
 * @since 15/11/2020
 */
export class ClientServiceImpl implements IClientService {
  private static readonly CLIENT_PATH: string = "api/clients";

  async createOrUpdate(client: Client, siret: string): Observable<Client> {
    const isNew: boolean = !client.id || client.id === 0;
    try {
      let response;
      if (isNew) {
        response = await Webservice.getInstance().post(
          `${ClientServiceImpl.CLIENT_PATH}/${siret}`,
          client
        );
      } else {
        response = await Webservice.getInstance().put(
          `${ClientServiceImpl.CLIENT_PATH}/${siret}`,
          client
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
  async findAllBySiret(siret: string): Observable<Client[]> {
    try {
      const response = await Webservice.getInstance().get(
        `${ClientServiceImpl.CLIENT_PATH}/${siret}`
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

  async findAll(): Observable<Client[]> {
    try {
      const response = await Webservice.getInstance().get(
        `${ClientServiceImpl.CLIENT_PATH}`
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
        `${ClientServiceImpl.CLIENT_PATH}/${id}`
      );
      return Observable.resolve("200");
    } catch (error) {
      return Observable.reject(`Error during deleting client with id ${id}`);
    }
  }
}
