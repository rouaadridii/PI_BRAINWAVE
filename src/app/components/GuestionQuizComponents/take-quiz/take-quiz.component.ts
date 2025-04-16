import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { QuestionService } from 'src/app/services/question.service'; 
import { ResponseService } from 'src/app/services/response.service';
import { Question } from 'src/app/models/question';
import { StudentQuiz } from 'src/app/models/StudentQuiz';
import { QuizService } from 'src/app/services/quiz.service';  
import { StudentQuizService } from 'src/app/services/student-quiz-service.service'; 
import { jsPDF } from 'jspdf';
import { DragAndDropPair } from 'src/app/models/dragAndDropPair';

@Component({
  selector: 'app-take-quiz',
  templateUrl: './take-quiz.component.html',
  styleUrls: ['./take-quiz.component.scss']
})
export class TakeQuizComponent implements OnInit {
  quizId: number | null = null;
  id: number = 1;
  quizDetails: any = null;
  name: any = null;
  surname: any = null;
  email: any = null;
  questions: Question[] = [];
  selectedResponses: { [key: number]: number } = {};
  currentQuestionIndex: number = 0;
  showQuizQuestions: boolean = false;
  score: number | null = null;
  timer: number = 0;  // Durée du timer en secondes
  intervalId: any;  // ID de l'intervalle
  isSubmitted: boolean = false;
  quizStarted: boolean = false;
  paymentSuccess: boolean = false;
  payed: boolean = false;
  emailSent: boolean = false;

  dragAndDropPairs: { [questionId: number]: DragAndDropPair[] } = {};
  shuffledDragAndDropPairs: { [questionId: number]: DragAndDropPair[] } = {};
  droppedItems: { [key: string]: DragAndDropPair } = {};

  constructor(
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private responseService: ResponseService,
    private quizService: QuizService,
    private studentQuizService: StudentQuizService,
    private router: Router // Injectez Router
  ) {}

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('quizId'));
    this.loadQuizDetails();
    
    this.route.queryParams.subscribe(params => {
        if (params['paymentSuccess'] === 'true') {
          forkJoin([this.loadStudentQuizInfo()]).subscribe(() => {
            if(this.payed == false){
              this.updatePaymentStatus(this.id);
              window.location.reload();
            }
          });
            forkJoin([this.loadStudentQuizInfo()]).subscribe(() => {
              forkJoin([this.loadStudentInfo()]).subscribe(() => {
                if(this.payed == true && this.emailSent == false){
                  this.sendPaymentSuccessEmail();
                }
              });
            });
        }
        forkJoin([this.loadStudentQuizInfo()]).subscribe(() => {});
    });

    document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));
}

  ngOnDestroy(): void {
    // Nettoyer l'écouteur d'événement
    document.removeEventListener('visibilitychange', this.onVisibilityChange.bind(this));
  }

  goToPayment(): void {
    this.router.navigate(['/payement-stripe'], {queryParams: {quizId : this.quizId}});
  }

  updatePaymentStatus(studentCin: number) {
    if (this.quizId === null) {
      console.error("quizId est null. Impossible de mettre à jour le statut de paiement.");
      return;
    }
    this.studentQuizService.updatePaymentStatus(studentCin, this.quizId).subscribe(
      (response) => {
        console.log("Statut de paiement mis à jour avec succès :", response);
        // Rediriger ou afficher un message de succès
      },
      error => {
        console.error("Erreur lors de la mise à jour du statut de paiement :", error);
        // Gérer l'erreur
      }
    );
  }

  updateEmailStatus(studentCin: number) {
    if (this.quizId === null) {
      console.error("quizId est null. Impossible de mettre à jour le statut d'email.");
      return;
    }
    this.studentQuizService.updateEmailStatus(studentCin, this.quizId).subscribe(
      (response) => {
        console.log("Statut d'email mis à jour avec succès :", response);
        // Rediriger ou afficher un message de succès
      },
      error => {
        console.error("Erreur lors de la mise à jour du statut d'email :", error);
        // Gérer l'erreur
      }
    );
  }

  // Créer une fonction qui retourne l'observable de loadStudentInfo
  loadStudentInfo(): Observable<any> {
    return this.studentQuizService.getStudentByCin(this.id).pipe(
        map(student => {
            this.name = student.name;
            this.surname = student.surname;
            this.email = student.email;
            return student;
        }),
        catchError(error => {
            console.error("Erreur lors de la récupération des informations de l'étudiant :", error);
            return of(null); //important de retourner un observable même en cas d'erreur.
        })
    );
  }

  // Créer une fonction qui retourne l'observable de load Student_Quiz Info
  loadStudentQuizInfo(): Observable<StudentQuiz | null> {
    if (this.quizId != null) {
      return this.studentQuizService.getStudentQuizByStudentAndQuiz(this.id, this.quizId).pipe(
        map(studentQuiz => {
          this.payed = studentQuiz.payed;
          this.emailSent = studentQuiz.emailSent;
          return studentQuiz; // Retourner l'objet StudentQuiz complet
        }),
        catchError(error => {
          console.error("Erreur lors de la récupération des informations de l'étudiant et du quiz :", error);
          return of(null); 
        })
      );
    } else {
      console.error("quizId est null. Impossible de charger les informations de l'étudiant et du quiz.");
      return of(null);
    }
  }

    sendPaymentSuccessEmail() {
      const to = this.email;
      const subject = "Payment Confirmation - Quiz Access Granted";
      const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #2c3e50;">Payment Confirmation</h2>
        <p>Dear <strong>${this.name} ${this.surname}</strong>,</p>
        <p>We are pleased to inform you that your payment has been successfully processed.</p>
        <p>You now have full access to your quiz session. We wish you the best of luck!</p>
        <p>If you have any questions, feel free to contact our support team.</p>
        <hr>
        <p style="color: #777; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span>Best regards,<br>Your BRAINWAVE Team</span>
            <img src="https://res.cloudinary.com/dxldo1aut/image/upload/v1741208941/xz3ilh7eqgdzqnpcxav9.png" alt="Logo" style="width: 56px; height: auto; margin-left: 10px;">
        </p>
    </div>
`;
  
      console.log("Sending email to:", to);
      console.log("Subject:", subject);
      console.log("HTML Content:", htmlContent);
  
      this.studentQuizService.sendEmail(to, subject, htmlContent).subscribe(
          (response) => {
              console.log("Email sent successfully:", response);
              if (response && response.message) {
                  console.log(response.message); // Afficher le message de succès
              } else {
                  console.warn("Unexpected response format:", response); // Avertir si le format est inattendu
              }
          },
          (error) => console.error("Error sending email:", error)
      );
      this.updateEmailStatus(this.id);
  }

  loadQuizDetails(): void {
    if (this.quizId !== null) {
        this.quizService.getQuizById(this.quizId).subscribe(quiz => {
            this.quizDetails = quiz;

            if (!this.isValidDuration(quiz.duration)) {
                console.error('La durée du quiz est invalide :', quiz.duration);
                return;
            }

            this.timer = this.convertDurationToSeconds(quiz.duration);

            if (this.timer <= 0) {
                console.error('Durée de quiz invalide');
            }
        });
    }
  }

  // Fonction pour vérifier si la durée est au format HH:mm
  isValidDuration(duration: string): boolean {
    const regex = /^(\d{2}):(\d{2})$/; // Format HH:mm
    return regex.test(duration);
  }

  // Fonction pour convertir la durée 'HH:mm' en secondes
  convertDurationToSeconds(duration: string): number {
    if (!duration) return 0; // Retourne 0 si la durée est vide ou incorrecte

    const timeParts = duration.split(':');

    if (timeParts.length !== 2) {
      console.error('La durée doit être au format HH:mm');
      return 0; // Retourne 0 si la durée n'est pas au bon format
    }

    const hours = Number(timeParts[0]);
    const minutes = Number(timeParts[1]);

    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Erreur de conversion de la durée', { hours, minutes });
      return 0;
    }

    return (hours * 3600) + (minutes * 60); // Convertir uniquement en secondes
  }

  loadQuestions(): void {
    if (this.quizId !== null) {
      this.questionService.getListQuestionsByQuizId(this.quizId).subscribe(questions => {
        const shuffledQuestions = this.shuffleArray(questions); // Mélanger les questions ici
  
        const requests: Observable<any>[] = shuffledQuestions.map(question => {
          if (question.type === 'MULTIPLE_CHOICE') {
            return this.responseService.getListResponsesByQuestionId(question.idQuestion).pipe(
              map(responses => ({ ...question, responses: this.shuffleArray(responses) }))
            );
          } else if (question.type === 'DRAG_AND_DROP') {
            return this.responseService.getListDragAndDropByQuestionId(question.idQuestion).pipe(
              map(dragAndDropPairs => ({ ...question, dragAndDropPairs: this.shuffleArray(dragAndDropPairs) }))
            );
          } else {
            return this.responseService.getListResponsesByQuestionId(question.idQuestion).pipe(
              map(responses => ({ ...question, responses: this.shuffleArray(responses) }))
            );
          }
        });
  
        // Utiliser forkJoin pour combiner tous les Observables en un seul
        forkJoin(requests).subscribe(completeQuestions => {
          this.questions = completeQuestions;
          this.questions.forEach(question => {
            if (question.dragAndDropPairs) {
              this.dragAndDropPairs[question.idQuestion] = question.dragAndDropPairs;
              this.shuffledDragAndDropPairs[question.idQuestion] = this.shuffleArray(JSON.parse(JSON.stringify(question.dragAndDropPairs)));
            }
          });
          this.showQuizQuestions = true;
          this.currentQuestionIndex = 0;
          this.quizStarted = true;
          this.startTimer();
        });
      });
    }
  }

  shuffleArray(array: any[]): any[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  onDragStart(event: DragEvent, pair: DragAndDropPair) {
    event.dataTransfer?.setData('text/plain', pair.idDragAndDrop.toString()); // Stocker l'ID de la paire
}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    const target = event.target as HTMLElement;
    if (target.classList.contains('drop-item')) {
      target.classList.add('highlight'); // Highlight target on drag over
    }
  }

  onDrop(event: DragEvent, questionId: number, pairId: number) {
        event.preventDefault();
        const draggedPairId = event.dataTransfer?.getData('text/plain');
        const draggedPair = this.dragAndDropPairs[questionId].find(pair => pair.idDragAndDrop === Number(draggedPairId));
        if (draggedPair) {
            this.droppedItems[questionId + '-' + pairId] = draggedPair; // Stocker l'objet DragAndDropPair
            const index = this.shuffledDragAndDropPairs[questionId].findIndex(p => p.idDragAndDrop === Number(draggedPairId));
            if (index !== -1) {
                this.shuffledDragAndDropPairs[questionId].splice(index, 1);
            }
            console.log('onDrop - shuffledDragAndDropPairs:', this.shuffledDragAndDropPairs[questionId]);
            console.log('onDrop - droppedItems:', this.droppedItems);
        }
    }

trackByPair(index: number, pair: DragAndDropPair): number {
  return pair.idDragAndDrop;
}

resetDrop(questionId: number, pairId: number) {
  const droppedPair = this.droppedItems[questionId + '-' + pairId];
  if (droppedPair) {
      this.shuffledDragAndDropPairs[questionId].push(droppedPair);
      // this.shuffledDragAndDropPairs[questionId].sort((a, b) => a.idDragAndDrop - b.idDragAndDrop);
      delete this.droppedItems[questionId + '-' + pairId];
      console.log('resetDrop - shuffledDragAndDropPairs:', this.shuffledDragAndDropPairs[questionId]);
      console.log('resetDrop - droppedItems:', this.droppedItems);
      // Mise à jour de la vue
      this.shuffledDragAndDropPairs = { ...this.shuffledDragAndDropPairs };
      this.droppedItems = { ...this.droppedItems };
  }
}

  startTimer(): void {
    if (!this.quizStarted) {
      console.warn("Tentative de démarrer le timer avant que le quiz ne soit prêt.");
      return;
    }

    this.intervalId = setInterval(() => {
      if (this.timer > 0) {
        this.timer--;
      } else {
        if (this.quizStarted) {
          this.autoSubmitQuiz();
        } else {
          console.warn("Le timer a expiré avant le début du quiz. Pas de soumission automatique.");
        }
        clearInterval(this.intervalId); // Arrêter le timer après soumission
      }
    }, 1000);
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  autoSubmitQuiz(): void {
    if (!this.quizStarted || this.questions.length === 0) {
      console.warn("Le quiz n'a pas encore commencé. Pas de soumission automatique.");
      return;
    }

    if (this.isSubmitted) return;
    this.isSubmitted = true;
    clearInterval(this.intervalId);

    for (let question of this.questions) {
      if (question.type === 'DRAG_AND_DROP' && question.dragAndDropPairs) {
        for (const pair of this.dragAndDropPairs[question.idQuestion]) {
          const key = question.idQuestion + '-' + pair.idDragAndDrop;
          if (!this.droppedItems[key]) {
            this.droppedItems[key] = {
              idDragAndDrop: pair.idDragAndDrop,
              sourceText: '',
              targetText: '',
              questionId: pair.questionId
            };
          }
        }
      } else if (question.type === 'MULTIPLE_CHOICE') {
        if (this.selectedResponses[question.idQuestion] === undefined) {
          // Traiter une question à choix multiple non répondue comme une réponse incorrecte
          this.selectedResponses[question.idQuestion] = -1; // Ou une autre valeur par défaut pour indiquer l'absence de réponse
        }
      }
    }
    this.submitQuiz();
  }

/*getIncorrectResponse(question: Question): number {
    if (!question.responses || question.responses.length === 0) {
        console.warn(`Aucune réponse trouvée pour la question ${question.idQuestion}`);
        return -1;
    }

    const incorrectResponse = question.responses.find(response => !(response as any).isCorrect);
    if (incorrectResponse) {
        return incorrectResponse.idResponse;
    } else {
        return question.responses[0].idResponse;
    }
}*/

submitQuiz(): void {
    const responsesToSubmit: { questionId: number, response: any, responseType: string }[] = [];
    let hasResponses = false;
    let allMultipleChoiceAnswered = true; // Ajout d'une variable pour suivre les réponses à choix multiples

    for (const question of this.questions) {
      let response: any;
      let responseType: string;

      if (question.type === 'DRAG_AND_DROP') {
        const dragAndDropResponses: { [key: string]: { sourceText: string, targetText: string } } = {};
        let allPairsFilled = true;

        for (const pair of this.dragAndDropPairs[question.idQuestion]) {
          const droppedPair = this.droppedItems[question.idQuestion + '-' + pair.idDragAndDrop];
          if (droppedPair) {
            dragAndDropResponses[question.idQuestion + '-' + pair.idDragAndDrop] = {
              sourceText: droppedPair.sourceText,
              targetText: droppedPair.targetText
            };
            hasResponses = true;
          } else {
            allPairsFilled = false;
            break;
          }
        }

        if (!allPairsFilled) {
          alert("Please fill in all pairs for Drag and Drop questions before submitting!");
          return;
        }

        response = dragAndDropResponses;
        responseType = 'DRAG_AND_DROP';
      } else {
        response = this.selectedResponses[question.idQuestion];
        responseType = 'MULTIPLE_CHOICE';

        if (response === undefined) {
          allMultipleChoiceAnswered = false; // Marquer une question à choix multiple comme non répondue
        } else {
          hasResponses = true;
        }
      }

      if (response === undefined && question.type !== 'DRAG_AND_DROP') {
        continue; // Passer à la question suivante si aucune réponse n'est sélectionnée pour une question à choix multiple
      }

      responsesToSubmit.push({
        questionId: question.idQuestion,
        response: response,
        responseType: responseType,
      });
    }

    // Vérification avant la soumission
    if (!allMultipleChoiceAnswered) {
      alert("You have not answered all multiple-choice questions!")
      return;
    }

    if (!hasResponses) {
      console.warn("No answer selected. Submission not allowed.");
      return;
    }

    console.log('Réponses envoyées au serveur:', responsesToSubmit);

    if (this.quizId !== null && this.id !== null) {
      this.studentQuizService.evaluateQuiz(this.quizId, this.id, responsesToSubmit).subscribe(
        (score) => {
          this.score = score;
          this.showQuizQuestions = false;
        },
        (error) => {
          console.error("Erreur lors de l'évaluation du quiz:", error);
        }
      );
    }
  }

  getScoreColor(): string {
    if (this.score !== null) {
      if (this.score >= 50) {
        return '#2ecc71'; // Vert
      } else {
        return '#e74c3c'; // Rouge
      }
    } else {
      return '#bdc3c7'; // Couleur par défaut si score est null
    }
  }

  // Fonction pour convertir les secondes en format HH:mm:ss
  formatTimeWithSeconds(seconds: number): string {
    if (isNaN(seconds)) {
        console.error('Timer invalide:', seconds);
        return '00:00:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`;
}

  // Fonction pour ajouter un zéro devant si le nombre est inférieur à 10
  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  // Méthode pour détecter si l'utilisateur change d'onglet
  onVisibilityChange(): void {
    if (document.hidden) {
      this.autoSubmitQuiz();  // Soumettre le quiz si l'utilisateur change d'onglet
    }
  }
  
  // Méthode pour générer le certificat PDF et le télécharger
  downloadCertificate(): void {
    const doc = new jsPDF();

    // Ajouter l'image de fond (optionnel)
    let imgWidth = 210; // Largeur maximale
    let imgHeight = (496 / 690) * imgWidth; // Ajustement proportionnel
    
    if (imgHeight > 297) {
        imgHeight = 297;
        imgWidth = (690 / 496) * imgHeight;
    }
    
    let x = (210 - imgWidth) / 2; // Centrage horizontal
    let y = (297 - imgHeight) / 2; // Centrage vertical
    
    doc.addImage('assets/certificate-background.png', 'PNG', x, y, imgWidth, imgHeight);    

    // Ajouter le texte sur le certificat
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.text(`This is to certify that`, 60, 154, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`${this.name} ${this.surname}`, 70, 164, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.text(`has successfully completed the quiz`, 100, 174, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`${this.quizDetails?.titleQuiz}`, 110, 182, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(`With a score of ${this.score}%`, 160, 190, { align: "center" });

    // Ajouter un bouton pour télécharger le certificat
    doc.save(`Certificat_${this.name}_${this.surname}.pdf`);
  }

}