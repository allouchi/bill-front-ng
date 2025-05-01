import { Pipe, PipeTransform } from '@angular/core';
import Client from '../models/Client';

@Pipe({
  name: 'clientPipe',
  standalone: true
})
export class ClientNamePipe implements PipeTransform {
  transform(client: Client): string {   
    if(client)  {
      return client.socialReason;
  }    
  return '';
  }
}