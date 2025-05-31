import { Pipe, PipeTransform } from '@angular/core';
import Company from '../../models/Company';

@Pipe({
  name: 'raisonSociale'
})
export class RaisonSocialePipe implements PipeTransform {

 transform(siret: string, companies : Company []): string {
    if (!siret || !companies) return '';
    const match = companies.find(e => e.siret === siret);
    return match ? match.socialReason : 'Inconnu';
  }

}
