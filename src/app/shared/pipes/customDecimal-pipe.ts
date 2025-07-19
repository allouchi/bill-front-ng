import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'customDecimalPipe',
  standalone: true
})
export class CustomDecimalPipe implements PipeTransform {
  transform(value: number): string {
    return value.toFixed(2).toString().replace('.', ',');
  }  
}