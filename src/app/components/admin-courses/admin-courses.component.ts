import { Component, OnInit } from '@angular/core';
import { CoursesService } from 'src/app/services/courses.service';

@Component({
  selector: 'app-admin-courses',
  templateUrl: './admin-courses.component.html',
  styleUrls: ['./admin-courses.component.scss']
})
export class AdminCoursesComponent implements OnInit {


    courses: any[] = []; // Liste des cours
    selectedCourse: any = null; // Cours sélectionné pour modification
    categories: string[] = [];
    filteredCourses: any[] = []; // Cours filtrés en fonction de la recherche
    searchQuery: string = ''; // Query pour la recherche
    isSpeaking: boolean = false; // Indique si la lecture vocale est en cours
  
    constructor(private courseService: CoursesService){}
  
    ngOnInit(): void {
      this.loadCourses();
    }
  
    // Charger les cours depuis le backend
    loadCourses() {
      this.courseService.getAllCourses().subscribe(data => {
        console.log('Données reçues :', data);  // Vérification de la structure des données
        this.courses = data;
        this.filteredCourses = data; // Initialiser les cours filtrés
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
      return this.filteredCourses.sort((a, b) => Number(b.liked) - Number(a.liked));
    }
    
    toggleFavorite(course: any) {
      course.liked = !course.liked; // Inverse l'état du favoris
      this.courses = [...this.courses]; // Met à jour la liste pour déclencher le changement dans Angular
    
      // Attendre le rafraîchissement avant de scroller
      setTimeout(() => {
        if (course.liked) {
          const element = document.getElementById('course-' + course.idCourse);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 100);
    }
  
    confirmerEtSupprimerCours(course: any): void {
      if (!course?.idCourse) {
        console.error("⚠️ ID du cours est indéfini !");
        return;
      }
  
      if (confirm(`Êtes-vous sûr de vouloir supprimer le cours: ${course.title} ?`)) {
        this.courses = this.courses.filter(c => c.idCourse !== course.idCourse);
        console.log(`✅ Cours avec ID ${course.idCourse} supprimé de l'UI.`);
  
        this.courseService.deleteCourse(course.idCourse).subscribe({
          next: (response) => {
            console.log('Réponse du serveur:', response);
          },
          error: (error) => {
            console.error('❌ Erreur lors de la suppression du cours :', error);
            this.loadCourses();
          },
          complete: () => {
            console.log("✔️ Suppression terminée !");
          }
        });
      }
    }
  
    loadCategories() {
      this.courseService.getCategories().subscribe(data => {
        this.categories = data;
      });
    }
  

}
