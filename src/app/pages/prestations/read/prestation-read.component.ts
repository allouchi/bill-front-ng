import { Component, OnInit } from '@angular/core';
import { PrestationService } from '../../../services/prestations/prestation.service';
import { Router } from '@angular/router';
import Prestation from '../../../models/Prestation';



@Component({
  selector: 'bill-prestation-read',
  standalone: true,
  imports: [],
  templateUrl: './prestation-read.component.html',
  styleUrl: './prestation-read.component.css'
})
export class PrestationReadComponent implements OnInit{
  prestations!: Prestation[];

  constructor(private readonly prestationService: PrestationService, private readonly router: Router) { }

  ngOnInit(): void {  
      
    this.prestationService.getPrestationsBySiret("85292702900011").subscribe({
      next: (prestations) => {       
        this.onResponseSuccess(prestations)
      },
      error: (err) => {
        this.onResponseError(err)
      },
      complete: () => {
        console.log('Requête terminée.');
      }
    });
  } 


  private onResponseSuccess(prestations: Prestation[]) {
    console.log("prestations :", prestations) 
    this.prestations = prestations;
      
  }

  private onResponseError(error: any) {
    console.log("error :", error)
  }

}
