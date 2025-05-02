import { Component } from '@angular/core';
import Consultant from '../../../models/Consultant';
import { ConsultantService } from '../../../services/consultants/consultant-service';
import { Router } from '@angular/router';

@Component({
  selector: 'bill-consultant-read',
  standalone: true,
  imports: [],
  templateUrl: './consultant-read.component.html',
  styleUrl: './consultant-read.component.css'
})
export class ConsultantReadComponent {

  consultants: Consultant[] = [];

  constructor(
    private readonly consultantService: ConsultantService,
    private readonly router: Router
  ) { }



  ngOnInit(): void {

    this.consultantService.findConsultants().subscribe({
      next: (consultants) => {
        this.onResponseSuccess(consultants);
      },
      error: (err) => {
        this.onResponseError(err);
      },
      complete: () => {
        console.log('Requête terminée.');
      },
    });

  }


  private onResponseSuccess(consultants: Consultant[]) {
    this.consultants = consultants;
  }


  private onResponseError(error: any) {
    console.log('error :', error);
  }


  deleteConsultant(consultant: Consultant) {
    const ok = confirm(
      `Voulez-vous vraiment supprimer "${consultant.firstName}" ?`
    );
    if (ok) {
      console.log(consultant.firstName);
    }
  }

  updateConsultant(consultant: Consultant) {
    const ok = confirm(
      `Voulez-vous vraiment mettre à jour "${consultant.firstName}" ?`
    );
    if (ok) {
      console.log(consultant.firstName);
    }
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

}
