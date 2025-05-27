import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TvaService } from '../../services/tva/tva-service';
import { AlertService } from '../../services/alert/alert-messages.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'bill-confirm-modal',
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css'
})
export class ConfirmModalComponent implements OnInit{

  item: any
  composant : any

  constructor(private readonly activeModal: NgbActiveModal,
    private readonly alertService: AlertService,
    private readonly tvaService: TvaService
  ) {
   
  }

  ngOnInit(){}


  cancel(): void {
   this.activeModal.dismiss();
  }

  confirmDelete(): void {    
    if (this.item == 'Tva') {     
      this.deleteTva(this.composant.id);
    }
  }

  deleteTva(id : number) {
    this.tvaService.deleteTvaById(id).subscribe({
      next: () => {       
        this.activeModal.close();       
        this.onSuccess('DELETE,TVA');
      },
      error: (err) => {
        this.onError(err);
      },
    });
  }


  private onSuccess(respSuccess: any) {
    this.alertService.show(respSuccess, 'success');
  }

  private onError(error: any) { 

  }

}
