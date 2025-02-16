import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { CoursesService } from 'src/app/services/courses.service';

@Component({
  selector: 'app-dashboard-statistics',
  templateUrl: './dashboard-statistics.component.html',
  styleUrls: ['./dashboard-statistics.component.scss']
})
export class DashboardStatisticsComponent implements OnInit, AfterViewInit {
  courseStatistics: any[] = [];
  chart: any;

  constructor(private coursService: CoursesService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngAfterViewInit(): void {
    this.createChart(); // Créez le graphique après que la vue est initialisée
  }

  loadStatistics(): void {
    this.coursService.getCourseStatisticsByCategory().subscribe({
      next: (data) => {
        this.courseStatistics = Object.keys(data).map((key) => ({
          name: key,
          value: data[key]
        }));
        console.log('Statistiques des cours:', this.courseStatistics);
        this.createChart(); // Créez le graphique après avoir récupéré les données
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
      }
    });
  }

  createChart(): void {
    if (this.chart) {
      this.chart.destroy(); // Détruire l'ancien graphique si nécessaire
    }

    const labels = this.courseStatistics.map(stat => stat.name);
    const data = this.courseStatistics.map(stat => stat.value);

    const ctx = document.getElementById('courseChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar', // Choisir le type de graphique (barres ici)
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de Cours',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            enabled: true
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}
