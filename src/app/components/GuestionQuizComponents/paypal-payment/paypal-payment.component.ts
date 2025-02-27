import { Component, AfterViewInit } from '@angular/core';
import { loadScript } from "@paypal/paypal-js";
import { StudentQuizService } from 'src/app/services/student-quiz-service.service';

@Component({
  selector: 'app-paypal-payment',
  templateUrl: './paypal-payment.component.html',
  styleUrls: ['./paypal-payment.component.scss']
})
export class PaypalPaymentComponent implements AfterViewInit {

  constructor(private studentQuizService: StudentQuizService) { }

  ngAfterViewInit(): void {
    this.loadPayPal();
  }

  async loadPayPal() {
    try {
      const paypalModule = await loadScript({
        clientId: "AZ--YOTSOJ0pF-YR7y36xmpo7wDtbUO1LHevySfpUNCV91QXe49Gy30D3p4shqoQmGcfvlEsedpUivWf",
        currency: "USD"
      });

      if (!paypalModule || !paypalModule.Buttons) {
        console.error("Erreur : PayPal SDK non chargé ou Buttons non disponible.");
        return;
      }

      paypalModule.Buttons({
        createOrder: (_data, _actions) => {
          console.log('Création de la commande...');
          return this.studentQuizService.createPayPalPayment(0.01).toPromise()
            .then(orderID => {
              console.log('Order ID reçu:', orderID);
              return orderID || ""; // Retourne une chaîne vide si orderID est undefined
            })
            .catch(error => {
              console.error("Erreur lors de la création de la commande PayPal :", error);
              return ""; // Retourne une chaîne vide en cas d'erreur
            });
        },
        onApprove: (_data, actions) => {
          if (actions.order) { // Vérifie si actions.order est défini
            return actions.order.capture().then(details => {
              alert('Transaction terminée par ' + details?.payer?.name?.given_name);
              // Gérer le succès ici
            }).catch(err => {
              console.error("Erreur lors de la capture du paiement : ", err);
              // Gérer l'échec ici
            });
          } else {
            console.error("actions.order est undefined.");
            return Promise.resolve(); // Retourne une promesse résolue
          }
        },
        onError: err => console.error("Erreur PayPal : ", err)
      }).render('#paypal-button-container');
    } catch (error) {
      console.error("Erreur lors du chargement du script PayPal :", error);
    }
  }
}