import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'bill-search',
  imports: [ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit{
  @Input() placeholder: string = '🔍 Rechercher...';
  @Input() debounce: number = 300;

  @Output() search = new EventEmitter<string>();

  control = new FormControl('');

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe((search) => {
        this.search.emit(search || '');
      });
  } 
}
