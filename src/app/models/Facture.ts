
export default interface Facture {
  id: number | null;
  numeroFacture: string;
  dateFacturation: string;
  dateEcheance: string;
  dateEncaissement: string;
  delaiPaiement: number;
  montantTVA: number;
  montantNetTVA: number;
  prixTotalHT: number;
  prixTotalTTC: number;
  nbJourRetard: number;
  fraisRetard: number;
  factureStatus: string;
  tarifHT?: number;
  statusDesc: string;
  quantite: number;
  numeroCommande: string;
  designation: string;
  clientPrestation: string;
  filePath: string;
  moisFacture: string;
}
