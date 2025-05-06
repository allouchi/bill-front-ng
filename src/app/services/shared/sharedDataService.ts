import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class SharedDataService {
  //private data: any;

  data: Map<string, any[]> = new Map();
  setData(data: Map<string, any[]>) {
    this.data = data;
  }
  getData() {
    return this.data;
  }
}