import { Injectable } from '@angular/core';
import Company from '../../models/Company';
import Prestation from '../../models/Prestation';
import Tva from '../../models/Tva';
import Facture from '../../models/Facture';
import Consultant from '../../models/Consultant';
import Client from '../../models/Client';
import Exercise from '../../models/Exercise';
import User from '../../models/User';
import Operation from '../../models/Operation';
import { AuthService } from '../auth/auth-service';

@Injectable({ providedIn: 'root' })
export class SharedDataService {

  selectedCompany: Company | null = null;
  selectedOperation: Operation | null = null;
  selectedPrestation: Prestation | null = null;
  prestations: Prestation[] | null = null;
  selectedTva: Tva | null = null;
  selectedFacture: Facture | null = null;
  selectedClient: Client | null = null;
  clients: Client[] | null = null;
  selectedConsultant: Consultant | null = null;
  consultants: Consultant[] | null = null;
  companies: Company[] | null = null;
  exercices: Exercise[] | null = null;
  selectedExercise: string | null = null;
  isEditionFacture = '';
  selectedUser: User | null = null;


  getSelectedExercise(): string | null {
    return this.selectedExercise;
  }
  setSelectedExercise(exercise: string) {
    this.selectedExercise = exercise;
  }

  setIsEditionFacture(isEdition: string) {
    localStorage.setItem('isEdition', isEdition);

  }
  getIsEditionFacture(): string | null {
    return localStorage.getItem('isEdition');
  }

  setSiret(siret: string): void {
    localStorage.setItem('siret', siret);
  }

  getSiret(): string | null {
    return localStorage.getItem('siret') || null;
  }

  getSelectedCompany(): Company | null {
    return this.selectedCompany;
  }
  setSelectCompany(company: Company | null) {
    this.selectedCompany = company;
  }

  getSelectedOperation(): Operation | null {
    return this.selectedOperation;
  }
  setSelectOperation(company: Operation | null) {
    this.selectedOperation = company;
  }

  getSelectedPrestation(): Prestation | null {
    return this.selectedPrestation;
  }
  setSelectedPrestation(porestation: Prestation) {
    this.selectedPrestation = porestation;
  }

  getPrestations(): Prestation[] | null {
    return this.prestations;
  }
  setPrestations(porestations: Prestation[]) {
    this.prestations = porestations;
  }

  getSelectedTva(): Tva | null {
    return this.selectedTva;
  }

  setSelectedTva(tva: Tva | null) {
    return (this.selectedTva = tva);
  }

  setSelectedFacture(facture: Facture) {
    this.selectedFacture = facture;
  }

  gertSelectedFacture() {
    return this.selectedFacture;
  }

  setSelectedUser(user: User) {
    this.selectedUser = user;
  }
  getSelectedUser() {
    return this.selectedUser;
  }

  setSelectedConsultant(consultant: Consultant) {
    this.selectedConsultant = consultant;
  }
  getSelectedConsultant() {
    return this.selectedConsultant;
  }

  setSelectedClient(client: Client) {
    this.selectedClient = client;
  }

  getConsultants() {
    return this.consultants;
  }

  setConsultants(consultants: Consultant[]) {
    this.consultants = consultants;
  }

  setClients(clients: Client[]) {
    this.clients = clients;
  }
  getSelectedClient() {
    return this.selectedClient;
  }

  setCompanies(companies: Company[]) {
    this.companies = companies;
  }

  getCompanies() {
    return this.companies || [];
  }

  setExercices(exercices: Exercise[]) {
    this.exercices = exercices;
  }
  getExercices() {
    return this.exercices;
  }
}
