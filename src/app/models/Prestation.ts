import Client from "./Client";
import Consultant from "./Consultant";
import Facture from "./Facture";

export default interface Prestation {
  id: number | null;
  tarifHT?: number;
  delaiPaiement?: number;
  consultant?: Consultant;
  client?: Client;
  facture?: Facture[];
  designation?: string;
  numeroCommande?: string;
  clientPrestation?: string;
  quantite?: number;
  dateFin?: string;
  dateDebut?: string;
  siret?: string;
}
