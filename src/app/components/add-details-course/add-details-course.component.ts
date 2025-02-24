import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AttachementService } from 'src/app/services/attachement.service';
import { Course } from '../course';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoursesService } from 'src/app/services/courses.service';

@Component({
  selector: 'app-add-details-course',
  templateUrl: './add-details-course.component.html',
  styleUrls: ['./add-details-course.component.scss']
})
export class AddDetailsCourseComponent implements OnInit{

  courseDetails: any;
  attachmentForm!: FormGroup;
  uploadingAttachment: boolean = false;
  uploadSuccessMessage: string | null = null;
  uploadErrorMessage: string | null = null;
  selectedPdfFile: File | null = null;
  selectedPictureFile: File | null = null;
  selectedVideoFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.loadCourseDetails();
    this.initAttachmentForm();
  }

  loadCourseDetails(): void {
    const idCourse = this.route.snapshot.paramMap.get('id');
    if (idCourse) {
      this.coursesService.getCourseById(Number(idCourse)).subscribe(details => {
        this.courseDetails = details;
      });
    }
  }

  initAttachmentForm(): void {
    this.attachmentForm = this.fb.group({
      chapterTitle: ['', Validators.required], // Titre du chapitre, obligatoire
      pdf: [null], // Fichier PDF
      picture: [null], // Image
      video: [null]  // Vidéo
      // Vous pouvez ajouter des validateurs pour les types de fichiers si nécessaire
    });
  }

  onPdfFileSelected(event: any): void {
    this.selectedPdfFile = event.target.files[0];
  }

  onPictureFileSelected(event: any): void {
    this.selectedPictureFile = event.target.files[0];
  }

  onVideoFileSelected(event: any): void {
    this.selectedVideoFile = event.target.files[0];
  }


  onSubmitAttachment(): void {
    if (this.attachmentForm.valid && this.courseDetails && this.courseDetails.idCourse) {
      this.uploadingAttachment = true;
      this.uploadSuccessMessage = null;
      this.uploadErrorMessage = null;

      const formData = new FormData();
      formData.append('chapterTitle', this.attachmentForm.get('chapterTitle')?.value);

      if (this.selectedPdfFile) {
        formData.append('pdf', this.selectedPdfFile, this.selectedPdfFile.name);
      }
      if (this.selectedPictureFile) {
        formData.append('picture', this.selectedPictureFile, this.selectedPictureFile.name);
      }
      if (this.selectedVideoFile) {
        formData.append('video', this.selectedVideoFile, this.selectedVideoFile.name);
      }

      const courseId = this.courseDetails.idCourse;

      this.coursesService.addAttachmentToCourse(courseId, formData).subscribe({ // Assurez-vous que votre service gère l'ID du cours
        next: (response) => {
          console.log('Pièce jointe ajoutée avec succès', response);
          this.uploadSuccessMessage = 'Pièce jointe ajoutée avec succès!';
          this.uploadErrorMessage = null;
          this.uploadingAttachment = false;
          this.attachmentForm.reset(); // Réinitialiser le formulaire après succès
          this.selectedPdfFile = null;
          this.selectedPictureFile = null;
          this.selectedVideoFile = null;
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de la pièce jointe', error);
          this.uploadErrorMessage = 'Erreur lors de l\'ajout de la pièce jointe. Veuillez réessayer.';
          this.uploadSuccessMessage = null;
          this.uploadingAttachment = false;
        }
      });
    } else {
      console.log('Formulaire d\'attachement invalide ou détails du cours non chargés.');
      alert('Veuillez remplir correctement le formulaire et vous assurer que les détails du cours sont chargés.');
    }
  }}