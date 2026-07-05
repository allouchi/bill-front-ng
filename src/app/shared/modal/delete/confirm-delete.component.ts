import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

/**
 * Generic delete-confirmation modal.
 *
 * It is purely presentational: it only resolves ('confirm') / dismisses ('cancel').
 * The actual delete + list refresh is owned by each read component so errors are surfaced
 * and the list stays in sync.
 */
@Component({
  selector: 'bill-confirm-modal',
  imports: [CommonModule],
  templateUrl: './confirm-delete.component.html',
  styleUrl: './confirm-delete.component.css',
})
export class ConfirmDeleteComponent {
  item: any;
  composant: any;

  constructor(private readonly activeModal: NgbActiveModal) { }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  confirmDelete(): void {
    this.activeModal.close('confirm');
  }
}
