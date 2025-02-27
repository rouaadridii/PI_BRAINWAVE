import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { QuizService } from 'src/app/services/quiz.service';
import { Quiz } from 'src/app/models/quiz';

@Component({
  selector: 'app-add-quiz',
  templateUrl: './add-quiz.component.html',
  styleUrls: ['./add-quiz.component.scss']
})
export class AddQuizComponent {
  quizForm: FormGroup;

  constructor(private fb: FormBuilder, private quizService: QuizService, private router: Router) {
    this.quizForm = this.fb.group({
      quizzesArray: this.fb.array([])
    });
    this.addAnotherQuiz(); // Ajouter un premier formulaire de quiz
  }

  get quizzesArray(): FormArray {
    return this.quizForm.get('quizzesArray') as FormArray;
  }

  newQuizForm(): FormGroup {
    const now = new Date();
    const formattedNow = now.toISOString().slice(0, 16);

    return this.fb.group({
      titleQuiz: ['', Validators.required],
      duration: ['', [Validators.required, Validators.pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/), this.minDurationValidator]],
      startDate: [formattedNow, Validators.required],
      endDate: [formattedNow, Validators.required]
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

  addAnotherQuiz(): void {
    this.quizzesArray.push(this.newQuizForm());
  }

  removeQuiz(index: number): void {
    this.quizzesArray.removeAt(index);
  }

  addQuizzes(): void {
    if (this.quizForm.valid) {
      const quizzesToAdd: Quiz[] = this.quizzesArray.controls.map(control => {
        const quizData: Quiz = {
          ...control.value,
          startDate: new Date(control.value.startDate).toISOString().split('.')[0],
          endDate: new Date(control.value.endDate).toISOString().split('.')[0]
        };
        return quizData;
      });

      quizzesToAdd.forEach(quiz => {
        this.quizService.addQuiz(quiz).subscribe({
          next: (response) => {
            console.log('Quiz ajouté avec succès', response);
            if (quizzesToAdd.indexOf(quiz) === quizzesToAdd.length - 1) {
              this.router.navigate(['/quizzes']);
            }
          },
          error: (err) => {
            console.error("Erreur lors de l'ajout du quiz", err);
            alert("Erreur lors de l'ajout du quiz");
          }
        });
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/quizzes']);
  }
}