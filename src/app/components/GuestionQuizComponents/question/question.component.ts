import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/question.service';
import { Question } from 'src/app/models/question';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements OnInit {
  quizId: number | null = null;
  questions: any[] = []; // Stocke les questions avec leurs réponses
  showResponses: { [key: number]: boolean } = {}; // Gère l'affichage des réponses

  constructor(
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.quizId = +params.get('quizId')!;
      console.log('ID du quiz:', this.quizId);
      this.loadQuestions();
    });
  }

  loadQuestions(): void {
    if (this.quizId !== null) {
        this.questionService.getListQuestionsByQuizId(this.quizId).subscribe({
            next: (data) => {
                console.log("Données reçues :", data);
                if (Array.isArray(data)) {
                    this.questions = data.map(q => ({
                        ...q,
                        imageUrl: q.questionPictureUrl || null // S'assure que imageUrl est bien traité
                    }));
                } else {
                    console.error("Erreur: l'API ne retourne pas une liste !");
                }
            },
            error: (error) => {
                console.error("Erreur lors de la récupération des questions :", error);
            }
        });
    }
}

  toggleResponses(idQuestion: number): void {
    this.showResponses[idQuestion] = !this.showResponses[idQuestion];
  }

  deleteQuestion(id: number): void {
    console.log("Tentative de suppression de la question ID:", id);  // <== Ajout du log
    Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: 'Cette action est irréversible !',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            this.questionService.deleteQuestion(id).subscribe({
                next: (message) => {
                    Swal.fire('Supprimé !', message, 'success');
                    this.loadQuestions(); 
                },
                error: (err) => {
                    Swal.fire('Erreur !', 'Une erreur est survenue.', 'error');
                    console.error("Erreur lors de la suppression :", err);
                }
            });
        }
    });
}

  editQuestion(question: Question): void {
    console.log('Modification de la question:', question);
  }

  goBack(): void {
    this.router.navigate(['/quizzes']);
}
}
