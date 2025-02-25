import { Component, OnInit } from '@angular/core';
import { ReclamationService } from 'src/app/services/reclamation.service';

@Component({
  selector: 'app-admin-reclamation',
  templateUrl: './admin-reclamation.component.html',
  styleUrls: ['./admin-reclamation.component.scss']
})
export class AdminReclamationComponent implements OnInit {

  reclamations: any[] = [];
  reclamationEnCours: any = null;
  searchTerm: string = '';
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
    private reclamationService: ReclamationService,
  ) {}

  ngOnInit(): void {
    this.loadReclamations();
  }

  loadReclamations(): void {
    this.reclamationService.getReclamation().subscribe(
      (data) => {
        this.reclamations = data;
        this.calculateStatistics(); // Calculer les statistiques après le chargement
      },
      (error) => {
        console.error('Erreur lors de la récupération des réclamations:', error);
      }
    );
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

  modifierStatut(reclamation: any): void {
    this.reclamationService.modifierReclamation(reclamation).subscribe(
      () => {
        console.log("Statut mis à jour avec succès");
        this.calculateStatistics(); // Recalculer les statistiques après modification
      },
      (error) => {
        console.error("Erreur lors de la mise à jour du statut:", error);
      }
    );
  }

  calculateStatistics(): void {
    const treatedCount = this.reclamations.filter(r => r.statut === 'traité').length;
    const untreatedCount = this.reclamations.filter(r => r.statut === 'non traité').length;

    this.barChartData = [treatedCount, untreatedCount];
  }

  filterReclamations(): any[] {
    return this.reclamations.filter(reclamation =>
      reclamation.objet.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      reclamation.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
