import Adresse from "./Adresse";

export default interface Client {
  id: number | null;
  socialReason: string;
  email: string;
  adresseClient: Adresse;
}
