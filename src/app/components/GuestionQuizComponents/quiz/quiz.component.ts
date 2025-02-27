import { Component, OnInit } from '@angular/core';
import { QuizService } from 'src/app/services/quiz.service';
import { QuestionService } from 'src/app/services/question.service';
import { Quiz } from 'src/app/models/quiz';
import { Response } from 'src/app/models/response';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent implements OnInit {
  quizzes: Quiz[] = [];
  filteredQuizzes: Quiz[] = [];
  searchTerm: string = '';

  constructor(private quizService: QuizService, private questionService: QuestionService) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.quizService.getAllQuizzes().subscribe((data) => {
      this.quizzes = data;
      this.filteredQuizzes = data; // Initialisation avec tous les quiz
    });
  }

  deleteQuiz(id: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.quizService.deleteQuiz(id).subscribe({
          next: (message) => { // message est maintenant du texte et non du JSON
            Swal.fire('Supprimé !', message, 'success'); // Affiche le message du serveur
            this.loadQuizzes(); // Rafraîchir la liste des quiz après suppression
          },
          error: (err) => {
            Swal.fire('Erreur !', 'Une erreur est survenue.', 'error');
            console.error("Erreur lors de la suppression :", err);
          }
        });
      }
    });
  }

  deleteQuestion(questionId: number): void {
    this.quizService.deleteQuestion(questionId).subscribe(() => {
      this.loadQuizzes();
    });
  }

  addResponse(questionId: number, response: Response): void {
    this.quizService.addResponse(questionId, response).subscribe(() => {
      this.loadQuizzes();
    });
  }

  deleteResponse(responseId: number): void {
    this.quizService.deleteResponse(responseId).subscribe(() => {
      this.loadQuizzes();
    });
  }

  filterQuizzes(): void {
    const term = this.searchTerm.toLowerCase().trim();
  
    if (term === '') {
      this.filteredQuizzes = [...this.quizzes]; // Afficher tous les quiz si le champ est vide
      return;
    }
  
    this.filteredQuizzes = this.quizzes.filter(quiz => {
      return Object.entries(quiz).some(([key, value]) => {
        if (key === 'idQuiz') return false; // 🔥 Ignorer l'ID du quiz
        if (value === null || value === undefined) return false;
  
        let stringValue = value.toString().toLowerCase();
  
        // Vérification des dates
        if (value instanceof Date || (typeof value === 'string' && value.includes('T'))) {
          try {
            const date = new Date(value);
  
            // Format JJ/MM/AAAA
            const formattedDate = new Intl.DateTimeFormat('fr-FR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).format(date).toLowerCase();
  
            // Format Heure:Minute
            const formattedTime = new Intl.DateTimeFormat('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            }).format(date).toLowerCase();
  
            // Format complet JJ/MM/AAAA HH:mm
            const fullFormattedDate = `${formattedDate} ${formattedTime}`;
  
            return (
              formattedDate.includes(term) ||
              formattedTime.includes(term) ||
              fullFormattedDate.includes(term)
            );
          } catch (error) {
            console.error("Erreur de conversion de date :", error);
          }
        }
  
        return stringValue.includes(term);
      });
    });
  }  
  
}