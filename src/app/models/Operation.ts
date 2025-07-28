export default interface Operation {
  id: number | null;
  montantOperation: number;
  typeOperation: string;
  dateOperation: string;
  exercise: string;
  siret: string;
}
