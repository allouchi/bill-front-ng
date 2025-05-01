import { Component, input } from '@angular/core';

@Component({
  selector: 'bill-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})


export class HeaderComponent {
  route = input('', {
    transform: (value: string) => {
      return value.toLocaleLowerCase();
    }
  });
}
