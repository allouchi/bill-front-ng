import Adresse from "./Adresse";

export default interface Client {
  id: number;
  socialReason: string;
  email: string;
  adresseClient: Adresse;
}
