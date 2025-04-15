import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { Course } from 'src/app/Core/Model/Course';
import { CourseCategory } from 'src/app/Core/Model/Coursecategory';
import { CoursesService } from 'src/app/Core/services/courses.service';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router'; // <-- IMPORT Router

@Component({
    selector: 'app-courses-teachers',
    templateUrl: './courses-teachers.component.html',
    styleUrls: ['./courses-teachers.component.scss'],
    providers: [DatePipe]
})
export class CoursesTeachersComponent implements OnInit {

    courses: any[] = [];
    selectedCourse: any = {}; // Pour édition
    filteredCourses: any[] = [];
    searchQuery: string = '';
    isSpeaking: boolean = false;

    selectedFile: File | null = null; // Pour ajout/édition
    categories = Object.values(CourseCategory) as string[];
    levels = ['Débutant', 'Intermédiaire', 'Avancé'];
    isEditModalOpen = false; // Contrôle l'état du modal d'édition

    // Données pour le formulaire d'ajout immédiat
    newCourseData = {
        title: '', description: '', level: '', category: '',
        price: null, status: false, liked: false, date: null, file: null
    };

    // Données pour le formulaire d'ajout planifié
    scheduledCourseData = {
        title: '', description: '', level: '', category: '',
        price: null, status: false, liked: false, // Status sera forcé à true logiquement
        scheduledPublishDate: '', file: null
    };

    courseToDelete: any;

    // --- Pagination Properties ---
    currentPage: number = 1;
    itemsPerPage: number = 6; // 6 cartes par page

    constructor(
        private courseService: CoursesService,
        private cdr: ChangeDetectorRef,
        private http: HttpClient,
        private datePipe: DatePipe,
        private router: Router // <-- INJECT Router
    ) { }

    ngOnInit(): void {
        this.loadCourses();
    }

    // --- Chargement des cours ---
    loadCourses() {
        this.courseService.getCourses().subscribe(data => {
            this.courses = data.map(course => ({
                ...course,
                date: course.date ? new Date(course.date).toISOString().split('T')[0] : null, // Format YAML-MM-DD
                title: course.title || 'Titre non disponible',
                category: course.category || 'Catégorie non définie',
                price: course.price ?? 0,
                status: course.status ?? false,
                liked: course.liked ?? false,
                formattedMonth: course.date ? this.datePipe.transform(course.date, 'MMM', 'UTC', 'fr-FR')?.toUpperCase() : '',
                formattedDay: course.date ? this.datePipe.transform(course.date, 'd', 'UTC', 'fr-FR') : ''
            }));
            this.filteredCourses = [...this.courses];
            this.currentPage = 1; // Reset à la page 1 après chargement
            this.cdr.detectChanges();
        });
    }

    // --- Helpers Date ---
    getTodayDate(): string {
        return new Date().toISOString().split('T')[0];
    }
    getCurrentDateTimeLocal(): string {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
      return localISOTime;
    }

    // --- Gestion Modals Bootstrap ---
    openModal(modalId: string): void {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }
    closeModal(modalId: string): void {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance?.hide();
             // Nettoyage des états
             if (modalId === 'editCourseModal') {
                 this.isEditModalOpen = false;
                 this.selectedCourse = {};
                 this.selectedFile = null;
             }
             if (modalId === 'addCourseModal') {
                 this.newCourseData = { title: '', description: '', level: '', category: '', price: null, status: false, liked: false, date: null, file: null };
                 this.selectedFile = null;
             }
             if (modalId === 'addCourseWithDateModal') {
               this.scheduledCourseData = { title: '', description: '', level: '', category: '', price: null, status: false, liked: false, scheduledPublishDate: '', file: null };
               this.selectedFile = null;
             }
        }
    }

    // --- AJOUT IMMÉDIAT ---
    handleAddCourseSubmit(form: NgForm): void {
        if (form.invalid) {
            Object.values(form.controls).forEach(control => { control.markAsTouched(); });
            return;
        }
        const formData = new FormData();
        formData.append('title', form.value.title);
        formData.append('description', form.value.description);
        formData.append('level', form.value.level);
        formData.append('category', form.value.category);
        formData.append('price', form.value.price);
        formData.append('status', form.value.status ? 'true' : 'false');
        formData.append('liked', form.value.liked ? 'true' : 'false');
        if (form.value.date) formData.append('date', form.value.date);
        if (this.selectedFile) formData.append('file', this.selectedFile);

        this.courseService.addCourse(formData).subscribe({
            next: (response) => {
                console.log('✅ Cours ajouté avec succès !', response);
                this.loadCourses();
                this.closeModal('addCourseModal');
                form.resetForm(); // Important après succès
                this.selectedFile = null;
                Swal.fire('Succès!', 'Le cours a été ajouté.', 'success');
            },
            error: (error) => {
                console.error('❌ Erreur lors de l\'ajout du cours :', error);
                Swal.fire('Erreur!', `Erreur lors de l'ajout: ${error.message || 'Vérifiez la console'}`, 'error');
            }
        });
    }

    // --- AJOUT PLANIFIÉ ---
    handleScheduleCourseSubmit(form: NgForm): void {
      if (form.invalid) {
          Object.values(form.controls).forEach(control => { control.markAsTouched(); });
          return;
      }
      const scheduledDate = new Date(form.value.scheduledPublishDate);
      if (scheduledDate <= new Date()) {
          Swal.fire('Erreur', 'La date de publication programmée doit être dans le futur.', 'warning');
          return;
      }
      const dataToSend = { ...form.value };
      dataToSend.status = true; // Forcer statut à true comme demandé
      dataToSend.scheduledPublishDate = dataToSend.scheduledPublishDate.replace("T", " ") + ":00"; // Format attendu par backend ?
      if (this.selectedFile) { dataToSend.file = this.selectedFile; }

      this.courseService.scheduleCoursePublication(dataToSend).subscribe({
          next: (response) => {
              console.log('Course scheduled successfully (with status=true):', response);
              this.loadCourses();
              this.closeModal('addCourseWithDateModal');
              form.resetForm(); // Important après succès
              this.selectedFile = null;
              Swal.fire({ title: 'Planifié!', text: 'Le cours a été programmé pour publication (et marqué comme disponible).', icon: 'success', timer: 2500, showConfirmButton: false });
          },
          error: (error) => {
             console.error('Error scheduling course:', error);
             Swal.fire('Erreur!', `La planification a échoué: ${error.message || 'Vérifiez la console'}`, 'error');
         }
      });
    }

    // --- Modification Cours ---
    openEditModal(course: Course) {
        // Ajout de stopPropagation ici n'est pas nécessaire car c'est déclenché par le bouton qui l'a déjà
        this.selectedCourse = {
            ...course,
            date: course.date ? new Date(course.date).toISOString().split('T')[0] : null
        };
        this.selectedFile = null;
        this.isEditModalOpen = true;
        this.cdr.detectChanges();
        setTimeout(() => { this.openModal('editCourseModal'); }, 0);
    }

    handleEditModalClosed(): void { // Appelée par (hidden.bs.modal)
        this.isEditModalOpen = false;
        this.selectedCourse = {};
        this.selectedFile = null;
        console.log("Edit modal closed and state cleaned via (hidden).");
    }

    handleUpdateCourseSubmit(form: NgForm): void {
        if (form.invalid || !this.selectedCourse?.idCourse) {
            if(form.invalid) { Object.values(form.controls).forEach(control => { control.markAsTouched(); }); }
            if (!this.selectedCourse?.idCourse) { Swal.fire('Erreur', 'ID du cours non trouvé pour la mise à jour.', 'error'); }
            return;
        }
        const updatedData = { ...form.value }; // Utilise les valeurs du formulaire lié à selectedCourse
        this.courseService.updateCourse(this.selectedCourse.idCourse, updatedData, this.selectedFile ?? undefined)
            .subscribe({
                next: (response) => {
                    console.log('Course updated:', response);
                    this.loadCourses(); // Recharger pour voir les changements
                    this.closeModal('editCourseModal'); // Ferme la modale
                    Swal.fire('Mis à jour!', 'Le cours a été mis à jour.', 'success');
                    // Nettoyage via closeModal ou handleEditModalClosed
                },
                error: (error) => {
                    console.error('Error updating course:', error);
                    Swal.fire('Erreur!', `Erreur mise à jour: ${error.message || 'Vérifiez la console'}`, 'error');
                }
            });
    }

    // --- Suppression Cours ---
    openDeleteConfirmationModal(course: any): void {
        // Ajout de stopPropagation ici n'est pas nécessaire
        this.courseToDelete = course;
        Swal.fire({
            title: `Supprimer: ${course.title}?`, text: "Cette action est irréversible !", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer!', cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) { this.deleteCourse(); }
            else { this.courseToDelete = null; }
        });
    }

    deleteCourse(): void {
        if (!this.courseToDelete?.idCourse) { console.error("ID cours indéfini!"); return; }
        const courseIdToDelete = this.courseToDelete.idCourse;
        this.courseService.deleteCoursen(courseIdToDelete).subscribe({
            next: (response) => {
                console.log('Server response on delete:', response);
                // Mise à jour UI optimiste
                this.courses = this.courses.filter(c => c.idCourse !== courseIdToDelete);
                this.filteredCourses = this.filteredCourses.filter(c => c.idCourse !== courseIdToDelete);
                Swal.fire('Supprimé!', 'Le cours a été supprimé.', 'success');
                this.courseToDelete = null;
                // Ajuster la pagination si page devient vide
                if (this.pagedCourses().length === 0 && this.currentPage > 1) { this.currentPage--; }
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error deleting course:', error);
                Swal.fire('Erreur!', `Erreur lors de la suppression: ${error.error || error.message || 'Vérifiez la console'}`, 'error');
                this.courseToDelete = null;
            }
        });
    }

    // --- Bascule Statut Visibilité ---
    toggleCourseStatusAlternative(course: any): void {
      // Ajout de stopPropagation ici n'est pas nécessaire
      const courseId = course.idCourse;
      const currentStatus = course.status ?? false;
      const newStatus = !currentStatus;
      const courseIndex = this.courses.findIndex(c => c.idCourse === courseId);
      const courseDataToUpdate = { // Préparer l'objet complet attendu par updateCourse
        idCourse: course.idCourse, title: course.title, description: course.description, level: course.level, category: course.category,
        price: course.price, date: course.date, liked: course.liked, status: newStatus // Seul status change
      };

      // Optimistic UI
      course.status = newStatus;
      if (courseIndex !== -1) this.courses[courseIndex].status = newStatus;
      // Il faut aussi potentiellement mettre à jour filteredCourses si on veut voir le changement immédiatement
      const filteredIndex = this.filteredCourses.findIndex(c => c.idCourse === courseId);
       if (filteredIndex !== -1) this.filteredCourses[filteredIndex].status = newStatus;
      this.cdr.detectChanges();

      // Appel API
      this.courseService.updateCourse(courseId, courseDataToUpdate, undefined).subscribe({
          next: (updatedCourseFromServer) => {
            console.log(`Status updated via updateCourse for ${courseId} to ${newStatus}`);
            // Optionnel : rafraîchir complètement l'objet depuis le serveur
             if (courseIndex !== -1 && updatedCourseFromServer) {
                 const updatedData = {
                     ...updatedCourseFromServer,
                     date: updatedCourseFromServer.date ? new Date(updatedCourseFromServer.date).toISOString().split('T')[0] : null,
                     formattedMonth: updatedCourseFromServer.date ? this.datePipe.transform(updatedCourseFromServer.date, 'MMM', 'UTC', 'fr-FR')?.toUpperCase() : '',
                     formattedDay: updatedCourseFromServer.date ? this.datePipe.transform(updatedCourseFromServer.date, 'd', 'UTC', 'fr-FR') : ''
                 };
                 this.courses.splice(courseIndex, 1, updatedData);
                 this.filteredCourses = [...this.courses]; // Recréer filteredCourses pour la synchro
                 this.searchCourses(); // Réappliquer filtre/tri si l'ordre dépend du statut
             }
          },
          error: (error) => { // Rollback UI
              console.error(`Error using updateCourse for status change on ${courseId}:`, error);
              course.status = currentStatus;
              if (courseIndex !== -1) { this.courses[courseIndex].status = currentStatus; }
               if (filteredIndex !== -1) this.filteredCourses[filteredIndex].status = currentStatus;
              this.cdr.detectChanges();
              Swal.fire('Erreur', "Impossible de changer la visibilité.", 'error');
          }
      });
    }

    // --- Gestion Fichiers ---
    onFileSelected(event: any, target: 'add' | 'schedule' | 'edit'): void {
        const file = event.target.files?.[0];
        this.selectedFile = file || null;
    }

    // --- Recherche & Voix ---
    searchCourses() {
        const term = this.searchQuery.toLowerCase().trim();
        if (!term) {
            this.filteredCourses = [...this.courses];
        } else {
            this.filteredCourses = this.courses.filter(course =>
                (course.title?.toLowerCase() || '').includes(term) ||
                (course.description?.toLowerCase() || '').includes(term) ||
                (course.category?.toLowerCase() || '').includes(term) ||
                (course.level?.toLowerCase() || '').includes(term)
            );
        }
        this.currentPage = 1; // Reset page après recherche
    }

    startSpeechRecognition() {
        const recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!recognition) { Swal.fire('Erreur', 'Reconnaissance vocale non supportée par ce navigateur.', 'warning'); return; }
        const speechRecognition = new recognition();
        speechRecognition.lang = 'fr-FR'; speechRecognition.continuous = false; speechRecognition.interimResults = false;
        speechRecognition.start();
        // Optionnel : Indiquer écoute (visuel)
        speechRecognition.onresult = (event: any) => {
            this.searchQuery = event.results[0][0].transcript;
            this.searchCourses();
        };
        speechRecognition.onerror = (event: any) => {
            console.error('Erreur SpeechRecognition:', event.error);
            Swal.fire('Erreur Vocale', `Erreur: ${event.error}`, 'error');
        };
        speechRecognition.onend = () => { /* Fin écoute */ };
    }

    // --- Text to Speech ---
    textToSpeech(course: any) {
      // Ajout de stopPropagation ici n'est pas nécessaire
        if (!window.speechSynthesis) { Swal.fire('Erreur', 'Synthèse vocale non supportée.', 'warning'); return; }
        if (this.isSpeaking) { window.speechSynthesis.cancel(); this.isSpeaking = false; return; }

        const text = `${course.title}. Catégorie: ${course.category || 'Non définie'}. Niveau: ${course.level || 'Non défini'}. Description: ${course.description || 'Aucune description'}. ${course.date ? 'Date: ' + (this.datePipe.transform(course.date, 'longDate', 'UTC', 'fr-FR') || 'Non définie') + '.' : ''} Prix: ${course.price ? course.price + ' dollars' : 'Gratuit'}.`;
        if (!text.trim()) { Swal.fire('Info', 'Pas de texte à lire pour ce cours.', 'info'); return; }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        this.isSpeaking = true;
        this.cdr.detectChanges();

        utterance.onend = () => { this.isSpeaking = false; this.cdr.detectChanges(); };
        utterance.onerror = (event) => {
            console.error('TTS Error:', event.error);
            this.isSpeaking = false;
            this.cdr.detectChanges();
            Swal.fire('Erreur TTS', `Erreur de synthèse: ${event.error}`, 'error');
        };
        window.speechSynthesis.speak(utterance);
    }

    // --- Gestion Favoris ---
    toggleFavorite(course: any) {
        // Ajout de stopPropagation ici n'est pas nécessaire
        const originalLikedStatus = course.liked ?? false;
        course.liked = !originalLikedStatus; // Optimistic UI

        const courseDataToUpdate = { // Préparer l'objet complet attendu par updateCourse
          idCourse: course.idCourse, title: course.title, description: course.description, level: course.level, category: course.category,
          price: course.price, date: course.date, status: course.status, liked: course.liked // liked a changé
        };

        // Mise à jour UI (optimiste)
         const courseIndex = this.courses.findIndex(c => c.idCourse === course.idCourse);
         if(courseIndex !== -1) this.courses[courseIndex].liked = course.liked;
         const filteredIndex = this.filteredCourses.findIndex(c => c.idCourse === course.idCourse);
         if(filteredIndex !== -1) this.filteredCourses[filteredIndex].liked = course.liked;
         this.cdr.detectChanges();


        // Appel API
        this.courseService.updateCourse(course.idCourse, courseDataToUpdate, undefined)
            .subscribe({
                next: () => { console.log('Like status updated via updateCourse'); },
                error: error => { // Rollback UI
                    console.error('Error updating like status via updateCourse', error);
                    course.liked = originalLikedStatus;
                     if(courseIndex !== -1) this.courses[courseIndex].liked = originalLikedStatus;
                     if(filteredIndex !== -1) this.filteredCourses[filteredIndex].liked = originalLikedStatus;
                    this.cdr.detectChanges();
                    Swal.fire('Erreur', 'Impossible de modifier le statut favori.', 'error');
                }
            });
    }


    // --- Pagination ---
    pagedCourses(): any[] {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const sorted = this.sortCoursesForDisplay(this.filteredCourses); // Trier avant de paginer
        return sorted.slice(startIndex, startIndex + this.itemsPerPage);
    }
    nextPage() { if (this.currentPage < this.totalPages()) { this.currentPage++; } }
    prevPage() { if (this.currentPage > 1) { this.currentPage--; } }
    totalPages(): number { return Math.ceil(this.filteredCourses.length / this.itemsPerPage); }

    // --- Tri ---
    sortCoursesForDisplay(coursesToSort: any[]): any[] {
        // Tri par date décroissante (les plus récents d'abord)
        return [...coursesToSort].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA; // Tri décroissant
        });
    }

    // ================================================
    // == MÉTHODE POUR LA NAVIGATION PAR CLIC SUR CARTE ==
    // ================================================
    navigateToDetails(course: any): void {
      // Note: Le $event.stopPropagation() dans le HTML est essentiel
      // pour que cette méthode ne soit pas appelée si on clique sur un bouton interne.
      if (course && course.idCourse) {
          this.router.navigate(['/Admindetailcourses', course.idCourse]);
      } else {
          console.error("Impossible de naviguer: ID du cours manquant ou cours invalide.", course);
      }
    }
    // ================================================

}