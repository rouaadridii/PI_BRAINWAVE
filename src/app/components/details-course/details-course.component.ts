import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

// Adaptez ces chemins si nécessaire selon votre structure de projet
import { Attachment } from 'src/app/Core/Model/Attachment';
import { Course } from 'src/app/Core/Model/Course';
import { Review } from 'src/app/Core/Model/Review';
import { AttachmentService } from 'src/app/Core/services/attachement.service';
import { CoursesService } from 'src/app/Core/services/courses.service';
import { ReviewService } from 'src/app/Core/services/review.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-details-course',
  templateUrl: './details-course.component.html',
  styleUrls: ['./details-course.component.scss']
})
export class DetailsCourseComponent implements OnInit, OnDestroy {
  // --- Propriétés du Composant ---
  course!: Course;
  attachments: Attachment[] = [];
  reviews: Review[] = [];
  courseScore: number = 0;
  totalTimeSpentOnCourse: number = 0;

  // État de l'UI
  allAttachmentsValidated: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  viewedAttachmentId: number | null = null;

  // Pour le formulaire d'avis
  newReview: Review = { rating: 0, comment: '' };
  hoveredStar: number = 0;

  // Pour le calcul de la note moyenne
  averageRating: number = 0;

  // --- Suivi du temps ---
  private attachmentStartTime: number | null = null;
  private timerUpdateInterval: any = null;
  private lastSavedTimeSnapshot: number | null = null;
  private attachmentViewTimes = new Map<number, number>();
  private readonly VALIDATION_TIME_THRESHOLD_MS = 2 * 60 * 1000;
  private liveCheckInterval: any = null;

  // --- Mémoire pour les IDs ayant atteint le seuil ---
  private thresholdMetIds = new Set<number>();

  // --- Injection des Services ---
  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private courseService: CoursesService,
    private attachmentService: AttachmentService,
    private reviewService: ReviewService,
    private cdRef: ChangeDetectorRef
  ) { }

  // --- Cycle de vie: Initialisation ---
  ngOnInit(): void {
    const courseIdParam = this.route.snapshot.paramMap.get('id');
    if (courseIdParam) {
        const courseId = Number(courseIdParam);
        if (!isNaN(courseId)) {
            this.loadCourseDetails(courseId);
            this.loadAttachments(courseId);
            this.loadCourseReviews(courseId);
            this.loadCourseScore(courseId);
            this.loadTotalTimeSpent(courseId);
        } else {
            console.error("ID du cours invalide dans l'URL:", courseIdParam);
        }
    } else {
        console.error("ID du cours manquant dans l'URL");
    }
  }

  // --- Cycle de vie: Destruction ---
  ngOnDestroy(): void {
    this.stopTimerAndSaveTime();
    if (this.timerUpdateInterval) { clearInterval(this.timerUpdateInterval); }
    if (this.liveCheckInterval) { clearInterval(this.liveCheckInterval); }
  }

  // --- Chargement des Données ---
  loadCourseDetails(id: number): void {
    this.courseService.getCourseById(id).subscribe({
        next: course => { this.course = course; },
        error: err => console.error("Erreur chargement détails cours:", err)
    });
  }

  loadAttachments(id: number): void {
    this.attachmentService.getAttachmentsByCourse(id).subscribe({
        next: attachments => {
            this.attachments = attachments; // Initialisation
            this.attachmentViewTimes.clear();
            this.thresholdMetIds.clear();

            attachments.forEach(att => {
                const initialTime = att.timeSpentOnCourse || 0;
                this.attachmentViewTimes.set(att.idAttachment, initialTime);
                if (initialTime >= this.VALIDATION_TIME_THRESHOLD_MS) {
                    this.thresholdMetIds.add(att.idAttachment);
                   // console.log(`Seuil initialement atteint pour ID: ${att.idAttachment} (Temps: ${initialTime}ms)`);
                }
            });

            this.checkAllAttachmentsValidated();
           // console.log("Pièces jointes chargées:", this.attachments);
           // console.log("Temps initiaux (Map):", this.attachmentViewTimes);
           // console.log("IDs ayant atteint le seuil initialement (Set):", this.thresholdMetIds);
        },
        error: err => console.error("Erreur chargement pièces jointes:", err)
    });
  }

  loadCourseReviews(id: number): void {
     this.reviewService.getReviewsByCourse(id).subscribe({
        next: reviews => {
            this.reviews = reviews; // Initialisation
            this.calculateAverageRating();
        },
        error: err => console.error("Erreur chargement avis:", err)
    });
  }

  loadCourseScore(courseId: number): void {
     this.attachmentService.getCourseScore(courseId).subscribe({
        next: score => { this.courseScore = score; },
        error: err => { console.error("Erreur chargement score:", err); this.courseScore = 0; }
    });
  }

  loadTotalTimeSpent(courseId: number): void {
     this.attachmentService.getTimeSpentOnCourse(courseId).subscribe({
        next: time => { this.totalTimeSpentOnCourse = time; },
        error: err => { console.error("Erreur chargement temps total:", err); this.totalTimeSpentOnCourse = 0; }
    });
   }

  // --- Logique de Validation des Pièces Jointes ---
  validateAttachment(attachmentId: number): void {
     const attachment = this.attachments.find(a => a.idAttachment === attachmentId);
     if (attachment && this.isValidationDisabled(attachment)) {
         console.warn("Tentative de validation prématurée bloquée.");
         Swal.fire('Info', 'Vous devez consulter le fichier pendant au moins 2 minutes pour le valider.', 'info');
         return;
     }

    this.attachmentService.validateAttachment(attachmentId).subscribe({
      next: (response) => {
        console.log("Validation réussie:", response);
        const index = this.attachments.findIndex(a => a.idAttachment === attachmentId);
        if (index > -1) {
            const updatedAttachments = [...this.attachments];
            updatedAttachments[index] = { ...updatedAttachments[index], validated: true };
            this.attachments = updatedAttachments;
            this.thresholdMetIds.add(attachmentId);
        }
        this.loadCourseScore(this.course.idCourse);
        this.checkAllAttachmentsValidated();
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error("Erreur validation attachment:", err);
        Swal.fire('Erreur', 'La validation a échoué.', 'error');
      }
    });
  }

  invalidateAttachment(attachmentId: number): void {
    this.attachmentService.invalidateAttachment(attachmentId).subscribe({
        next: (response) => {
            console.log("Invalidation réussie:", response);
            const index = this.attachments.findIndex(a => a.idAttachment === attachmentId);
            if (index > -1) {
                const updatedAttachments = [...this.attachments];
                updatedAttachments[index] = { ...updatedAttachments[index], validated: false };
                this.attachments = updatedAttachments;
            }
            this.loadCourseScore(this.course.idCourse);
            this.checkAllAttachmentsValidated();
            this.cdRef.detectChanges();
        },
        error: (err) => {
            console.error("Erreur invalidation attachment:", err);
            Swal.fire('Erreur', "L'invalidation a échoué.", 'error');
        }
    });
  }

  checkAllAttachmentsValidated(): void {
      this.allAttachmentsValidated = this.attachments && this.attachments.length > 0 && this.attachments.every(a => a.validated);
  }

  isValidationDisabled(attachment: Attachment): boolean {
    if (attachment.validated) { return false; }
    if (this.thresholdMetIds.has(attachment.idAttachment)) { return false; }

    const storedTime = this.attachmentViewTimes.get(attachment.idAttachment) || 0;
    let currentSessionTime = 0;
    if (this.viewedAttachmentId === attachment.idAttachment && this.attachmentStartTime) {
      currentSessionTime = (Date.now() - this.attachmentStartTime);
    }
    const totalCumulativeCheck = storedTime + currentSessionTime;
    const thresholdMetNow = totalCumulativeCheck >= this.VALIDATION_TIME_THRESHOLD_MS;

    if (thresholdMetNow) {
      this.thresholdMetIds.add(attachment.idAttachment);
      // console.log(`Seuil ATTEINT live pour ID: ${attachment.idAttachment} (Total: ${totalCumulativeCheck}ms). Ajout au Set -> Activation.`);
      return false;
    } else {
      // console.log(`isValidationDisabled Check (ID: ${attachment.idAttachment}): Stored=${storedTime}ms, Current=${currentSessionTime}ms, Total=${totalCumulativeCheck}ms --> Désactivé`);
      return true;
    }
  }

  // --- Gestion Affichage PDF & Temps Passé ---
  viewPDF(attachment: Attachment): void {
    this.stopTimerAndSaveTime();
    if (this.liveCheckInterval) { clearInterval(this.liveCheckInterval); this.liveCheckInterval = null;}

    const filename = attachment.source?.split('\\').pop()?.split('/').pop();
    const unsafeUrl = `http://localhost:8087/cours/attachments/attachments/${filename}`;

    if (filename) {
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
      this.viewedAttachmentId = attachment.idAttachment;
      this.attachmentStartTime = Date.now();
      this.lastSavedTimeSnapshot = this.attachmentStartTime;
     // console.log(`Ouverture PDF: ${this.viewedAttachmentId} à ${new Date(this.attachmentStartTime)}`);

      this.startPeriodicSave();
      this.startLiveCheck();

    } else {
       console.error("Nom de fichier invalide ou source manquante pour l'attachment:", attachment);
       Swal.fire('Erreur', 'Impossible de charger le fichier PDF (nom ou source invalide).', 'error');
    }
  }

  closePDF(): void {
     this.stopTimerAndSaveTime();
     this.pdfUrl = null;
     if (this.liveCheckInterval) { clearInterval(this.liveCheckInterval); this.liveCheckInterval = null;}
    // console.log("Fermeture PDF");
     this.cdRef.detectChanges();
  }

  private stopTimerAndSaveTime(): void {
     if (this.viewedAttachmentId !== null && this.lastSavedTimeSnapshot !== null) {
        const endTime = Date.now();
        const currentId = this.viewedAttachmentId;
        const finalTimeIncrementMs = endTime - this.lastSavedTimeSnapshot;

       // console.log(`Fin session PDF: ID ${currentId}. Incrément final: ${finalTimeIncrementMs} ms`);

        const previousTotalTime = this.attachmentViewTimes.get(currentId) || 0;
        const newTotalCumulativeTime = previousTotalTime + finalTimeIncrementMs;
        this.attachmentViewTimes.set(currentId, newTotalCumulativeTime);
       // console.log(`Map locale MAJ pour ${currentId}: ${newTotalCumulativeTime} ms (cumulé) [Map]:`, this.attachmentViewTimes);

        if (!this.thresholdMetIds.has(currentId) && newTotalCumulativeTime >= this.VALIDATION_TIME_THRESHOLD_MS) {
            this.thresholdMetIds.add(currentId);
            console.log(`Seuil atteint à la fermeture pour ID: ${currentId}. Ajout au Set.`);
        }

        if (finalTimeIncrementMs > 100) {
           // console.log(`Sauvegarde backend finale pour ${currentId}: ${finalTimeIncrementMs} ms (incrément final)`);
            this.attachmentService.updateTimeSpent(currentId, finalTimeIncrementMs).subscribe({
                next: (response) => {}, // console.log("Incrément temps final sauvegardé (backend):", response),
                error: (err) => console.error("Erreur sauvegarde incrément temps final (backend):", err),
                complete: () => { if(this.course) this.loadTotalTimeSpent(this.course.idCourse); }
            });
        }

        this.attachmentStartTime = null;
        this.viewedAttachmentId = null;
        this.lastSavedTimeSnapshot = null;
    }

    if (this.timerUpdateInterval) {
        clearInterval(this.timerUpdateInterval);
        this.timerUpdateInterval = null;
        //console.log("Arrêt sauvegarde périodique.");
    }
  }

  private startPeriodicSave(): void {
      if (this.timerUpdateInterval) { clearInterval(this.timerUpdateInterval); }
      const intervalMs = 30000;
     // console.log("Démarrage sauvegarde périodique (incrémentale)...");

      this.timerUpdateInterval = setInterval(() => {
          if (this.viewedAttachmentId !== null && this.lastSavedTimeSnapshot !== null) {
              const currentTime = Date.now();
              const timeIncrementMs = currentTime - this.lastSavedTimeSnapshot;
              const currentId = this.viewedAttachmentId;

              if (timeIncrementMs > 100) {
                 // console.log(`Sauvegarde périodique ${currentId}: Envoi incrément ${timeIncrementMs} ms`);
                  this.attachmentService.updateTimeSpent(currentId, timeIncrementMs).subscribe({
                      next: () => {
                          //console.log("Sauvegarde incrément périodique OK.");
                          this.lastSavedTimeSnapshot = currentTime;
                      },
                      error: (err) => console.error("Erreur sauvegarde incrément périodique:", err)
                  });
              }
          } else {
               if(this.timerUpdateInterval) {
                  clearInterval(this.timerUpdateInterval);
                  this.timerUpdateInterval = null;
                  //console.log("Arrêt sauvegarde périodique (état invalide).")
               }
          }
      }, intervalMs);
  }

  private startLiveCheck(): void {
    if (this.liveCheckInterval) { clearInterval(this.liveCheckInterval); }

    const checkIntervalMs = 1000;
    this.liveCheckInterval = setInterval(() => {
      if (!this.viewedAttachmentId && this.liveCheckInterval) {
          clearInterval(this.liveCheckInterval);
          this.liveCheckInterval = null;
      } else if (this.viewedAttachmentId) {
          this.cdRef.detectChanges();
      }
    }, checkIntervalMs);
  }

  // --- Gestion des Avis ---
  calculateAverageRating(): void {
      if (this.reviews && this.reviews.length > 0) {
      const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
      if (isNaN(totalRating)) {
        console.error("Erreur dans calculateAverageRating: totalRating est NaN. Vérifiez les données d'avis.", this.reviews);
        this.averageRating = 0;
      } else {
        this.averageRating = totalRating / this.reviews.length;
      }
    } else {
      this.averageRating = 0;
    }
  }

  // ****************************************************************
  // *** MODIFICATION DE LA LOGIQUE submitReviewn (WORKAROUND) ***
  // ****************************************************************

  
  submitReview(): void { // Renommée pour la clarté (ou gardez submitReviewn si appelée ainsi dans le HTML)
    if (!this.newReview.comment.trim() || this.newReview.rating === 0) {
      Swal.fire('Erreur', 'Veuillez fournir une note et un commentaire.', 'error');
      return;
    }
    if (!this.course || this.course.idCourse === undefined) {
        console.error("ID du cours indéfini lors de la soumission de l'avis.");
        Swal.fire('Erreur', "Impossible d'identifier le cours.", 'error');
        return;
    }

    const courseId = this.course.idCourse; // Utiliser l'ID du cours chargé
    const rating = this.newReview.rating;
    const comment = this.newReview.comment;

    // Appel à la méthode principale addReview du service
    this.reviewService.addReview(courseId, rating, comment)
      .subscribe({
        next: (savedReview) => {
          // Succès ! L'avis a été ajouté et a passé la modération backend.
          console.log('Avis ajouté avec succès (backend):', savedReview);
          Swal.fire('Succès', 'Votre avis a été ajouté !', 'success');

          // *** MEILLEURE APPROCHE : Recharger la liste des avis depuis le backend ***
          // pour obtenir les données à jour (y compris le nouvel idReview et les futurs champs IA)
          this.loadCourseReviews(courseId); 

          // Réinitialiser le formulaire
          this.newReview = { rating: 0, comment: '' };
          this.hoveredStar = 0;
          
          // Optionnel : forcer la détection de changement si Angular ne met pas à jour immédiatement
          this.cdRef.detectChanges(); 
        },
        error: (errorResponse: HttpErrorResponse) => {
          // Gestion des erreurs
          console.error('Erreur lors de l\'ajout de l\'avis:', errorResponse);
          let displayMessage = "Une erreur est survenue lors de l'ajout de votre avis. Veuillez réessayer."; // Message par défaut

          if (errorResponse.status === 400 && typeof errorResponse.error === 'string' && errorResponse.error.includes('inapproprié')) {
            // *** Gestion spécifique de l'erreur de MODÉRATION (HTTP 400) ***
            // errorResponse.error contient le message textuel envoyé par le backend
            displayMessage = errorResponse.error; 
          } else if (errorResponse.error && typeof errorResponse.error === 'string') {
             // Afficher une autre erreur texte du backend si disponible
             displayMessage = errorResponse.error;
          }
          // Afficher l'erreur à l'utilisateur via Swal
          Swal.fire('Erreur', displayMessage, 'error');
        }
      });
  } 


  deleteReview(reviewId?: number): void {
    // 1. Vérifier si l'ID est fourni
    if (!reviewId) {
      console.warn("Tentative de suppression d'un avis sans ID.");
      Swal.fire(
        'Information',
        "Impossible de supprimer cet avis car son ID n'est pas connu. Veuillez rafraîchir la page.",
        'info'
      );
      return;
    }

    // 2. Afficher la boîte de dialogue de confirmation SweetAlert
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // Rouge pour la suppression
      cancelButtonColor: '#3085d6', // Bleu pour annuler
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      // 3. Traiter le résultat
      if (result.isConfirmed) {
        // 4. Si confirmé, appeler le service de suppression
        this.reviewService.deleteReview(reviewId).subscribe({
          next: () => {
            // 5. Succès: Mettre à jour la liste locale
            const updatedReviews = this.reviews.filter(review => review.idReview !== reviewId);
            this.reviews = updatedReviews; // Remplacer par le nouveau tableau

            // Recalculer la note moyenne
            this.calculateAverageRating();

            // Logs de débogage
            console.log('--- Dans deleteReview (après MAJ locale) ---');
            console.log('Avis supprimé avec succès (ID:', reviewId, ')');
            console.log('Nouvelle longueur this.reviews:', this.reviews.length);
            console.log('Nouvelle Valeur this.averageRating:', this.averageRating);
            console.log('---------------------------------------------');

            // Forcer la détection des changements pour mettre à jour l'UI
            this.cdRef.detectChanges();

            // Afficher message de succès
            Swal.fire(
              'Supprimé !',
              'L\'avis a été supprimé.',
              'success'
            );
            
            // Optionnel: Mettre à jour les graphiques si la suppression a un impact
            // this.createSentimentChart(); // Par exemple, si les stats de sentiments doivent changer
          },
          error: (err) => {
            // 6. Erreur lors de la suppression
            console.error("Erreur suppression avis:", err);
            Swal.fire(
              'Erreur !',
              'La suppression de l\'avis a échoué. Veuillez réessayer.',
              'error'
            );
          }
        });
      } else {
        // 7. Si annulé
        console.log('Suppression annulée pour l\'avis ID:', reviewId);
      }
    });
  }

  // --- Gestion UI Formulaire Avis ---
  hoverStar(star: number): void {
     this.hoveredStar = star;
  }

  setRating(rating: number): void {
     this.newReview.rating = rating;
    this.hoveredStar = rating;
  }


  

} // Fin classe DetailsCourseComponent