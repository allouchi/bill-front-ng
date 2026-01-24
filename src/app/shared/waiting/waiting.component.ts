import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'bill-waiting',
  imports: [CommonModule],
  templateUrl: './waiting.component.html',
  styleUrl: './waiting.component.css'
})
export class WaitingComponent implements OnInit {

  @Input() edit: string = 'read';
  @Input() sendMail: boolean = false;
  @Input() isLoading = true;

  isEdit: boolean = false;
  isSending: boolean = false;

  ngOnInit(): void {
    if (this.edit === 'edit') {
      this.isEdit = true;
    }

    if (this.sendMail) {
      this.isSending = true;
    }
  }
}
