// angular import
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnsplashService } from '../../services/unsplash/unsplash.service';

@Component({
  selector: 'bill-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  photos: any[] = [];
  query = 'nature';
  photoUrl: string | null = null;

  constructor(private readonly unsplashService: UnsplashService) { }

  ngOnInit() {
    this.unsplashService.searchPhotos(this.query).subscribe((data: any) => {
      if (data) {
        this.photos = data.results;
      }     
    });

    this.unsplashService.getRandomPhoto('nature').subscribe((data) => {
      if (data) {
        this.photoUrl = data.urls.regular;
      }     
    });
  }
}
