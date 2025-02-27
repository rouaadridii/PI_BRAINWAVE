import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from 'src/app/services/quiz.service';
import { Quiz } from 'src/app/models/quiz';

@Component({
  selector: 'app-update-quiz',
  templateUrl: './update-quiz.component.html',
  styleUrls: ['./update-quiz.component.scss']
})
export class UpdateQuizComponent implements OnInit {
  updateQuizForm: FormGroup;
  quizId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.updateQuizForm = this.fb.group({
      titleQuiz: ['', Validators.required],
      duration: ['', [Validators.required, Validators.pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/), this.minDurationValidator]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  minDurationValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
    const duration = control.value;
    if (duration) {
      const [hours, minutes] = duration.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      if (totalMinutes < 1) {
        return { 'minDuration': true };
      }
    }
    return null;
  };

  dateRangeValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
    const formGroup = control as FormGroup;
    const startDate = formGroup.get('startDate')?.value;
    const endDate = formGroup.get('endDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const diff = end - start;
      const oneHour = 60 * 60 * 1000;

      if (diff < oneHour && diff !== oneHour) {
        return { 'dateRange': { message: 'La date de fin doit être supérieure à la date de début d\'au moins une heure.' } };
      }
    }
    return null;
  };

  goBack(): void {
    this.router.navigate(['/quizzes']);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('quizId');
      if (idParam) {
        this.quizId = +idParam;
        if (!isNaN(this.quizId)) {
          this.loadQuiz(this.quizId);
        } else {
          console.error("ID de quiz invalide");
          this.router.navigate(['/quizzes']);
        }
      }
    });
  }

  loadQuiz(id: number): void {
    this.quizService.getQuizById(id).subscribe({
      next: (quiz: Quiz) => {
        console.log("Quiz chargé:", quiz);
        this.updateQuizForm.patchValue({
          titleQuiz: quiz.titleQuiz,
          duration: quiz.duration,
          startDate: this.formatDateForInput(quiz.startDate),
          endDate: this.formatDateForInput(quiz.endDate)
        });
      },
      error: err => console.error("Erreur lors du chargement du quiz", err)
    });
  }

  formatDateForInput(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  updateQuiz(): void {
    if (this.updateQuizForm.valid && this.quizId !== null) {
      const formValue = this.updateQuizForm.value;
      const updatedQuiz: any = {
        id: this.quizId,
        titleQuiz: formValue.titleQuiz,
        duration: formValue.duration,
        startDate: new Date(formValue.startDate).toISOString().split('.')[0],
        endDate: new Date(formValue.endDate).toISOString().split('.')[0]
      };
      console.log("Données envoyées :", updatedQuiz);
      this.quizService.updateQuiz(this.quizId, updatedQuiz).subscribe({
        next: () => {
          console.log("Quiz mis à jour avec succès");
          this.router.navigate(['/quizzes']);
        },
        error: err => {
          console.error("Erreur lors de la mise à jour du quiz", err);
          alert("Erreur lors de la mise à jour");
        }
      });
    }
  }
}