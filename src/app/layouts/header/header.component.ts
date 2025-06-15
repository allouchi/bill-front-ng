import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SharedMessagesService } from '../../services/shared/messages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'bill-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() selectedItem: string = '';

  observableEvent$ = new Subscription();

  constructor(private readonly sharedMessagesService: SharedMessagesService) {}

  ngOnInit(): void {
    this.observableEvent$ = this.sharedMessagesService
      .getMessageObservable()
      .subscribe((message) => {
        this.selectedItem = message;
      });
  }

  ngOnDestroy(): void {
    this.observableEvent$.unsubscribe();
  }
}
