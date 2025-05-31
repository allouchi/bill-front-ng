import { Pipe, PipeTransform } from '@angular/core';

import User from '../../models/User';

@Pipe({
  name: 'userPipe',
  standalone: true
})
export class UserNamePipe implements PipeTransform {
  transform(user: User): string {   
    if(user)  {
      return user.firstName + ' ' + user.lastName;
  }    
  return '';
  }
}