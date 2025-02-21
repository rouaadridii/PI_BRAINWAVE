import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CoursesService } from 'src/app/services/courses.service';
import { ReviewService } from 'src/app/services/review.service';


declare global {
  interface Window {
      SpeechRecognition: any;
      webkitSpeechRecognition: any;
  }
}
@Component({
  selector: 'app-courses-students',
  templateUrl: './courses-students.component.html',
  styleUrls: ['./courses-students.component.scss']
})
export class CoursesStudentsComponent {

 courses: any[] = []; // Liste des cours
    selectedCourse: any = null; // Cours sélectionné pour modification
    categories: string[] = [];
    filteredCourses: any[] = []; // Cours filtrés en fonction de la recherche
    searchQuery: string = ''; // Query pour la recherche
    isSpeaking: boolean = false; // Indique si la lecture vocale est en cours
    selectedFile!: File;
    courseForm!: FormGroup;
    courseRatings: { [key: number]: number } = {};
    selectedCourseId: number | null = null;
    userRating: number = 0;
    userComment: string = '';
    selectedCategory: string = 'all';
    hoveredRating = 0;

    // Variables pour la pagination - AJOUTÉ
    currentPage: number = 1;
    itemsPerPage: number = 6; // Nombre de cours par page
    totalCourses: number = 0; // Nombre total de cours, pour la pagination


    constructor(private courseService: CoursesService, private reviewService: ReviewService, private fb: FormBuilder, private router: Router) {
        // Initialisation du formulaire d'ajout d'avis
    }

    ngOnInit(): void {
        this.loadCourses();
        this.loadCategories();
        this.filterCourses(); // Filtrage initial après le chargement
    }

    // Charger les cours depuis le backend et mettre à jour totalCourses
    loadCourses() {
        this.courseService.getAllCourses().subscribe(data => {
            console.log('Données reçues :', data);
            this.courses = data;
            this.totalCourses = this.courses.length; // Mettre à jour totalCourses ici
            this.filterCourses(); // Appliquer le filtrage après le chargement et la mise à jour de totalCourses
            this.courses.forEach(course => {
                this.courseService.getCourseRating(course.idCourse).subscribe(rating => {
                    this.courseRatings[course.idCourse] = rating;
                });
            });
        });
    }


    filterCourses(): void {
        if (this.selectedCategory === 'all') {
            this.filteredCourses = [...this.courses]; // Copier tous les cours
        } else {
            this.filteredCourses = this.courses.filter(course => course.category.toLowerCase() === this.selectedCategory.toLowerCase());
        }
        this.totalCourses = this.filteredCourses.length; // Mettre à jour totalCourses après filtrage
        this.currentPage = 1; // Réinitialiser la page à 1 après le filtrage
    }


    onCategoryButtonClick(category: string): void {
      this.selectedCategory = category;
      if (category === 'favorites') {
          // Filtrer pour afficher seulement les cours favoris (liked === true)
          this.filteredCourses = this.courses.filter(course => course.liked); // 🔑  ФИЛЬТР ПО  course.liked
      } else if (category === 'all') {
          this.filteredCourses = [...this.courses];
      }
      // ... остальная логика для других категорий ...
      this.totalCourses = this.filteredCourses.length;
      this.currentPage = 1;
  }

    // Fonction pour obtenir les cours paginés pour la page actuelle
    getPaginatedCourses(): any[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.filteredCourses.slice(startIndex, endIndex);
    }

    // Méthode pour obtenir le nombre total de pages
    totalPages(): number {
        return Math.ceil(this.totalCourses / this.itemsPerPage);
    }

    // Méthode pour générer un tableau de numéros de page pour l'affichage
    getPagesArray(): number[] {
        const totalPages = this.totalPages();
        return Array(totalPages).fill(0).map((_, index) => index + 1);
    }

    // Méthodes pour changer de page
    goToPage(pageNumber: number): void {
        if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
            this.currentPage = pageNumber;
        }
    }

    previousPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages()) {
            this.currentPage++;
        }
    }


    openRatingPopup(courseId: number) {
        this.selectedCourseId = courseId;
        this.userRating = 0;
        this.userComment = '';
    }

    rateCourse(idCourse: number, rating: number) {
        this.courseService.addReview(idCourse, rating).subscribe(response => {
            console.log('Note enregistrée avec succès !', response);
            // Met à jour la note en local pour l'affichage immédiat
            this.courses.find(c => c.idCourse === idCourse)!.rating = rating;
        });
    }

    // Sélectionner un cours pour modification
    selectCourse(course: any): void {
        this.selectedCourse = { ...course }; // Copie du cours pour modification
    }


    // Mettre à jour un cours
    updateCourse(): void {
        if (!this.selectedCourse?.idCourse) {
            console.error("⚠️ Aucun cours sélectionné pour la mise à jour !");
            return;
        }

        this.courseService.updateCourse(this.selectedCourse.idCourse, this.selectedCourse).subscribe({
            next: (response) => {
                console.log('✅ Cours mis à jour avec succès');
                this.loadCourses(); // Recharger la liste après la mise à jour
                this.selectedCourse = null; // Réinitialiser la sélection
            },
            error: (error) => {
                console.error('❌ Erreur lors de la mise à jour du cours :', error);
            }
        });
    }


    hoverRating(star: number): void {
        this.hoveredRating = star;
    }


    onFileSelected(event: any) {
        if (event.target.files.length > 0) {
            this.selectedFile = event.target.files[0];
        }
    }


    // Annuler la mise à jour
    cancelUpdate(): void {
        this.selectedCourse = null; // Annule la sélection du cours
    }

    // Fonction de recherche
    searchCourses() {
        this.filteredCourses = this.courses.filter(course =>
            course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
        this.totalCourses = this.filteredCourses.length; // Mettre à jour totalCourses après recherche
        this.currentPage = 1; // Réinitialiser la page à 1 après la recherche
    }

    // Fonction de démarrage de la reconnaissance vocale
    startSpeechRecognition() {
        const recognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!recognition) {
            alert('La reconnaissance vocale n\'est pas supportée sur votre navigateur.');
            return;
        }

        const speechRecognition = new recognition();
        speechRecognition.lang = 'fr-FR';
        speechRecognition.continuous = false;
        speechRecognition.interimResults = false;

        speechRecognition.start();

        speechRecognition.onresult = (event: any) => {
            const result = event.results[0][0].transcript;
            this.searchQuery = result;
            this.searchCourses();
        };

        speechRecognition.onerror = (event: any) => {
            console.error('Erreur de reconnaissance vocale:', event.error);
        };
    }

    // Méthode Text-to-Speech qui lit tout le texte visible de la page
    textToSpeech() {
        // Vérifier la disponibilité de l'API speechSynthesis
        if (!window.speechSynthesis) {
            alert('Text-to-Speech n\'est pas supporté sur ce navigateur.');
            return;
        }

        // Si la synthèse vocale est en cours, on l'arrête
        if (this.isSpeaking) {
            window.speechSynthesis.cancel(); // Arrêter la lecture
            this.isSpeaking = false;
            console.log('🔴 Lecture arrêtée.');
            return;
        }

        // Récupérer tout le texte visible de la page
        const bodyText = document.body.innerText; // Récupérer tout le texte de la page

        // Vérifier que le texte n'est pas vide
        if (!bodyText || bodyText.trim() === '') {
            alert('Il n\'y a pas de texte à lire sur cette page.');
            return;
        }

        // Créer l'énoncé de synthèse vocale
        const utterance = new SpeechSynthesisUtterance(bodyText);
        utterance.lang = 'fr-FR';   // Langue en français

        // Marquer que la lecture est en cours
        this.isSpeaking = true;

        // Événement déclenché lorsque la parole commence
        utterance.onstart = () => {
            console.log('🟢 Lecture en cours...');
        };

        // Événement déclenché lorsque la parole se termine
        utterance.onend = () => {
            console.log('✅ Lecture terminée.');
            this.isSpeaking = false;
        };

        // Gestion des erreurs
        utterance.onerror = (event) => {
            console.error('❌ Erreur lors de la lecture du texte:', event.error);
            this.isSpeaking = false;
        };

        // Lancer la lecture du texte
        window.speechSynthesis.speak(utterance);
    }

    sortedCourses() {
        return this.getPaginatedCourses().sort((a, b) => Number(b.liked) - Number(a.liked));
    }

    toggleFavorite(course: any): void {
      course.liked = !course.liked;

      this.courseService.updateCourseLikedStatus(course.idCourse, course.liked).subscribe({
          next: (response) => {
              console.log('Statut favori mis à jour sur le serveur pour le cours', course.title, ':', course.liked);
          },
          error: (error) => {
              console.error('Erreur lors de la mise à jour du statut favori sur le serveur', error);
              course.liked = !course.liked;
              alert('Erreur lors de la mise à jour du statut favori. Veuillez réessayer.');
          }
      });
    

      if (this.selectedCategory === 'favorites') {
          this.filterCourses();
      }
      this.courses = [...this.courses];
  }

  

    confirmerEtSupprimerCours(course: any): void {
        if (!course?.idCourse) {
            console.error("⚠️ ID du cours est indéfini !");
            return;
        }
    
        if (confirm(`Êtes-vous sûr de vouloir supprimer le cours: ${course.title} ?`)) {
            console.log("⏳ Suppression du cours confirmée par l'utilisateur, appel au service...");
    
            this.courseService.deleteCourse(course.idCourse).subscribe({
                next: (response) => {
                    console.log('Réponse du serveur:', response);
                    console.log(`✅ Cours avec ID ${course.idCourse} supprimé du backend.`);
    
                    //  MISE A JOUR DE LA LISTE DES COURS ET RE-FILTRAGE/PAGINATION -  C'EST ICI QUE CA DOIT ÊTRE !
                    this.courses = this.courses.filter(c => c.idCourse !== course.idCourse);
                    console.log(`✅ Cours avec ID ${course.idCourse} supprimé de l'UI (mise à jour immédiate).`);
    
                    this.filterCourses(); //  RE-FILTRER ET RE-PAGINER APRES SUPPRESSION
                },
                error: (error) => {
                    console.error('❌ Erreur lors de la suppression du cours :', error);
                    this.loadCourses(); // Recharger la liste complète en cas d'erreur (ou gestion d'erreur plus fine)
                },
                complete: () => {
                    console.log("✔️ Suppression terminée !");
                }
            });
        } else {
            console.log("❌ Suppression du cours annulée par l'utilisateur.");
        }
    }

    loadCategories() {
        this.courseService.getCategories().subscribe(data => {
            this.categories = data;
        });
    }

    selectCategory(category: string): void {  //  ✅ selectCategory method
        this.selectedCategory = category;
        this.filterCourses();
        // Ici, vous déclencheriez typiquement un rechargement des données ou un filtrage
        // Pour l'instant, implémentation de base dans le clic du bouton template
        console.log('Category selected:', this.selectedCategory);
    }


}
