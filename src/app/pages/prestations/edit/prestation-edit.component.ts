import { Component } from '@angular/core';


declare var window: any; // Déclarer globalement la fenêtre si besoin

@Component({
  selector: 'bill-prestation-edit',
  standalone: true,
  imports: [],
  templateUrl: 'prestation-edit.component.html',
  styleUrl: './prestation-edit.component.css',
})
export class PrestationEditComponent {
  openModal() {
    // Utilise le mécanisme Bootstrap pour ouvrir le modal
    const modal = new window.bootstrap.Modal(
      document.getElementById('exampleModal')
    );
    modal.show();
  }
}
