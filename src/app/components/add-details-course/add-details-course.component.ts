import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Attachment } from 'src/app/Core/Model/Attachment';
import { Course } from 'src/app/Core/Model/Course';
import { Review } from 'src/app/Core/Model/Review';
import { AttachmentService } from 'src/app/Core/services/attachement.service';
import { CoursesService } from 'src/app/Core/services/courses.service';
import { ReviewService } from 'src/app/Core/services/review.service';

@Component({
  selector: 'app-add-details-course',
  templateUrl: './add-details-course.component.html',
  styleUrls: ['./add-details-course.component.scss']
})
export class AddDetailsCourseComponent implements OnInit {
  idCourse!: number;
  attachments: Attachment[] = [];
  chapterTitle = '';
  selectedFile!: File | null;
  reviews: Review[] = [];
  averageRating: number = 0;
  newReview: Review = { rating: 1, comment: '' }; // Initialisation
  course!: Course; // Stocke les détails du cours
  isEditing: boolean = false; // Pour afficher ou masquer le formulaire de modification
  editingAttachment: Attachment | null = null; // L'attachment en cours de modification
  selectedEditFile: File | null = null; // Le fichier sélectionné pour la modification
  isEditingCourse: boolean = false;
  editingCourse: Course | null = null;
  selectedEditImage: File | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private attachmentService: AttachmentService,
    private courseService: CoursesService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.idCourse = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourseDetails();
    this.loadAttachments(this.idCourse); // Charger les attachments
    this.loadReviews(); // Charger les reviews
  }

  // 📌 Charger les attachments d’un cours
  loadAttachments(courseId: number): void {
    this.attachmentService.getAttachmentsByCourse(courseId).subscribe({
      next: (data) => {
        this.attachments = data;
      },
      error: (err) => {
        console.error("Erreur lors du chargement des attachments :", err);
      }
    });
  }



  
  // 📌 Sélectionner un fichier
  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  // 📌 Ajouter un attachment
  addAttachment(): void {
    if (!this.selectedFile) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    this.attachmentService.addAttachment(this.idCourse, this.selectedFile, this.chapterTitle)
      .subscribe({
        next: () => {
          alert('Détail ajouté avec succès !');
          this.loadAttachments(this.idCourse); // Recharger la liste
        },
        error: (err) => {
          console.error("Erreur lors de l'ajout :", err);
        }
      });
  }

  // 📌 Supprimer un attachment
  deleteAttachment(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet attachment ?')) {
      this.attachmentService.deleteAttachment(id).subscribe({
        next: () => {
          alert('Attachment supprimé avec succès !');
          this.loadAttachments(this.idCourse); // Recharger la liste
        },
        error: (err) => {
          console.error("Erreur lors de la suppression :", err);
        }
      });
    }
  }

  // 📌 Modifier la visibilité d’un attachment
  toggleVisibility(attachment: Attachment): void {
    this.attachmentService.updateVisibility(attachment.idAttachment, !attachment.visible)
      .subscribe({
        next: () => {
          attachment.visible = !attachment.visible;
        },
        error: (err) => {
          console.error("Erreur lors de la mise à jour de la visibilité :", err);
        }
      });
  }

  // 📌 Ouvrir le formulaire de modification
  openEditForm(attachment: Attachment): void {
    this.isEditing = true;
    this.editingAttachment = { ...attachment }; // Copie de l'attachment pour éviter la modification directe
  }

  // 📌 Gérer la sélection du fichier pour la modification
  onEditFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedEditFile = event.target.files[0];
    }
  }

  // 📌 Enregistrer les modifications
  updateAttachment(): void {
    if (!this.editingAttachment) return;

    this.attachmentService.updateAttachment(
      this.editingAttachment.idAttachment,
      this.selectedEditFile,
      this.editingAttachment.chapterTitle,
      this.editingAttachment.visible
    ).subscribe({
      next: () => {
        alert('Attachment mis à jour avec succès !');
        this.isEditing = false; // Masquer le formulaire
        this.loadAttachments(this.idCourse); // Recharger la liste des attachments
      },
      error: (err) => {
        console.error("Erreur lors de la mise à jour :", err);
      }
    });
  }

  // 📌 Annuler la modification
  cancelEdit(): void {
    this.isEditing = false;
    this.editingAttachment = null;
    this.selectedEditFile = null;
  }

  // 📌 Charger les détails du cours
  loadCourseDetails(): void {
    this.courseService.getCourseById(this.idCourse).subscribe({
      next: (data) => {
        this.course = data;
      },
      error: (err) => {
        console.error("Erreur lors du chargement du cours :", err);
      }
    });
  }

  // 📌 Charger les reviews
  loadReviews(): void {
    this.reviewService.getReviewsByCourse(this.idCourse).subscribe({
      next: (data) => {
        this.reviews = data;
      },
      error: (err) => {
        console.error("Erreur lors du chargement des reviews :", err);
      }
    });
  }
}