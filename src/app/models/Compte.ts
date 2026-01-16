export default interface Compte {
  id: number | null;
  montantOperation: number;
  typeOperation: string;
  descriptionOperation: string;
  dateOperation: string;
  exercise: string;
  siret: string;
}
