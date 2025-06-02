import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnsplashService {

  private readonly accessKey = '3oR5TRqm2lt1AVKsEfpyEX7_7FWbr2ufNUs6OAIO3_0';
  //private readonly apiUrl = 'https://api.unsplash.com/search/photos';
  private readonly apiUrl = 'https://api.unsplash.com/photos/random';

  constructor(private readonly http: HttpClient) { }

  searchPhotos(query: string, page = 1, perPage = 10) {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page)
      .set('per_page', perPage)
      .set('client_id', this.accessKey);
    return this.http.get(this.apiUrl, { params });
  }


  getRandomPhoto(query?: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Client-ID ${this.accessKey}`,
    });

    const url = query ? `${this.apiUrl}?query=${query}` : this.apiUrl;

    return this.http.get(url, { headers });
  }
}
