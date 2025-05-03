import { Pipe, PipeTransform } from '@angular/core';
import Client from '../../models/Client';
import Adresse from '../../models/Adresse';

@Pipe({
  name: 'adresseClientPipe',
  standalone: true
})
export class AdresseClientPipe implements PipeTransform {
  transform(adresse: Adresse): string {   
    if(adresse)  {
      return adresse.numero + ", " + adresse.rue  + " " + adresse.codePostal  + " " + adresse.localite;
  }    
  return '';
  }
}