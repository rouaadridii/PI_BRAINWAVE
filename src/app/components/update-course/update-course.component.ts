import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursesService } from 'src/app/services/courses.service';
import { Course } from '../course';
import { finalize, Subscription } from 'rxjs';

@Component({
  selector: 'app-update-course',
  templateUrl: './update-course.component.html',
  styleUrls: ['./update-course.component.scss']
})
export class UpdateCourseComponent implements OnInit, OnDestroy {

  selectedCourse: any = null

  coursForm: FormGroup;
  idCourse: any | null = null;
  cours: Course | null = null;
  currentImageUrl: string | null = null;
  messageSucces: string = '';
  messageErreur: string = '';
  routeSub: any;
  categories: string[] = [];

  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private coursService: CoursesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.coursForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: [null],
      level: [''],
      status: [false],
      price: [0],
      liked: [false],
      categorie: ['', Validators.required],
      picture: [null],
      file: [null]
    });
  }

  ngOnInit(): void {

    // Récupérer l'ID du cours depuis l'URL
    this.routeSub = this.route.paramMap.subscribe(params => {
      this.idCourse = Number(params.get('idCourse')); // Récupérer 'idCourse' depuis les paramètres de la route

      if (!isNaN(this.idCourse)) {
        this.chargerCours(this.idCourse); // Charger le cours en utilisant l'idCourse
      } else {
        console.error("ID de cours invalide");
        this.router.navigate(['/courses-list']); // Rediriger vers la liste des cours en cas d'ID invalide
      }
    });
    this.loadCategories();
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }


  chargerCours(idCourse: number): void { // Renommé loadQuestion en chargerCours et adapté pour Cours
    this.coursService.getCourseById(idCourse).subscribe({
      next: (cours: Course) => {
        this.cours = cours; // Stocker le cours récupéré

        console.log("cours.date in chargerCours before new Date:", cours.date); // 🚩 DEBUG LOG 1 - Pour déboguer la date

        this.coursForm.patchValue({ // Pré-remplir le formulaire avec les données du cours
          title: cours.title,
          description: cours.description,
          date: cours.date ? new Date(cours.date) : null, // Convertir la date string en objet Date
          level: cours.level,
          status: cours.status,
          price: cours.price,
          liked: cours.liked,
          categorie: cours.categorie,
          picture: cours.picture // URL de l'image actuelle pour affichage
        });

        console.log("formValue.date after patchValue in chargerCours:", this.coursForm.get('date')?.value); // 🚩 DEBUG LOG 2 - Pour déboguer la date


        // Afficher l'image actuelle si elle existe
        this.currentImageUrl = cours.picture
          ? cours.picture
          : null;
         console.log('currentImageUrl:', this.currentImageUrl); // Debug URL Image
      },
      error: err => {
        console.error("Erreur lors du chargement du cours", err);
        this.messageErreur = "Erreur lors du chargement des informations du cours. Veuillez réessayer.";
      }
    });
  }


  loadCategories() {
    this.coursService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  onFileSelected(event: any): void { // Gardez la méthode onFileSelected pour la gestion du fichier image
    const file = event.target.files?.[0];
    if (file) {
      this.coursForm.patchValue({ file: file }); // Mettre à jour la valeur du champ 'file' dans le formulaire
      this.coursForm.get('file')?.updateValueAndValidity(); // Mettre à jour les validateurs (bien que pas de validateur ici pour l'instant)
    }
  }

  modifierCours(): void {
    if (this.coursForm.valid && this.idCourse !== null) {
      this.isLoading = true;

      const formValue = this.coursForm.value;
      const coursMisAJour = new FormData();

      // 🔹 Convertir l'objet coursForm.value en JSON string (sauf 'file')
      const coursJson = JSON.stringify({
        title: formValue.title,
        description: formValue.description,
        date: formValue.date ,
        level: formValue.level,
        status: formValue.status,
        price: formValue.price,
        liked: formValue.liked,
        categorie: formValue.categorie
      });

      coursMisAJour.append('cours', coursJson); // ✅ Envoyer les données du cours en JSON
      coursMisAJour.append('idCourse', String(this.idCourse)); // ✅ Envoyer l'ID du cours


      if (formValue.file && formValue.file instanceof File) {
        coursMisAJour.append('image', formValue.file, formValue.file.name);
      }

      console.log("formValue.date in modifierCours before toLocaleDateString:", formValue.date); // 🚩 DEBUG LOG 3 - Pour déboguer la date


      this.coursService.updateCourse(this.idCourse, coursMisAJour)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (coursModifie: Course) => {
            console.log("Cours mis à jour avec succès", coursModifie);
            this.messageSucces = "Cours mis à jour avec succès !";
            this.messageErreur = '';
            // Si votre backend renvoie la nouvelle URL de l'image, mettez à jour currentImageUrl ici :
            // this.currentImageUrl = coursModifie.picture;
            // Sinon, recharger le cours pour obtenir la nouvelle image depuis le backend :
            this.chargerCours(this.idCourse); // Recharger le cours pour obtenir la nouvelle image
            this.router.navigate(['/courses-list']);
          },
          error: (erreur) => {
            console.error("Erreur lors de la mise à jour du cours", erreur);
            this.messageErreur = "Erreur lors de la mise à jour du cours. Veuillez réessayer.";
            this.messageSucces = '';
          }
        });
    } else {
      this.messageErreur = "Le formulaire est invalide. Veuillez vérifier les champs obligatoires.";
      this.messageSucces = '';
    }
  }

}