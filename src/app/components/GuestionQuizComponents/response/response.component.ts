import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResponseService } from 'src/app/services/response.service';
import { QuestionService } from 'src/app/services/question.service';
import { Response } from 'src/app/models/response';
import { DragAndDropPair } from 'src/app/models/dragAndDropPair';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-responses',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.scss']
})
export class ResponseComponent implements OnInit {
    questionId!: number;
    responses: Response[] = [];
    dragAndDropPairs: DragAndDropPair[] = [];
    questionType: string = '';
  
    constructor(
      private route: ActivatedRoute,
      private responseService: ResponseService,
      private questionService: QuestionService,
      private router: Router
    ) {}
  
    ngOnInit(): void {
        this.questionId = Number(this.route.snapshot.paramMap.get('id'));
      
        if (this.questionId !== null) {
          this.getQuestionTypeAndResponses();
        }
      }
      
      getQuestionTypeAndResponses(): void {
        this.questionService.getQuestionById(this.questionId!).subscribe({
          next: (question) => {
            this.questionType = question.type;
            console.log("Type de la question :", this.questionType);
            this.getResponsesForQuestion(); // Appeler après avoir obtenu le type
          },
          error: (error) => {
            console.error("Erreur lors de la récupération du type de question :", error);
          }
        });
      }      
  
    getResponsesForQuestion(): void {
        if (this.questionType === 'DRAG_AND_DROP') {
          this.responseService.getListDragAndDropByQuestionId(this.questionId!).subscribe({
            next: (data) => {
              console.log("Paires Drag & Drop reçues :", data);
              this.dragAndDropPairs = data;
            },
            error: (error) => {
              console.error("Erreur lors de la récupération des paires Drag & Drop :", error);
            }
          });
        } else {
          this.responseService.getListResponsesByQuestionId(this.questionId!).subscribe({
            next: (data) => {
              console.log("Données reçues :", data);
              this.responses = data;
            },
            error: (error) => {
              console.error("Erreur lors de la récupération des réponses :", error);
            }
          });
        }
      }
      
  
      deleteResponse(id: number): void {
        Swal.fire({
          title: 'Êtes-vous sûr ?',
          text: 'Cette action est irréversible !',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Oui, supprimer',
          cancelButtonText: 'Annuler'
        }).then((result) => {
          if (result.isConfirmed) {
            let deleteObservable;
      
            if (this.questionType === 'DRAG_AND_DROP') {
                if (!id) {
                    console.error("ID invalide pour la suppression !");
                    return;
                  }
                  deleteObservable = this.responseService.deleteDragAndDropPair(id);
                              } else {
              deleteObservable = this.responseService.deleteResponse(id);
            }
      
            deleteObservable.subscribe({
              next: () => {
                Swal.fire('Supprimé !', 'Réponse supprimée avec succès.', 'success');
                this.getResponsesForQuestion();
              },
              error: (err) => {
                Swal.fire('Erreur !', 'Une erreur est survenue.', 'error');
                console.error("Erreur lors de la suppression :", err);
              }
            });
          }
        });
      }
      
      goBack(): void {
        this.questionService.getQuestionById(this.questionId).subscribe(question => {
            console.log("Question reçue dans goBack :", question);
            if (question && question.quizId !== undefined) {
                const quizId = question.quizId;
                this.router.navigate(['/questions', quizId]);
            } else {
                console.error('quizId est undefined ou la question est invalide.');
                this.router.navigate(['/quizzes']);
            }
        });
    }
  }  