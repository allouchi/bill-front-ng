import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'bill-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit {
  version?: string;
  copyright?: string;

  constructor() {}

  ngOnInit(): void {
    
  }
}
