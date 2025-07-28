import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'customDecimalPipe',
  standalone: true
})
export class CustomDecimalPipe implements PipeTransform {
  transform(value: number): string {
    if (value == null) {
      return '';
    }
    const withPoint = value.toFixed(2).toString().replace('.', ',');
    return withPoint.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }  
}