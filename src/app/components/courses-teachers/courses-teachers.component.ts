import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { Course } from 'src/app/Core/Model/Course';
import { CourseCategory } from 'src/app/Core/Model/Coursecategory';
import { CoursesService } from 'src/app/Core/services/courses.service';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-courses-teachers',
    templateUrl: './courses-teachers.component.html',
    styleUrls: ['./courses-teachers.component.scss'],
    providers: [DatePipe]
})
export class CoursesTeachersComponent implements OnInit {

    courses: any[] = [];
    selectedCourse: any = {};
    filteredCourses: any[] = [];
    searchQuery: string = '';
    isSpeaking: boolean = false;

    selectedFile: File | null = null;
    categories = Object.values(CourseCategory) as string[];
    isEditModalOpen = false;
    courseData = {
        title: '',
        description: '',
        level: '',
        category: '',
        price: null,
        status: false,
        liked: false,
        scheduledPublishDate: '',
        file: null
    };

    courseToDelete: any; // Store the course to be deleted
    private deleteModal: bootstrap.Modal | null = null; // Use null, not undefined

    @ViewChild('deleteConfirmationModal', { static: true }) deleteModalElement!: ElementRef; // Use ViewChild

    // --- Pagination Properties ---
    currentPage: number = 1;
    itemsPerPage: number = 6; // Number of courses per page

    constructor(private courseService: CoursesService, private cdr: ChangeDetectorRef, private http: HttpClient, private datePipe: DatePipe) { }

    ngOnInit(): void {
        this.loadCourses();
    }

    ngAfterViewInit(): void {
        // Initialize the modal *after* the view is initialized
        this.deleteModal = new bootstrap.Modal(this.deleteModalElement.nativeElement);

        // Listen for the hidden event (no need for a subscription)
        this.deleteModalElement.nativeElement.addEventListener('hidden.bs.modal', () => {
            this.courseToDelete = null; // Clear the course to delete
        });
    }

    onSubmit(): void {
        if (this.courseData.category) {
            this.courseData.category = this.courseData.category as CourseCategory; // Conversion en Enum
        } if (this.courseData.scheduledPublishDate && this.courseData.scheduledPublishDate !== '') {
            this.courseData.scheduledPublishDate = this.courseData.scheduledPublishDate.replace("T", " ") + ":00";
            this.courseService.scheduleCoursePublication(this.courseData).subscribe(
                (response) => {
                    console.log('Course scheduled successfully:', response);
                    // You can redirect the user or display a success message here
                    this.loadCourses(); // Reloads the course list after adding

                },
                (error) => {
                    console.error('Error scheduling course:', error);
                    // You can display an error message here
                }
            );
        } else {
            console.log('Please specify a scheduled publish date.');
        }
    }

    onFileChange(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.courseData.file = file;
        }
    }


    // Open the add course popup
    openAddCoursePopup(): void {
        const modal = new bootstrap.Modal(document.getElementById('addCourseModal')!);
        modal.show();
    }

    // Update a course
    updateCourse(): void {
        if (!this.selectedCourse.idCourse) {
            alert('Erreur : ID du cours introuvable.');
            return;
        }

        // Check that category is set in the component
        if (!this.selectedCourse.category || this.selectedCourse.category.trim() === '') {
            alert('Erreur : La catégorie doit être spécifiée.');
            return;
        }

        this.courseService.updateCourse(this.selectedCourse.idCourse, this.selectedCourse, this.selectedFile ?? undefined)
            .subscribe({
                next: (response) => {
                    console.log('✅ Cours mis à jour avec succès !', response);
                    this.loadCourses(); // Reload courses after update
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editCourseModal')!);
                    modal?.hide(); // Close the modal
                },
                error: (error) => {
                    console.error('❌ Erreur lors de la mise à jour du cours :', error);
                    alert(`Erreur lors de la mise à jour du cours: ${error.message}`);
                }
            });
    }

    // Open the edit modal
    openEditModal(course: Course) {
        this.selectedCourse = { ...course };  // Copy course information
        this.isEditModalOpen = true;        // Open the modal
    }
    closeEditModal() {
        this.isEditModalOpen = false;      // Close the modal
    }

    // Handle the selected file
    onFileSelected(event: any): void {
        this.selectedFile = event.target.files[0];
    }

    // Add a course

    addCourse(formValues: any): void {
        const formData = new FormData();
        formData.append('title', formValues.title);
        formData.append('description', formValues.description);
        formData.append('level', formValues.level);
        formData.append('category', formValues.category);
        formData.append('price', formValues.price);
        formData.append('status', formValues.status ? 'true' : 'false');  // Convert to String 'true'/'false'
        formData.append('liked', formValues.liked ? 'true' : 'false');   // Convert to String 'true'/'false'

        if (this.selectedFile) {
            formData.append('file', this.selectedFile);
        }

        this.courseService.addCourse(formData).subscribe({
            next: (response) => {
                console.log('✅ Course added successfully!', response);
                this.loadCourses();
                const modal = bootstrap.Modal.getInstance(document.getElementById('addCourseModal')!);
                modal?.hide();
            },
            error: (error) => {
                console.error('❌ Error adding course:', error);
            }
        });
    }

    openAddCourseWithDatePopup(): void {
        const modal = new bootstrap.Modal(document.getElementById('addCourseWithDateModal')!);
        modal.show();
    }

    addCourseWithDate(formValues: any): void {
        console.log('Form Values:', formValues); // Debugging

        if (!formValues.title || !formValues.description || !formValues.category || !formValues.price || !formValues.level || !formValues.date) {
            alert('Please fill in all required fields');
            return;
        }

        const formData = new FormData();
        formData.append('date', formValues.date);
        formData.append('title', formValues.title);
        formData.append('description', formValues.description);
        formData.append('level', formValues.level);
        formData.append('category', formValues.category);
        formData.append('price', formValues.price.toString());
        formData.append('status', formValues.status ? 'true' : 'false');
        formData.append('liked', formValues.liked ? 'true' : 'false');

        if (this.selectedFile) {
            formData.append('file', this.selectedFile);
        }

        this.courseService.addCourse(formData).subscribe({
            next: (response) => {
                console.log('✅ Course added successfully!', response);
                this.loadCourses();
            },
            error: (error) => {
                console.error('❌ Error adding course:', error);
                alert(`Error adding course: ${error.message}`);
            }
        });
    }

    // Load courses from the backend
    loadCourses() {
        this.courseService.getCourses().subscribe(data => {
            console.log('Data received:', data);
            this.courses = data.map(course => ({
                ...course,
                date: course.date ? new Date(course.date).toISOString().split('T')[0] : null,
                title: course.title || 'Title not available',
                category: course.category || 'Category not defined',
                price: course.price || 0,
                formattedMonth: course.date ? this.datePipe.transform(course.date, 'MMM')?.toUpperCase() : '', // Format month
                formattedDay: course.date ? this.datePipe.transform(course.date, 'd') : ''       // Format day

            }));
            this.filteredCourses = this.courses;
            this.currentPage = 1; // Reset to the first page
            this.cdr.detectChanges(); // Initialize filtered courses
        });
    }

    // Search function
    searchCourses() {
        this.filteredCourses = this.courses.filter(course =>
            course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
        this.currentPage = 1; // Reset to first page after search
    }

    // Start speech recognition
    startSpeechRecognition() {
        const recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!recognition) {
            alert('Speech recognition is not supported on your browser.');
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
            console.error('Speech recognition error:', event.error);
        };
    }

    // Text-to-Speech Method
    textToSpeech(course: any) {
        if (!window.speechSynthesis) {
            alert('Text-to-Speech is not supported on this browser.');
            return;
        }

        if (this.isSpeaking) {
            window.speechSynthesis.cancel();
            this.isSpeaking = false;
            console.log('🔴 Reading stopped.');
            return;
        }

        const text = `${course.title}. Description: ${course.description || 'No description available'}. Date: ${course.date}. Price: ${course.price} euros. Level: ${course.level}.`;

        if (!text.trim()) {
            alert('There is no text to read.');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';

        this.isSpeaking = true;

        utterance.onstart = () => console.log('🟢 Reading in progress...');
        utterance.onend = () => (this.isSpeaking = false);
        utterance.onerror = (event) => {
            console.error('❌ Error:', event.error);
            this.isSpeaking = false;
        };

        window.speechSynthesis.speak(utterance);
    }

     // --- Pagination Methods ---
    // Method to get courses for the current page

    pagedCourses(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.sortedCourses().slice(startIndex, startIndex + this.itemsPerPage);
  }


    // Method to go to the next page
    nextPage() {
        if (this.currentPage < this.totalPages()) {
            this.currentPage++;
        }
    }

    // Method to go to the previous page
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    // Method to calculate the total number of pages
    totalPages(): number {
        return Math.ceil(this.filteredCourses.length / this.itemsPerPage);
    }

    // Sort courses, *then* apply pagination
      sortedCourses() {
        return this.filteredCourses.sort((a, b) => Number(b.liked) - Number(a.liked));
    }


    // Manage favorite
    toggleFavorite(course: any) {
        course.liked = !course.liked;
        this.courses = [...this.courses];  // Create a new array to trigger change detection
        this.courseService.updateCourse(course.idCourse, course).subscribe(
            () => {
                console.log('Course updated successfully');
                this.loadCourses(); // Reload to reflect the updated like status
            },
            error => console.error('Error updating course', error)
        );
        setTimeout(() => {
            if (course.liked) {
                const element = document.getElementById('course-' + course.idCourse);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }, 100);
    }

    // --- Delete Confirmation and Handling ---
    openDeleteConfirmationModal(course: any): void {
        this.courseToDelete = course;

        Swal.fire({
            title: `Êtes-vous sûr de vouloir supprimer le cours: ${course.title}?`,
            text: "Cette action est irréversible!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer!',
            cancelButtonText: 'Annuler' // Add Cancel button text
        }).then((result) => {
            if (result.isConfirmed) {
                this.deleteCourse();
            }
        });
    }

    deleteCourse(): void {
        if (!this.courseToDelete?.idCourse) {
            console.error("⚠️ Course ID is undefined!");
            return;
        }

        this.courseService.deleteCoursen(this.courseToDelete.idCourse).subscribe({
            next: (response) => {
                console.log('Server response:', response);
                // Remove the course from the UI *immediately* after successful deletion
                this.courses = this.courses.filter(c => c.idCourse !== this.courseToDelete.idCourse);
                this.filteredCourses = this.filteredCourses.filter(c => c.idCourse !== this.courseToDelete.idCourse);
                console.log(`✅ Course with ID ${this.courseToDelete.idCourse} removed from UI.`);

                Swal.fire(
                    'Supprimé!',
                    'Le cours a été supprimé.',
                    'success'
                );

                // Manually trigger change detection
                this.cdr.detectChanges();
                 this.currentPage = 1;
            },
            error: (error) => {
                console.error('❌ Error deleting course:', error);
                Swal.fire(
                    'Erreur!',
                    'Une erreur est survenue lors de la suppression.',
                    'error'
                );
            }
        });
    }
}