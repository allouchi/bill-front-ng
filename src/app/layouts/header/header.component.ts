import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared/shared.service';
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

  constructor(private sharedService: SharedService) {}

  ngOnInit(): void {
    this.observableEvent$ = this.sharedService.data$.subscribe((value) => {
      this.selectedItem = value;
    });
  }

  ngOnDestroy(): void {
    this.observableEvent$.unsubscribe();
  }
}
