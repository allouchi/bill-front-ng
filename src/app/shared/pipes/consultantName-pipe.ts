import { Pipe, PipeTransform } from '@angular/core';
import Consultant from '../../models/Consultant';

@Pipe({
  name: 'consultantPipe',
  standalone: true
})
export class ConsultantNamePipe implements PipeTransform {
  transform(consultant: Consultant): string {
    console.log("consultant :", consultant)
    if (consultant) {
      if (consultant.firstName && consultant.lastName) {
        return consultant.firstName.substring(0, 1) + consultant.lastName.substring(0, 1);
      }
    }
    return '';
  }
}