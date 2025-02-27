import { Component } from '@angular/core';
import { StudentQuizService } from 'src/app/services/student-quiz-service.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-stripe-payment',
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.scss']
})
export class StripePaymentComponent {
  quizId: number | null = null;

  constructor(private stripeService: StudentQuizService, private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.quizId = params['quizId'];
    });
  }

  async payWithStripe() {
    if (this.quizId === null) {
      console.error("quizId est null. Impossible de procéder au paiement.");
      return;
    }

    this.stripeService.createCheckoutSession(10.00, 'usd', this.quizId).subscribe(
      sessionUrl => {
        // Redirection vers Stripe
        window.location.href = sessionUrl;
      },
      error => {
        console.error("Erreur Stripe :", error);
        // Redirection en cas d'erreur
        this.router.navigate(['/payment-failed']);
      }
    );
  }
}