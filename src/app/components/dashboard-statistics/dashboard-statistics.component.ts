import { Component, OnInit, OnDestroy } from '@angular/core';
import {
    Chart, ChartData, ChartOptions, DoughnutController, ArcElement, Tooltip, Legend
} from 'chart.js';
// import ChartDataLabels from 'chartjs-plugin-datalabels'; // Décommentez si utilisé
import { CoursesService } from 'src/app/Core/services/courses.service';
import { Subscription, forkJoin } from 'rxjs';

// --- Palettes de couleurs ---
const professionalColors = ['rgba(54, 162, 235, 0.8)', 'rgba(201, 203, 207, 0.8)'];
const professionalHoverColors = ['rgba(54, 162, 235, 1)', 'rgba(180, 183, 187, 1)'];
const categoryPalette = [
  '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948',
  '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC', '#86BCB6', '#F19C59',
  '#E48C8D', '#A8D8D4', '#9FD39A' // Ajoutez si besoin
];
const getColor = (index: number): string => categoryPalette[index % categoryPalette.length];

@Component({
  selector: 'app-dashboard-statistics',
  templateUrl: './dashboard-statistics.component.html',
  styleUrls: ['./dashboard-statistics.component.scss']
})
export class DashboardStatisticsComponent implements OnInit, OnDestroy {
  // --- Propriétés ---
  totalCourses: number = 0;
  publishedCourses: number = 0;
  unpublishedCourses: number = 0;
  centerTextLine1: string = '';
  centerTextLine2: string = 'Cours';
  overallChartInstance: Chart<'doughnut', number[], unknown> | null = null;
  categoryDistributionLabels: string[] = [];
  categoryDistributionData: number[] = [];
  categoryDistributionColors: string[] = [];
  categoryDistributionChartInstance: Chart<'doughnut', number[], string> | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  private dataSubscription: Subscription | null = null;

  constructor(private coursesService: CoursesService) {
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);
    // Chart.register(ChartDataLabels); // Enregistrer si utilisé
  }

  ngOnInit(): void {
    this.loadAllStatistics();
  }

  ngOnDestroy(): void {
    this.destroyAllCharts();
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  loadAllStatistics(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.destroyAllCharts();

    this.dataSubscription = forkJoin({
      overall: this.coursesService.getCourseStatistics(),
      category: this.coursesService.getCategoryStatistics()
    }).subscribe({
      next: (results) => {
        // --- Traitement Stats Globales ---
        const overallStats = results.overall;
        this.totalCourses = overallStats?.totalCourses ?? 0;
        this.publishedCourses = overallStats?.publishedCourses ?? 0;
        this.unpublishedCourses = overallStats?.unpublishedCourses ?? 0;
        this.centerTextLine1 = this.totalCourses.toString();
        this.centerTextLine2 = this.totalCourses === 1 ? 'Cours total' : 'Cours totaux';

        // --- Préparation données Catégories ---
        const rawCategoryStats = results.category;
        console.log('Raw Category Stats Received:', rawCategoryStats);
        this.prepareCategoryDistributionData(rawCategoryStats || {});

        // --- Création des graphiques ---
        setTimeout(() => {
          this.createOverallChart();
          // Appel à generateLegend() supprimé
          this.createCategoryDistributionChart();
        }, 0);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des statistiques:', error);
        this.errorMessage = "Une erreur s'est produite lors du chargement des statistiques.";
        this.isLoading = false;
      }
    });
  }

  prepareCategoryDistributionData(rawStats: any): void {
    this.categoryDistributionLabels = [];
    this.categoryDistributionData = [];
    this.categoryDistributionColors = [];
    if (typeof rawStats !== 'object' || rawStats === null) {
      console.warn('Invalid data received for category statistics:', rawStats);
      return;
    }
    let colorIndex = 0;
    Object.keys(rawStats).forEach(categoryName => {
      const totalInCategory = rawStats[categoryName];
      if (typeof totalInCategory === 'number' && totalInCategory > 0) {
        this.categoryDistributionLabels.push(categoryName);
        this.categoryDistributionData.push(totalInCategory);
        this.categoryDistributionColors.push(getColor(colorIndex++));
      } else {
         console.log(`Skipping category "${categoryName}" due to invalid or zero count:`, totalInCategory);
      }
    });
     console.log('Prepared Category Data:', this.categoryDistributionData);
  }

  createOverallChart(): void {
    const canvas = document.getElementById('overallChart') as HTMLCanvasElement;
    if (!canvas) return;
    const chartData: ChartData<'doughnut', number[], unknown> = {
      labels: ['Cours Publiés', 'Cours Non Publiés'], // Labels pour la légende intégrée
      datasets: [{ label: 'Cours Globaux', data: [this.publishedCourses, this.unpublishedCourses], backgroundColor: professionalColors, borderColor: professionalColors.map(c => c.replace('0.8', '1')), hoverBackgroundColor: professionalHoverColors, hoverBorderColor: professionalHoverColors.map(c => c.replace('0.8', '1')), borderWidth: 1, hoverOffset: 8 }]
    };
    const chartOptions: ChartOptions<'doughnut'> = {
        responsive: true, maintainAspectRatio: false, cutout: '70%', animation: { animateRotate: true, animateScale: true },
        plugins: {
          // Légende Chart.js activée pour ce graphique
          legend: {
            display: true,
            position: 'bottom',
            labels: { boxWidth: 15, padding: 15, font: { size: 11 } }
          },
          tooltip: { enabled: true, backgroundColor: 'rgba(0, 0, 0, 0.85)', padding: 10, callbacks: {
              label: function (context) {
                  let label = context.label || '';
                  if (label) { label += ': '; }
                  const value = context.parsed ?? 0;
                  label += value + (value === 1 ? ' cours' : ' cours');
                  return label;
              }
          } }
        }
    };
    this.overallChartInstance = new Chart(canvas, { type: 'doughnut', data: chartData, options: chartOptions });
  }

  // Fonction generateLegend() supprimée

  createCategoryDistributionChart(): void {
     const canvas = document.getElementById('categoryDistributionChart') as HTMLCanvasElement;
     if (!canvas || this.categoryDistributionData.length === 0) {
       console.log("Skipping category chart creation: No data or canvas not found.");
       return;
     }
     const chartData: ChartData<'doughnut', number[], string> = {
         labels: this.categoryDistributionLabels,
         datasets: [{ label: 'Cours par Catégorie', data: this.categoryDistributionData, backgroundColor: this.categoryDistributionColors, borderColor: this.categoryDistributionColors, hoverBackgroundColor: this.categoryDistributionColors.map(c => `${c}E6`), hoverBorderColor: this.categoryDistributionColors, borderWidth: 1, hoverOffset: 8 }]
     };
     const chartOptions: ChartOptions<'doughnut'> = {
         responsive: true, maintainAspectRatio: false, cutout: '60%',
         plugins: {
           legend: { display: true, position: 'bottom', align: 'center', labels: { boxWidth: 15, padding: 15, font: { size: 11 } } },
           tooltip: { enabled: true, backgroundColor: 'rgba(0,0,0,0.8)', padding: 10, cornerRadius: 4, usePointStyle: true,
             callbacks: {
                label: (context) => { /* ... calcul pourcentage ... */
                   const label = context.label || ''; const value = context.parsed ?? 0;
                   const total = context.chart.data.datasets[0].data.reduce((acc: number, cur) => (typeof cur === 'number' ? acc + cur : acc), 0);
                   const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                   return `${label}: ${value} cours (${percentage}%)`;
                }
             }
           },
           // datalabels: { /* ... */ } // Si utilisé
         }
     };
     this.categoryDistributionChartInstance = new Chart(canvas, { type: 'doughnut', data: chartData, options: chartOptions /*, plugins: [ChartDataLabels] */ });
  }

  destroyAllCharts(): void {
    if (this.overallChartInstance) { this.overallChartInstance.destroy(); this.overallChartInstance = null; }
    if (this.categoryDistributionChartInstance) { this.categoryDistributionChartInstance.destroy(); this.categoryDistributionChartInstance = null; }
  }
}