import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UnsplashService {

  private accessKey = '3oR5TRqm2lt1AVKsEfpyEX7_7FWbr2ufNUs6OAIO3_0';
  private apiUrl = 'https://api.unsplash.com/search/photos';

  constructor(private http: HttpClient) {}

  searchPhotos(query: string, page = 1, perPage = 10) {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page)
      .set('per_page', perPage)
      .set('client_id', this.accessKey);

    return this.http.get(this.apiUrl, { params });
  }
}
