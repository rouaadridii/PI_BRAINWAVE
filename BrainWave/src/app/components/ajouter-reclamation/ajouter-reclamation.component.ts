import { Component } from '@angular/core';
import { ReclamationService } from '../../services/reclamation.service';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ajouter-reclamation',
  templateUrl: './ajouter-reclamation.component.html',
  styleUrls: ['./ajouter-reclamation.component.scss'], // Correction du nom de la propriété
})
export class AjouterReclamationComponent {
  recform: any;
  today: string; // Variable pour stocker la date d'aujourd'hui

  constructor(private recservice: ReclamationService, private fb: FormBuilder) {
    // Initialiser le formulaire
    this.recform = this.fb.group({
      date: ['', Validators.required],
      objet: ['', Validators.required],
      statut: ['non traité'],
      description: [''],
    });

    // Obtenir la date d'aujourd'hui au format YYYY-MM-DD
    const todayDate = new Date();
    this.today = todayDate.toISOString().split('T')[0]; // Formater la date pour le champ date
  }

  onSubmit() {
    const formData = this.recform.value;

    // Soumettre le formulaire via le service
    this.recservice.ajouterreclamation(formData).subscribe(
      (response) => {
        Swal.fire({
          title: "Good job!",
          text: "Réclamation ajoutée avec succès!",
          icon: "success"
        });
        console.log(response);
        // Réinitialiser le formulaire après soumission réussie
        this.recform.reset();
      },
      (error) => {
        Swal.fire({
          title: "Erreur!",
          text: "Une erreur s'est produite lors de l'ajout de la réclamation.",
          icon: "error"
        });
        console.error(error);
      }
    );
  }
}
