import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SharedDataService {
  data: Map<string, any> = new Map();
  setData(data: Map<string, any>) {
    this.data = data;
  }
  getData() {
    return this.data;
  }

  clearData() {
    this.data.clear();
  }
}
