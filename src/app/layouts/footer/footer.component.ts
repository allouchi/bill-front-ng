import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'bill-footer',
  templateUrl: './footer.component.html',
})
export class FooterComponent implements OnInit {
  version?: string;
  copyright?: string;
  year!: number;

  constructor() {}

  ngOnInit(): void {
    let date = new Date();
    this.year = date.getFullYear();
  }
}
