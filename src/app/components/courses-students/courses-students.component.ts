import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CoursesService } from 'src/app/services/courses.service';
import { ReviewService } from 'src/app/services/review.service'; // Assurez-vous que ReviewService est bien votre service pour les notations
import { Course } from '../course';

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

    courses: Course[] = []; // Utilisez le modèle Course ici
    selectedCourse: any = null;
    categories: string[] = [];
    filteredCourses: Course[] = []; // Utilisez le modèle Course ici
    searchQuery: string = '';
    isSpeaking: boolean = false;
    selectedFile!: File;
    courseForm!: FormGroup;
    courseRatings: { [key: number]: number } = {};
    averageRating: { [idCourse: number]: number } = {}; // Pour stocker les notes moyennes
    selectedCourseId: number | null = null;
    userRating: number = 0;
    userComment: string = '';
    selectedCategory: string = 'all';
    hoveredRating = 0;

    // Variables pour l'autocomplétion - AJOUTÉ
    suggestions: Course[] = []; // Pour stocker les suggestions d'autocomplétion
    showSuggestions: boolean = false; // Pour afficher/masquer les suggestions
    highlightedSuggestion: Course | null = null; // Pour la suggestion mise en évidence (clavier)
    isMouseInsideSuggestions: boolean = false; // Pour suivre si la souris est dans la liste des suggestions


    // Variables pour la pagination - AJOUTÉ
    currentPage: number = 1;
    itemsPerPage: number = 6; // Nombre de cours par page
    totalCourses: number = 0; // Nombre total de cours, pour la pagination

    isReviewFormVisible: boolean = false; // Pour contrôler la visibilité du formulaire d'avis
    reviewedCourseId: number | null = null; // Pour stocker l'ID du cours que l'utilisateur est en train d'évaluer
    reviewRating: number = 0; // Note donnée dans le formulaire d'avis
    reviewComment: string = ''; // Commentaire dans le formulaire d'avis
    hoveredReviewRating = 0; // Pour le hover des étoiles dans le formulaire d'avis
    


    constructor(private courseService: CoursesService, private reviewService: ReviewService, private fb: FormBuilder, private router: Router) { // Injection de ReviewService
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
            console.log('Données reçues de getAllCourses (liste des cours):', data);
            this.courses = data;
            this.totalCourses = this.courses.length;
            this.filterCourses();

            // 🔑 IMPORTANT: Utilisation de reviewService.getAverageRating avec le CHEMIN CORRECT
            this.courses.forEach(course => {
                this.reviewService.getAverageRating(course.idCourse).subscribe(rating => {
                    console.log('Note moyenne reçue pour le cours ID:', course.idCourse, 'Note:', rating);
                    this.averageRating[course.idCourse] = rating; // Stockage dans averageRating (qui devrait être défini comme un objet/map dans votre composant)
                }, error => {
                    console.error('Erreur lors de la récupération de la note moyenne pour le cours ID:', course.idCourse, error);
                    // ⚠️ Gestion de l'erreur si la récupération de la note moyenne échoue pour un cours individuel
                    // Ici, vous pouvez choisir de laisser la note moyenne à undefined, ou afficher une valeur par défaut (ex: -1, 'N/A')
                    this.averageRating[course.idCourse] = -1; // Exemple: Mettre -1 en cas d'erreur pour ce cours
                });
            });
        }, error => {
            console.error('Erreur lors de la récupération de la liste des cours:', error);
        });
    }


    filterCourses(): void {
        let filteredCourses = [...this.courses];

        if (this.selectedCategory !== 'all') {
            if (this.selectedCategory === 'favorites') {
                filteredCourses = filteredCourses.filter(course => course.liked);
            } else {
                filteredCourses = filteredCourses.filter(course => course.categorie.toLowerCase() === this.selectedCategory.toLowerCase());
            }
        }

        if (this.searchQuery.trim() !== '') {
            filteredCourses = filteredCourses.filter(course =>
                course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                course.description?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                course.categorie.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
             this.updateSuggestions(filteredCourses); // Mettre à jour les suggestions
        } else {
            this.suggestions = []; // Vider les suggestions si la requête de recherche est vide
             this.hideSuggestionsList(); // Cacher les suggestions quand la recherche est vide
        }
        this.filteredCourses = filteredCourses;
        this.totalCourses = this.filteredCourses.length;
        this.currentPage = 1;
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
    getPaginatedCourses(): Course[] { // Retourne un tableau de Course
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
        let pagesArray: number[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pagesArray.push(i);
            }
        } else {
            let startPage = Math.max(1, this.currentPage - 2);
            let endPage = Math.min(totalPages, this.currentPage + 2);

            if (startPage > 1) {
                pagesArray.push(1);
                if (startPage > 2) {
                    pagesArray.push(-1);
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                pagesArray.push(i);
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pagesArray.push(-1);
                }
                pagesArray.push(totalPages);
            }
        }
        return pagesArray;
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
        this.filterCourses();
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
        utterance.lang = 'fr-FR';  // Langue en français

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

    toggleFavorite(course: Course): void { // Type course ici
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

    selectCategory(category: string): void {   // ✅ selectCategory method
        this.selectedCategory = category;
        this.filterCourses();
        // Ici, vous déclencheriez typiquement un rechargement des données ou un filtrage
        // Pour l'instant, implémentation de base dans le clic du bouton template
        console.log('Category selected:', this.selectedCategory);
    }


    rateCourse(idCourse: number, rating: number) {
        this.reviewService.addReview(idCourse, rating).subscribe(response => {
            console.log('Note enregistrée avec succès !', response);
            // Met à jour la note en local pour l'affichage immédiat
            this.courses.find(c => c.idCourse === idCourse)!.averageRating = rating;
        });
    }


    openReviewForm(idCourse: number): void {
        this.isReviewFormVisible = true;
        this.reviewedCourseId = idCourse;
        this.reviewRating = 0; // Réinitialiser la note quand on ouvre le formulaire
        this.reviewComment = ''; // Réinitialiser le commentaire
    }

    closeReviewForm(): void {
        this.isReviewFormVisible = false;
        this.reviewedCourseId = null;
        this.reviewRating = 0;
        this.reviewComment = '';
        this.hoveredReviewRating = 0; // Réinitialiser le hover des étoiles
    }

    hoverReviewRating(star: number): void {
        this.hoveredReviewRating = star;
    }

    submitReview(): void {
        if (!this.reviewedCourseId) {
            console.error('Aucun cours sélectionné pour l\'avis.');
            return;
        }

        // ✅ Ajouter une vérification pour s'assurer que reviewedCourseId est un nombre avant de l'utiliser
        if (typeof this.reviewedCourseId === 'number') {
            this.reviewService.addReviewjd(this.reviewedCourseId, this.reviewRating, this.reviewComment).subscribe({
                next: response => {
                    console.log('Avis publié avec succès', response);
                    alert('Merci de votre contribution, vos commentaires aident les autres utilisateurs à decider quelles cours choisis.');
                    this.closeReviewForm();
                    this.loadAverageRatingForCourse(this.reviewedCourseId as number); // Assurer le typage ici aussi
                },
                error: error => {
                    console.error('Erreur lors de la publication de l\'avis', error);
                    // Gérer l'erreur ici, afficher un message à l'utilisateur par exemple
                }
            });
        } else {
            console.error('reviewedCourseId n\'est pas un nombre valide.');
            // Gérer le cas où reviewedCourseId n'est pas un nombre, par exemple afficher un message d'erreur à l'utilisateur
        }
    }

    loadAverageRatingForCourse(idCourse: number): void {
        this.reviewService.getAverageRating(idCourse).subscribe(averageRating => {
            this.averageRating[idCourse] = averageRating;
        });
    }


    onSearchInput(): void { // 🔑 Méthode appelée à chaque saisie dans le champ de recherche
        this.currentPage = 1; // Réinitialiser la pagination quand on recherche
        this.filterCourses(); // Filtrer les cours en fonction de la recherche
        if (this.searchQuery.trim() === '') { // Si le champ de recherche est vide
            this.hideSuggestionsList(); // Cacher les suggestions
        } else {
            this.showSuggestions = true; // Afficher les suggestions sinon
            this.highlightedSuggestion = null; // Réinitialiser la suggestion mise en évidence
        }
    }

    onSearchBlur(): void { // 🔑 Méthode appelée quand le champ de recherche perd le focus
        // Petit délai pour permettre le clic sur une suggestion avant de cacher la liste
        setTimeout(() => {
            if (!this.isMouseInsideSuggestions) { // Vérifier si la souris n'est PAS dans la liste des suggestions
                this.hideSuggestionsList();
            }
        }, 200); // Délai de 200ms (ajuster si nécessaire)
    }

    hideSuggestionsList(): void { // 🔑 Méthode pour cacher la liste des suggestions
        this.showSuggestions = false;
        this.highlightedSuggestion = null;
    }

    updateSuggestions(filteredCourses: Course[]): void { // 🔑 Méthode pour mettre à jour les suggestions
        this.suggestions = filteredCourses.slice(0, 5); // Afficher les 5 premières suggestions (ajuster si besoin)
    }

    selectSuggestion(suggestion: Course): void { // 🔑 Méthode appelée quand on clique sur une suggestion
        this.searchQuery = suggestion.title; // Remplir le champ de recherche avec le titre de la suggestion
        this.filterCourses(); // Filtrer à nouveau les cours avec le titre sélectionné
        this.hideSuggestionsList(); // Cacher la liste des suggestions après la sélection
    }

    highlightSuggestion(suggestion: Course): void { // 🔑 Méthode pour mettre en évidence une suggestion (clavier)
        this.highlightedSuggestion = suggestion;
    }

    onMouseEnterSuggestions(): void { // 🔑 Méthode appelée quand la souris entre dans la liste des suggestions
        this.isMouseInsideSuggestions = true;
    }

    onMouseLeaveSuggestions(): void { // 🔑 Méthode appelée quand la souris quitte la liste des suggestions
        this.isMouseInsideSuggestions = false;
    }
}