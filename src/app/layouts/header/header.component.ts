import { Component, Input } from '@angular/core';
import { SharedService } from '../../services/shared/shared.service';

@Component({
  selector: 'bill-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Input() selectedItem: string = '';

  constructor(private sharedService: SharedService) {}

  ngOnInit(): void {
    this.sharedService.data$.subscribe((value) => {
      this.selectedItem = value;
    });
  }
}
