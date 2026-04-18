import { Component, OnInit } from '@angular/core';
import { ChatbotComponent } from '../chatbot/chatbot.component';

@Component({
  selector: 'bill-footer',
  imports: [ChatbotComponent],
  standalone: true,
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
