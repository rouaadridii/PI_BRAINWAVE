import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuizAIService } from 'src/app/services/quiz-ai.service';
import { Quiz } from 'src/app/models/quiz';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Custom validator to ensure at least one of the question counts is 1 or more
function atLeastOneRequired(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const multipleChoiceCount = group.get('multipleChoiceCount')?.value;
    const dragAndDropCount = group.get('dragAndDropCount')?.value;

    if ((multipleChoiceCount === null || multipleChoiceCount < 1) && (dragAndDropCount === null || dragAndDropCount < 1)) {
      return { atLeastOneRequired: true };
    }

    return null;
  };
}

@Component({
  selector: 'quiz-generator',
  templateUrl: './quiz-generator.component.html',
  styleUrls: ['./quiz-generator.component.scss'],
})
export class QuizGeneratorComponent implements OnInit {
  quizGroup: FormGroup = this.fb.group({
    titleQuiz: ['', Validators.required],
    theme: ['science'],
    multipleChoiceCount: ['', [Validators.min(0), Validators.max(10), Validators.pattern('^[0-9]*$')]], // Added pattern
    dragAndDropCount: ['', [Validators.min(0), Validators.max(10), Validators.pattern('^[0-9]*$')]], // Added pattern
  }, { validators: atLeastOneRequired() }); // Add the custom validator
  theme: string = 'science';
  multipleChoiceCount: number = 1;
  dragAndDropCount: number = 1;
  themes: string[] = ['science', 'mathématiques', 'informatique', 'français'];
  generationMessage: string = '';
  errorMessage: string = '';
  generatedQuiz: Quiz | null = null;

  constructor(
    private quizAIService: QuizAIService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {}

  limitInput(event: any, controlName: string, maxValue: number) {
    const inputElement = event.target as HTMLInputElement;
    let value = parseInt(inputElement.value, 10);
    if (isNaN(value) || value > maxValue || value < 0) {
      const currentValue = this.quizGroup.get(controlName)?.value;
      // Revert to the last valid value if the new input is invalid
      this.quizGroup.get(controlName)?.setValue(currentValue !== null ? currentValue.toString() : '');
    }
  }

  generateQuiz() {
    if (this.quizGroup.valid) {
      this.generationMessage = '';
      this.errorMessage = '';
      this.generatedQuiz = null;

      const generationData = {
        quizTitle: this.quizGroup.get('titleQuiz')?.value,
        theme: this.quizGroup.get('theme')?.value,
        multipleChoiceCount: parseInt(this.quizGroup.get('multipleChoiceCount')?.value, 10) || 0,
        dragAndDropCount: parseInt(this.quizGroup.get('dragAndDropCount')?.value, 10) || 0,
      };

      this.quizAIService.generateQuizFromJson(generationData).subscribe({
        next: (response) => {
          this.generationMessage = 'Quiz généré avec succès!';
          this.generatedQuiz = response;
          console.log('Quiz généré:', this.generatedQuiz);
        },
        error: (error) => {
          this.errorMessage =
            'Erreur lors de la génération du quiz: ' +
            (error.error.message || error.error || error);
          console.error('Error generating quiz:', error);
        },
      });
    } else {
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire.';
    }
  }

  goBack(): void {
    this.router.navigate(['/quizzes']);
  }
}