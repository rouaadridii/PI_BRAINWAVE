import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core'; // Ajout ChangeDetectorRef
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

// Adaptez ces chemins si nécessaire selon votre structure de projet
import { Attachment } from 'src/app/Core/Model/Attachment'; // Assurez-vous que ce modèle a bien timeSpentOnCourse?
import { Course } from 'src/app/Core/Model/Course';
import { Review } from 'src/app/Core/Model/Review';
import { AttachmentService } from 'src/app/Core/services/attachement.service';
import { CoursesService } from 'src/app/Core/services/courses.service';
import { ReviewService } from 'src/app/Core/services/review.service';
// import { FormatDurationPipe } from 'src/app/pipes/format-duration.pipe'; // Import non nécessaire ici si seulement utilisé dans le template

@Component({
  selector: 'app-details-course',
  templateUrl: './details-course.component.html',
  styleUrls: ['./details-course.component.scss']
})
export class DetailsCourseComponent implements OnInit, OnDestroy {
  // --- Propriétés du Composant ---
  course!: Course; // Détails du cours
  attachments: Attachment[] = []; // Liste des pièces jointes
  reviews: Review[] = []; // Liste des avis
  courseScore: number = 0; // Score basé sur les validations
  totalTimeSpentOnCourse: number = 0; // Temps total passé (ms) - Pour affichage global

  // État de l'UI
  allAttachmentsValidated: boolean = false; // Pour le message de félicitations
  pdfUrl: SafeResourceUrl | null = null; // URL sécurisée pour l'iframe PDF
  viewedAttachmentId: number | null = null; // ID de la PJ en cours de visualisation

  // Pour le formulaire d'avis
  newReview: Review = { rating: 0, comment: '' }; // Initialiser rating à 0
  hoveredStar: number = 0; // Pour l'effet hover sur les étoiles

  // Pour le calcul de la note moyenne
  averageRating: number = 0;

  // --- Suivi du temps ---
  private attachmentStartTime: number | null = null; // Timestamp début session visualisation actuelle
  private timerUpdateInterval: any = null; // ID de l'intervalle pour sauvegarde périodique (selon votre logique originale)
  // --- Suivi du temps cumulé par attachment pour validation ---
  private attachmentViewTimes = new Map<number, number>(); // Map: attachmentId -> total time spent in ms (cumulé localement)
  private readonly VALIDATION_TIME_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes en ms
  private liveCheckInterval: any = null; // Intervalle pour vérifier l'état du bouton en direct

  // --- Injection des Services ---
  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private courseService: CoursesService,
    private attachmentService: AttachmentService,
    private reviewService: ReviewService,
    private cdRef: ChangeDetectorRef // Injecter ChangeDetectorRef pour la mise à jour live
  ) { }

  // --- Cycle de vie: Initialisation ---
  ngOnInit(): void {
    const courseIdParam = this.route.snapshot.paramMap.get('id');
    if (courseIdParam) {
        const courseId = Number(courseIdParam);
        if (!isNaN(courseId)) {
            // Charger toutes les données initiales pour ce cours
            this.loadCourseDetails(courseId);
            this.loadAttachments(courseId); // Initialise aussi attachmentViewTimes
            this.loadCourseReviews(courseId);
            this.loadCourseScore(courseId);
            this.loadTotalTimeSpent(courseId); // Garde le temps total affiché
        } else {
            console.error("ID du cours invalide dans l'URL:", courseIdParam);
        }
    } else {
        console.error("ID du cours manquant dans l'URL");
    }
  }

  // --- Cycle de vie: Destruction ---
  ngOnDestroy(): void {
    // S'assurer que le temps est sauvegardé si un PDF était ouvert
    this.stopTimerAndSaveTime(); // Sauvegarde le temps final et met à jour la map locale
    // Nettoyer l'intervalle de sauvegarde périodique s'il est actif
    if (this.timerUpdateInterval) {
        clearInterval(this.timerUpdateInterval);
        this.timerUpdateInterval = null;
    }
    // Nettoyer l'intervalle de vérification live
    if (this.liveCheckInterval) {
        clearInterval(this.liveCheckInterval);
        this.liveCheckInterval = null;
    }
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
            this.attachments = attachments;
            // Initialiser la map des temps avec les valeurs du backend
            this.attachmentViewTimes.clear(); // Vider l'ancienne map si rechargement
            attachments.forEach(att => {
                // Utilise timeSpentOnCourse venant du backend (doit exister dans le modèle Attachment), ou 0 par défaut
                this.attachmentViewTimes.set(att.idAttachment, att.timeSpentOnCourse || 0);
            });
            this.checkAllAttachmentsValidated();
            console.log("Pièces jointes chargées:", this.attachments);
            console.log("Temps de consultation initiaux (ms):", this.attachmentViewTimes); // Debug
        },
        error: err => console.error("Erreur chargement pièces jointes:", err)
    });
  }

  loadCourseReviews(id: number): void {
    this.reviewService.getReviewsByCourse(id).subscribe({
        next: reviews => {
            this.reviews = reviews;
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

  loadTotalTimeSpent(courseId: number): void { // Pour affichage global
    this.attachmentService.getTimeSpentOnCourse(courseId).subscribe({
        next: time => { this.totalTimeSpentOnCourse = time; },
        error: err => { console.error("Erreur chargement temps total:", err); this.totalTimeSpentOnCourse = 0; }
    });
   }

  // --- Logique de Validation des Pièces Jointes ---
  validateAttachment(attachmentId: number): void {
     const attachment = this.attachments.find(a => a.idAttachment === attachmentId);
     // Vérifier si le bouton aurait dû être désactivé
     if (attachment && this.isValidationDisabled(attachment)) {
         console.warn("Tentative de validation prématurée bloquée.");
         Swal.fire('Info', 'Vous devez consulter le fichier pendant au moins 2 minutes pour le valider.', 'info');
         return;
     }

    this.attachmentService.validateAttachment(attachmentId).subscribe({
      next: (response) => {
        console.log("Validation réussie:", response);
        if (attachment) {
          attachment.validated = true; // Mettre à jour l'état local
        }
        this.loadCourseScore(this.course.idCourse); // Mettre à jour le score affiché
        this.checkAllAttachmentsValidated(); // Vérifier si le cours est complété
        this.cdRef.detectChanges(); // Forcer la MAJ de l'UI (état bouton)
      },
      error: (err) => {
        console.error("Erreur validation attachment:", err);
        Swal.fire('Erreur', 'La validation a échoué.', 'error');
      }
    });
  }

  invalidateAttachment(attachmentId: number): void {
    // Confirmation optionnelle mais recommandée (décommenter si besoin)
    /*
    Swal.fire({...}).then((result) => {
        if (result.isConfirmed) {
    */
            this.attachmentService.invalidateAttachment(attachmentId).subscribe({
                next: (response) => {
                    console.log("Invalidation réussie:", response);
                    const attachment = this.attachments.find(a => a.idAttachment === attachmentId);
                    if (attachment) {
                        attachment.validated = false; // Mettre à jour l'état local
                    }
                    this.loadCourseScore(this.course.idCourse); // Mettre à jour le score affiché
                    this.checkAllAttachmentsValidated(); // Vérifier si le cours est complété
                    this.cdRef.detectChanges(); // Forcer la MAJ de l'UI (état bouton)
                },
                error: (err) => {
                    console.error("Erreur invalidation attachment:", err);
                    Swal.fire('Erreur', "L'invalidation a échoué.", 'error');
                }
            });
    /*
        }
    });
    */
  }

  checkAllAttachmentsValidated(): void { // Vérifie si message "Félicitations" doit s'afficher
    this.allAttachmentsValidated = this.attachments && this.attachments.length > 0 && this.attachments.every(a => a.validated);
  }

  /**
   * Vérifie si le bouton de validation pour un attachment donné doit être désactivé.
   * Basé sur le temps cumulé (local) et le temps de la session en cours.
   */
  isValidationDisabled(attachment: Attachment): boolean {
    // Si déjà validé, le bouton (pour invalider) est toujours activé.
    if (attachment.validated) {
      return false;
    }

    // Temps total déjà enregistré dans la map (sessions précédentes)
    let cumulativeTimeMs = this.attachmentViewTimes.get(attachment.idAttachment) || 0;

    // Si on est EN TRAIN de visualiser CET attachment,
    // ajouter le temps écoulé depuis le début de CETTE session pour le calcul
    if (this.viewedAttachmentId === attachment.idAttachment && this.attachmentStartTime) {
      cumulativeTimeMs += (Date.now() - this.attachmentStartTime);
    }

    // Le bouton est désactivé si le temps total (passé + session actuelle) est inférieur au seuil
    return cumulativeTimeMs < this.VALIDATION_TIME_THRESHOLD_MS;
  }


  // --- Gestion Affichage PDF & Temps Passé ---
  viewPDF(attachment: Attachment): void {
    // Sauvegarder le temps de la session précédente si une autre était ouverte
    this.stopTimerAndSaveTime();
     // Arrêter l'intervalle de vérification live précédent
    if (this.liveCheckInterval) { clearInterval(this.liveCheckInterval); this.liveCheckInterval = null;}

    const filename = attachment.source?.split('\\').pop()?.split('/').pop();
    // *** IMPORTANT : Vérifiez cet URL pour visualiser vs télécharger ***
    // Cet URL pointe vers l'endpoint qui retourne le fichier pour l'iframe.
    const unsafeUrl = `http://localhost:8087/cours/attachments/attachments/${filename}`;

    if (filename) {
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
      this.viewedAttachmentId = attachment.idAttachment; // ID en cours de visualisation
      // Démarrer le chronomètre pour CETTE session de visualisation
      this.attachmentStartTime = Date.now();
      console.log(`Ouverture PDF: ${this.viewedAttachmentId} à ${new Date(this.attachmentStartTime)}`);

      // Démarrer la sauvegarde périodique (votre logique originale)
      this.startPeriodicSave();
      // Démarrer la vérification live pour l'état du bouton
      this.startLiveCheck();

    } else {
      console.error("Nom de fichier invalide ou source manquante pour l'attachment:", attachment);
      Swal.fire('Erreur', 'Impossible de charger le fichier PDF (nom ou source invalide).', 'error');
    }
  }

  closePDF(): void {
    this.stopTimerAndSaveTime(); // Sauvegarde le temps et met à jour la map locale
    this.pdfUrl = null; // Cache l'iframe
    // viewedAttachmentId et attachmentStartTime sont réinitialisés dans stopTimerAndSaveTime
     // Arrêter l'intervalle de vérification live
    if (this.liveCheckInterval) { clearInterval(this.liveCheckInterval); this.liveCheckInterval = null;}
    console.log("Fermeture PDF");
    // L'intervalle de sauvegarde périodique (timerUpdateInterval) est aussi arrêté dans stopTimerAndSaveTime
  }

  /**
   * Arrête le timer de la session actuelle, met à jour la map locale cumulative,
   * et envoie le temps de la session au backend (selon votre logique originale).
   */
  private stopTimerAndSaveTime(): void {
    // Vérifier s'il y avait une session de visualisation active
    if (this.attachmentStartTime && this.viewedAttachmentId !== null) {
      const endTime = Date.now();
      const timeSpentThisSessionMs = endTime - this.attachmentStartTime; // Durée de CETTE session
      const currentId = this.viewedAttachmentId; // Capturer l'ID avant de le réinitialiser

      console.log(`Fin session PDF: ID ${currentId}. Durée session: ${timeSpentThisSessionMs} ms`);

      // 1. Mettre à jour le temps total CUMULÉ dans la map locale
      const previousTotalTime = this.attachmentViewTimes.get(currentId) || 0;
      const newTotalCumulativeTime = previousTotalTime + timeSpentThisSessionMs;
      this.attachmentViewTimes.set(currentId, newTotalCumulativeTime);
      console.log(`Map locale MAJ pour ${currentId}: ${newTotalCumulativeTime} ms (cumulé)`);

      // 2. Envoyer le temps au backend (selon votre logique originale)
      // ** ATTENTION : Ceci envoie le temps écoulé depuis le début de la visualisation actuelle (`timeSpentThisSessionMs`).
      // ** Votre backend (`updateTimeSpent`) doit REMPLACER la valeur stockée par celle-ci pour être cohérent avec startPeriodicSave.
      // ** Si votre backend AJOUTE, il faut envoyer `timeSpentThisSessionMs` mais adapter le backend ou la logique d'envoi ici.
      if (timeSpentThisSessionMs > 1000) { // Votre condition existante pour sauvegarde minimale
         // On envoie le temps de la session, comme le faisait votre code original stopTimer
         const timeToSendToBackend = timeSpentThisSessionMs;
         console.log(`Sauvegarde backend pour ${currentId}: ${timeToSendToBackend} ms (durée session)`);
         this.attachmentService.updateTimeSpent(currentId, timeToSendToBackend).subscribe({
           next: (response) => console.log("Temps session sauvegardé (backend):", response),
           error: (err) => console.error("Erreur sauvegarde temps session (backend):", err),
           // Recharger le temps total affiché pour le cours une fois la sauvegarde terminée
           complete: () => { this.loadTotalTimeSpent(this.course.idCourse); }
         });
      }

       // Réinitialiser l'état de la session de visualisation actuelle
      this.attachmentStartTime = null;
      this.viewedAttachmentId = null; // Réinitialiser après utilisation
    }
     // Arrêter l'intervalle de sauvegarde périodique (comme dans votre code original)
     if (this.timerUpdateInterval) {
         clearInterval(this.timerUpdateInterval);
         this.timerUpdateInterval = null;
         console.log("Arrêt sauvegarde périodique.");
     }
  }

  /**
   * Démarre la sauvegarde périodique vers le backend (logique originale).
   * ATTENTION: Envoie le temps total écoulé depuis l'ouverture du PDF.
   * Nécessite que le backend REMPLACE la valeur temps.
   */
  private startPeriodicSave(): void {
    // Nettoyer un éventuel intervalle précédent
    if (this.timerUpdateInterval) { clearInterval(this.timerUpdateInterval); }

    const intervalMs = 30000; // Sauvegarder toutes les 30 secondes
    console.log("Démarrage sauvegarde périodique...");

    this.timerUpdateInterval = setInterval(() => {
        if (this.attachmentStartTime && this.viewedAttachmentId !== null) {
            const currentTime = Date.now();
            // Calcule le temps total depuis l'ouverture de CETTE session de visualisation
            const timeSpentSinceStart = currentTime - this.attachmentStartTime;
            console.log(`Sauvegarde périodique ${this.viewedAttachmentId}: ${timeSpentSinceStart} ms (depuis ouverture session)`);

            // *** IMPORTANT: Le backend doit REMPLACER le temps existant par timeSpentSinceStart ***
            this.attachmentService.updateTimeSpent(this.viewedAttachmentId, timeSpentSinceStart).subscribe({
                next: () => console.log("Sauvegarde périodique OK."),
                error: (err) => console.error("Erreur sauvegarde périodique:", err)
                // Note : Ne met pas à jour la map locale ici pour éviter complexité/conflit avec stopTimer
            });
        } else {
            // Si l'état n'est plus valide (PDF fermé entre temps?), arrêter l'intervalle
            if(this.timerUpdateInterval) {
                clearInterval(this.timerUpdateInterval);
                this.timerUpdateInterval = null;
                console.log("Arrêt sauvegarde périodique (état invalide).")
            }
        }
    }, intervalMs);
  }

  /**
   * Démarre un intervalle pour forcer la détection de changement Angular,
   * permettant à la condition [disabled] du bouton d'être réévaluée en direct.
   */
  private startLiveCheck(): void {
    if (this.liveCheckInterval) { clearInterval(this.liveCheckInterval); } // Nettoyer

    const checkIntervalMs = 1000; // Vérifier toutes les secondes
    this.liveCheckInterval = setInterval(() => {
      if (!this.viewedAttachmentId && this.liveCheckInterval) {
         // Arrêter si le PDF est fermé
         clearInterval(this.liveCheckInterval);
         this.liveCheckInterval = null;
      } else if (this.viewedAttachmentId) {
         // Forcer la détection de changement pour réévaluer isValidationDisabled()
         this.cdRef.detectChanges();
      }
    }, checkIntervalMs);
  }


  // --- Gestion des Avis (inchangée) ---
  calculateAverageRating(): void {
    if (this.reviews && this.reviews.length > 0) {
      const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
      this.averageRating = totalRating / this.reviews.length;
    } else {
      this.averageRating = 0;
    }
  }

  submitReviewn(): void {
    if (!this.newReview.comment.trim() || this.newReview.rating === 0) {
      Swal.fire('Erreur', 'Veuillez fournir une note et un commentaire.', 'error');
      return;
    }
    // Assurez-vous que this.course et this.course.idCourse sont définis
    if (!this.course || this.course.idCourse === undefined || this.course.idCourse === null) {
       console.error("Impossible d'ajouter un avis : ID du cours non défini.");
       Swal.fire('Erreur', "Impossible d'identifier le cours pour cet avis.", 'error');
       return;
    }
    this.reviewService.addReviewn(this.course.idCourse, this.newReview.rating, this.newReview.comment)
      .subscribe({
        next: (addedReview) => {
          this.reviews.push(addedReview); // Ajouter à la liste locale
          this.calculateAverageRating(); // Recalculer la moyenne
          this.newReview = { rating: 0, comment: '' }; // Réinitialiser formulaire
          this.hoveredStar = 0; // Réinitialiser hover
          Swal.fire('Succès', 'Votre avis a été ajouté !', 'success');
        },
        error: (error) => {
          console.error("Erreur ajout avis :", error);
          Swal.fire('Erreur', "L'ajout de l'avis a échoué.", 'error');
        }
      });
  }

  deleteReview(reviewId?: number): void {
    if (!reviewId) return;
    Swal.fire({
        title: 'Supprimer cet avis ?', text: "Cette action est irréversible.", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#dc3545', cancelButtonColor: '#6c757d',
        confirmButtonText: 'Oui, supprimer !', cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            this.reviewService.deleteReview(reviewId).subscribe({
                next: () => {
                    // Filtrer l'avis supprimé de la liste locale
                    this.reviews = this.reviews.filter(review => review.idReview !== reviewId);
                    this.calculateAverageRating(); // Recalculer la moyenne
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

  // --- Gestion UI Formulaire Avis (inchangée) ---
  hoverStar(star: number): void {
    this.hoveredStar = star;
  }

  setRating(rating: number): void {
    this.newReview.rating = rating;
    this.hoveredStar = rating; // Garder les étoiles illuminées après clic
  }

} // Fin classe DetailsCourseComponent