import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private dataSource = new BehaviorSubject<string>('');  // ou autre type
  data$ = this.dataSource.asObservable();

  updateData(newValue: string) {
    this.dataSource.next(newValue);
  }
}
