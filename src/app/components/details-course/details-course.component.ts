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
  submitReviewn(): void {
    if (!this.newReview.comment.trim() || this.newReview.rating === 0) {
      Swal.fire('Erreur', 'Veuillez fournir une note et un commentaire.', 'error');
      return;
    }
    if (!this.course || this.course.idCourse === undefined || this.course.idCourse === null) {
        console.error("Impossible d'ajouter un avis : ID du cours non défini.");
        Swal.fire('Erreur', "Impossible d'identifier le cours pour cet avis.", 'error');
        return;
    }

    // Garder une copie des données soumises AVANT l'appel backend
    const submittedRating = this.newReview.rating;
    const submittedComment = this.newReview.comment;

    this.reviewService.addReviewn(this.course.idCourse, submittedRating, submittedComment)
      .subscribe({
        // ATTENTION: On suppose que 'next' signifie succès, même si la réponse est une string
        next: (successMessage) => {
          console.log("Réponse succès (probablement string) du backend:", successMessage);

          // Créer un objet Review temporaire basé sur les données SOUMISES
          // Cet objet n'aura PAS l'idReview correct de la base de données.
          const temporaryReview: Review = {
            // idReview: undefined, // <- ID inconnu !
            rating: submittedRating,
            comment: submittedComment
            // Ajoutez d'autres champs si nécessaire avec des valeurs par défaut
          };
          console.warn("Ajout d'un avis temporaire localement (sans ID réel du backend)");

          // Utiliser une nouvelle référence de tableau
          this.reviews = [...this.reviews, temporaryReview];

          this.calculateAverageRating(); // Recalculer la moyenne

          // Logs de débogage
          console.log('--- Dans submitReviewn (WORKAROUND - après MAJ locale) ---');
          console.log('Nouvelle longueur this.reviews:', this.reviews.length);
          console.log('Contenu this.reviews (ratings):', JSON.stringify(this.reviews.map(r => r.rating )));
          console.log('Valeur this.averageRating:', this.averageRating);
          console.log('------------------------------------------------------');

          // Réinitialiser le formulaire SEULEMENT APRES avoir utilisé ses valeurs
          this.newReview = { rating: 0, comment: '' };
          this.hoveredStar = 0;

          this.cdRef.detectChanges(); // Forcer la MAJ UI

          Swal.fire('Succès', 'Votre avis a été ajouté !', 'success');

          // OPTIONNEL MAIS RECOMMANDÉ: Recharger tous les avis pour obtenir les vrais IDs
          // Décommentez la ligne suivante si la suppression ou modification immédiate est nécessaire
          // this.loadCourseReviews(this.course.idCourse);

        }, // Fin du bloc next (Workaround)

        error: (error) => {
          console.error("Erreur ajout avis :", error);
          Swal.fire('Erreur', "L'ajout de l'avis a échoué.", 'error');
        }
      });
  } // Fin submitReviewn (Workaround)


  deleteReview(reviewId?: number): void {
      if (!reviewId) {
        // Si l'ID est manquant (peut arriver pour l'avis temporaire ajouté localement)
        console.warn("Tentative de suppression d'un avis sans ID. L'avis a peut-être été ajouté localement sans rechargement.");
        Swal.fire('Info', "Impossible de supprimer cet avis car son ID n'est pas connu. Veuillez rafraîchir la page.", 'info');
        return;
      }
    Swal.fire({ /* ... confirmation ... */ }).then((result) => {
        if (result.isConfirmed) {
            this.reviewService.deleteReview(reviewId).subscribe({
                next: () => {
                    const updatedReviews = this.reviews.filter(review => review.idReview !== reviewId);
                    this.reviews = updatedReviews; // Nouvelle référence
                    this.calculateAverageRating(); // Recalculer

                    console.log('--- Dans deleteReview (après MAJ locale) ---');
                    console.log('Nouvelle longueur this.reviews:', this.reviews.length);
                    console.log('Valeur this.averageRating:', this.averageRating);
                    console.log('---------------------------------------------');

                    this.cdRef.detectChanges(); // MAJ UI
                    Swal.fire( 'Supprimé !', 'L\'avis a été supprimé.', 'success' );
                },
                error: (err) => {
                   console.error("Erreur suppression avis:", err);
                   Swal.fire( 'Erreur !', 'La suppression a échoué.', 'error' );
                }
            });
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