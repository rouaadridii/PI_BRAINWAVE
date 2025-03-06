import { Component, OnInit } from '@angular/core';
import { Chart, registerables, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { CoursesService } from 'src/app/Core/services/courses.service';

@Component({
  selector: 'app-dashboard-statistics',
  templateUrl: './dashboard-statistics.component.html',
  styleUrls: ['./dashboard-statistics.component.scss']
})
export class DashboardStatisticsComponent implements OnInit {

  totalCourses: number = 0;
  publishedCourses: number = 0;
  unpublishedCourses: number = 0;
  categoryStats: any = {};
  errorMessage: string | null = null;

  constructor(private coursesService: CoursesService) {
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);
  }

  ngOnInit(): void {

    this.coursesService.getCourseStatistics().subscribe({
      next: (stats) => {
        this.totalCourses = stats.totalCourses;
        this.publishedCourses = stats.publishedCourses;
        this.unpublishedCourses = stats.unpublishedCourses;
        this.categoryStats = stats.categoryStats;
        this.createChart();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des statistiques:', error);
        this.errorMessage = "Une erreur s'est produite lors du chargement des statistiques.";
      }
    });
  }

  createChart(): void {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('Canvas element not found');
      return;
    }

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Cours Publiés', 'Cours Non Publiés'],
        datasets: [{
          data: [this.publishedCourses, this.unpublishedCourses],
          backgroundColor: [
            'rgba(173, 216, 230, 0.8)',
            'rgba(255, 228, 181, 0.8)'
          ],
          borderColor: [
             'rgba(173, 216, 230, 1)',
            'rgba(255, 228, 181, 1)'
          ],
          borderWidth: 1,
          hoverOffset: 10,

        }]
      },
      options: {
        cutout: '70%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255,255,255,0.2)',
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                label += context.parsed + ' cours';
                return label;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true
        }
      }
    });
    this.generateLegend();

  }
  generateLegend(): void {
    const legendContainer = document.getElementById('legend');
    if (!legendContainer) return;

    const labels = ['Cours Publiés', 'Cours Non Publiés'];
    const colors = [
      'rgba(173, 216, 230, 0.8)', // Bleu clair
      'rgba(255, 228, 181, 0.8)'  // Beige clair
    ];

    let legendHTML = '';
    for (let i = 0; i < labels.length; i++) {
      const labelClass = i === 0 ? 'legend-label-published' : 'legend-label-unpublished';
      const words = labels[i].split(' '); // Divise la chaîne en mots
      legendHTML += `
        <div class="legend-item">
          <span class="legend-color" style="background-color: ${colors[i]}"></span>
          <span class="legend-label ${labelClass}">
            <span class="first-word">${words[0]}</span><span>${words.slice(1).join(' ')}</span>
          </span>
        </div>
      `;
    }

    legendContainer.innerHTML = legendHTML;
  }
}