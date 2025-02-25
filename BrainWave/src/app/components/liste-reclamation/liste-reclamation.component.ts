import { Component, OnInit } from '@angular/core';
import { ReclamationService } from '../../services/reclamation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-liste-reclamations',
  templateUrl: './liste-reclamation.component.html',
  styleUrls: ['./liste-reclamation.component.scss']
})
export class ListeReclamationsComponent implements OnInit {
  reclamations: any[] = [];
  reclamationEnCours: any = null;
  objet: string = '';
  userRolel: string | null = null;

  // Configuration du graphique en barres
  public barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  public barChartLabels = ['Traité', 'Non traité'];
  public barChartData: number[] = [0, 0];

  constructor(
    private reclamationService: ReclamationService, private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReclamations();
  }

  loadReclamations(): void {
    this.reclamationService.getReclamation().subscribe(
      (data) => {
        this.reclamations = data;
        this.calculateStatistics(); // Calculer les statistiques après le chargement
        this.filterReclamations();  // Appliquer la recherche après avoir chargé les réclamations
      },
      (error) => {
        console.error('Erreur lors de la récupération des réclamations:', error);
      }
    );
  }

  filterReclamations(): void {
    // Filtrer les réclamations selon l'objet et la description
    if (this.objet && this.objet.trim() !== '') {
      this.reclamations = this.reclamations.filter(
        (reclamation) =>
          reclamation.objet.toLowerCase().includes(this.objet.toLowerCase()) ||
          reclamation.description.toLowerCase().includes(this.objet.toLowerCase())
      );
    }
  }

  supprimerReclamation(id: number): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette réclamation ?")) {
      this.reclamationService.supprimerReclamation(id).subscribe(
        () => {
          this.loadReclamations();
        },
        (error) => {
          console.error("Erreur lors de la suppression de la réclamation :", error);
        }
      );
    }
  }

 

  calculateStatistics(): void {
    const treatedCount = this.reclamations.filter(r => r.statut === 'traité').length;
    const untreatedCount = this.reclamations.filter(r => r.statut === 'non traité').length;

    this.barChartData = [treatedCount, untreatedCount];
  }

  goToAddReclamation() {
    this.router.navigate(['/ajouterrecalamtion']);  // Redirige vers la route 'ajouter-reclamation'
  }

  modifierReclamation(reclamation: any): void {
    // Convertir la date au format attendu 'yyyy-MM-dd'
    reclamation.date = this.formatDate(reclamation.date);
    this.reclamationEnCours = { ...reclamation };  // Cloner la réclamation pour l'éditer
  }

  formatDate(date: string): string {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
    const day = String(formattedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  updateReclamation(): void {
    // Mettre à jour la réclamation via le service
    if (this.reclamationEnCours) {
      this.reclamationService.modifierReclamation(this.reclamationEnCours).subscribe(
        (response) => {
          console.log("Réclamation mise à jour avec succès");
          this.loadReclamations(); // Recharger les réclamations après la modification
          this.reclamationEnCours = null; // Réinitialiser l'édition
        },
        (error) => {
          console.error("Erreur lors de la mise à jour de la réclamation:", error);
        }
      );
    }
  }
}
