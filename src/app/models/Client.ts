import Adresse from "./Adresse";
import EmailClient from "./EmailClient";


export default interface Client {
  id: number | null;
  socialReason: string;
  adresseClient: Adresse;
  hasPrestation: boolean;
  emails: EmailClient[]
}
