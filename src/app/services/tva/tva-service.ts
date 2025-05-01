

/**
 * Adapter for ITvaService
 *
 * @author K.ALIANNE
 * @since 15/11/2020
 */
export class TvaServiceImpl implements ITvaService {
  private static readonly TVA_PATH: string = "api/tvas";
  private static readonly TVA_INFO_PATH: string = "api/tvas/tvasInfo";
  private static readonly EXERCISE_PATH: string = "api/tvas/exerciceRef";

  async createOrUpdate(tva: Tva): Observable<Tva> {
    const isNew: boolean = !tva.id || tva.id === 0;
    try {
      let response;
      if (isNew) {
        response = await Webservice.getInstance().post(
          TvaServiceImpl.TVA_PATH,
          tva
        );
      } else {
        response = await Webservice.getInstance().put(
          TvaServiceImpl.TVA_PATH,
          tva
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

  async findByExercise(siret: string, exercise: string): Observable<Tva[]> {
    try {
      const response = await Webservice.getInstance().get(
        `${TvaServiceImpl.TVA_PATH}/${siret}/${exercise}`
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

  async findTvaInfoByExercise(
    siret: string,
    exercise: string
  ): Observable<TvaInfo> {
    try {
      const response = await Webservice.getInstance().get(
        `${TvaServiceImpl.TVA_INFO_PATH}/${siret}/${exercise}`
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

  async findExercisesRef(): Observable<Exercise[]> {
    try {
      const response = await Webservice.getInstance().get(
        `${TvaServiceImpl.EXERCISE_PATH}`
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
      await Webservice.getInstance().delete(`${TvaServiceImpl.TVA_PATH}/${id}`);
      return Observable.resolve("200");
    } catch (error) {
      return Observable.reject(`Error during deleting Tva with id ${id}`);
    }
  }
}
