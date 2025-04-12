import { Component, OnInit, ElementRef, Renderer2, HostListener } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Course } from 'src/app/Core/Model/Course';
import { CoursesService } from 'src/app/Core/services/courses.service';
import { ReviewService } from 'src/app/Core/services/review.service';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'; // Import switchMap

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

@Component({
  selector: 'app-courses-list',
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.scss'],
  providers: [DatePipe, CurrencyPipe]
})
export class CoursesListComponent implements OnInit {
  // ... (le reste de tes variables, comme avant)
  selectedPriceRange: string = 'all';
  sortOption: string = 'default';
  selectedCategory: string = 'all';
  courses: any[] = [];
  selectedCourse: any = null;
  categories: string[] = [];
  filteredCourses: any[] = [];
  searchQuery: string = '';
  isSpeaking: boolean = false;
  selectedFile!: File;
  courseForm!: FormGroup;
  courseRatings: { [key: number]: number } = {};
  selectedCourseId: number | null = null;
  userRating: number = 0;
  userComment: string = '';
  courseId!: number;
  currentPage: number = 1;
  itemsPerPage: number = 6;
  filter: 'all' | 'favorites' = 'all';
  averageRating: { [idCourse: number]: number } = {};
  suggestions: any[] = [];
  showSuggestions: boolean = false;
  highlightedSuggestion: any = null;
  private searchTerms = new Subject<string>();
  private mouseOverSuggestions = false;
  totalCourses: number = 0;
  allCoursesCount: number = 0;  // Compteur pour tous les cours
  favoriteCoursesCount: number = 0;  // Compteur pour les cours favoris

  constructor(
    private courseService: CoursesService,
    private reviewService: ReviewService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private el: ElementRef,
    private renderer: Renderer2,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe
  ) {
    this.courseForm = this.fb.group({
      title: [''],
      description: [''],
      level: [''],
      category: [''],
      price: [''],
      status: [false],
      date: ['']
    });

    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    
  }


  ngOnInit(): void {
    this.loadCourses();

    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      // switchMap est plus approprié ici que de s'abonner directement.
      switchMap(term => {
          this.updateSuggestions(term); // Mettre à jour les suggestions *à chaque fois*
          return []; // switchMap doit retourner un Observable, mais on n'en a pas besoin ici
      })
    ).subscribe(); //  subscribe() est toujours nécessaire à la fin.
  }


  updateSuggestions(term: string) {
    const searchTerm = term.toLowerCase();

    if (!searchTerm) {
      this.suggestions = [];
      this.showSuggestions = false;
      return;
    }

    // Recherche insensible à la casse et partielle dans plusieurs champs.
    this.suggestions = this.courses
      .filter(course => this.courseMatchesSearch(course, searchTerm))
      .map(course => ({ id: course.idCourse, title: course.title }))
      .slice(0, 10); // Limite le nombre de suggestions.

    this.showSuggestions = this.suggestions.length > 0;
  }
  courseMatchesSearch(course: any, searchTerm: string): boolean {
    const fieldsToSearch = [
      course.title,
      course.description,
      course.category,
      course.level,
      course.status ? 'Disponible' : 'Indisponible',
      this.currencyPipe.transform(course.price, 'EUR', 'symbol', '1.2-2'),
      this.datePipe.transform(course.date, 'longDate', '', 'fr-FR')
    ];

    // Vérifie si *n'importe quel* champ contient le terme de recherche.
    return fieldsToSearch.some(field => {
        return field && field.toString().toLowerCase().includes(searchTerm);
    });
}

  // ... (le reste de tes méthodes, comme avant)

  onSearchInput() {
    this.searchTerms.next(this.searchQuery);  // Émet la nouvelle valeur de recherche.
    this.filterCourses(); // Applique les filtres *et* la recherche

}

selectSuggestion(suggestion: any) {
    this.searchQuery = suggestion.title;
    this.hideSuggestionsList();
    this.filterCourses(); // <-- Important:  Applique la recherche *après* avoir sélectionné une suggestion.
}

searchCourses() {
  // Cette méthode n'est plus vraiment nécessaire, car filterCourses() fait tout.
  // Tu peux la laisser vide ou la supprimer et appeler filterCourses() directement.
}
@HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.el.nativeElement.querySelector('.search-bar').contains(event.target)) {
      this.hideSuggestionsList();
    }
  }

  hideSuggestionsList() {
    this.showSuggestions = false;
    this.highlightedSuggestion = null;
  }

  onSearchBlur() {
    if (!this.mouseOverSuggestions) {
      this.hideSuggestionsList();
    }
  }

  onMouseEnterSuggestions() {
    this.mouseOverSuggestions = true;
  }

  onMouseLeaveSuggestions() {
    this.mouseOverSuggestions = false;
  }

  highlightSuggestion(suggestion: any) {
    this.highlightedSuggestion = suggestion;
  }

  // ... (le reste des méthodes)
    loadCourseRatings(idCourse: number): void {
    this.courseService.getCourseRating(idCourse).subscribe(rating => {
      this.courseRatings[idCourse] = rating;
    });
  }
  // Méthode pour définir le filtre
  setFilter(filter: 'all' | 'favorites') { // 'comingSoon' supprimé
    this.filter = filter;
    this.applyFilter();
  }

    // Méthode pour appliquer le filtre
    applyFilter() {
    switch (this.filter) {
      case 'all':
        this.filteredCourses = this.courses.filter(course => course.published);
        break;
      case 'favorites':
        this.filteredCourses = this.courses.filter(course => course.liked && course.published);
        break;
      // Plus de case 'comingSoon'
    }
    this.currentPage = 1; // Réinitialise la pagination
  }
    onPriceRangeChange(priceRange: string): void {
    this.selectedPriceRange = priceRange;
    this.filterCourses();
  }

  onSortOptionChange(sortOption: string): void {
    this.sortOption = sortOption;
    this.filterCourses();
  }

   filterCourses(): void {
    let filteredCourses = [...this.courses];

    // Filter by category
    if (this.selectedCategory !== 'all') {
      if (this.selectedCategory === 'favorites') {
        filteredCourses = filteredCourses.filter(course => course.liked);
      } else {
        filteredCourses = filteredCourses.filter(course => course.categorie.toLowerCase() === this.selectedCategory.toLowerCase());
      }
    }

    // Filter by price range
    if (this.selectedPriceRange !== 'all') {
      filteredCourses = filteredCourses.filter(course => {
        switch (this.selectedPriceRange) {
          case 'free':
            return course.price === 0;
          case 'under50':
            return course.price < 50;
          case '50to100':
            return course.price >= 50 && course.price <= 100;
          case 'above100':
            return course.price > 100;
          default:
            return true;
        }
      });
    }

  // Filter by search query
        if (this.searchQuery.trim() !== '') {
            const searchTerm = this.searchQuery.toLowerCase();
            filteredCourses = filteredCourses.filter(course => this.courseMatchesSearch(course, searchTerm));
        }
        // Update suggestions *after* filtering
        this.updateSuggestions(this.searchQuery);


    // Sort courses
    this.sortCourses(filteredCourses);

    this.filteredCourses = filteredCourses;
    this.totalCourses = this.filteredCourses.length;
    this.currentPage = 1;
  }

  sortCourses(courses: Course[]): void {
    switch (this.sortOption) {
      case 'priceAsc':
        courses.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        courses.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        courses.sort((a, b) => Number(b.liked) - Number(a.liked));
        break;
      case 'rating':
        courses.sort((a, b) => (this.averageRating[b.idCourse] || 0) - (this.averageRating[a.idCourse] || 0));
        break;
      default:
        break;
    }
  }


  addToFavorites(courseId: number): void {
    this.courseService.addToFavorites(courseId).subscribe(
      (course: Course) => {
        console.log('Cours ajouté aux favoris:', course);
        //Trouver le course et modifier
        const courseIndex = this.courses.findIndex(c => c.idCourse === courseId);
        if (courseIndex !== -1) {
          this.courses[courseIndex] = course; //Mettre à jour le course
          this.courses[courseIndex].animateUp = true;
          // Supprimez la classe d'animation après un délai (pour permettre à l'animation de se terminer)
          setTimeout(() => {
            this.courses[courseIndex].animateUp = false;
            this.applyFilter();
          }, 500); // 500ms correspondent à la durée de l'animation dans le CSS
        }

        this.applyFilter(); // <- Très important : Applique *immédiatement* le filtre

      },
      (error) => {
        console.error('Erreur lors de l\'ajout aux favoris:', error);
      }
    );
  }

  openRatingPopup(courseId: number) {
    this.selectedCourseId = courseId;
    this.userRating = 0;
    this.userComment = '';
  }

  loadCourses() {
    this.courseService.getCourses().subscribe(courses => {
      this.courses = courses.map(course => ({ ...course, animateUp: false }));
      this.courses.forEach(course => {
        this.loadAverageRatingForCourse(course.idCourse);
      });
      this.applyFilter();
    });
  }

  formatDates() {
    this.courses.forEach(course => {
      if (course.scheduledPublishDate) {
        course.scheduledPublishDate = new Date(course.scheduledPublishDate).toLocaleString();
      }
    });
  }

  selectCourse(course: any): void {
    this.selectedCourse = { ...course };
  }

  updateCourse() {
    const formData = new FormData();
    Object.keys(this.courseForm.controls).forEach(key => {
      formData.append(key, this.courseForm.get(key)?.value);
    });

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.courseService.updateCourse(this.courseId, formData).subscribe({
      next: () => {
        alert('Cours mis à jour avec succès !');
        this.router.navigate(['/courses']);
      },
      error: (err) => console.error('Erreur lors de la mise à jour', err)
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  cancelUpdate(): void {
    this.selectedCourse = null;
  }
      startSpeechRecognition() {
    const recognition = (window.SpeechRecognition || (window as any).webkitSpeechRecognition);

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
      this.searchCourses(); // <- Applique la recherche *et le filtre*
    };

    speechRecognition.onerror = (event: any) => {
      console.error('Erreur de reconnaissance vocale:', event.error);
    };
  }

  textToSpeech(course: any) {
    if (!window.speechSynthesis) {
      alert('Text-to-Speech n\'est pas supporté sur ce navigateur.');
      return;
    }

    // Si une lecture est en cours, l'arrête.
    if (this.isSpeaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      console.log('🔴 Lecture arrêtée.');
      return; // Important: Sortir de la fonction ici
    }

    // Crée le texte à lire, en utilisant les pipes *directement* ici.
    const text = `${course.title}. ${course.description || 'Aucune description disponible.'}. ${course.category ? 'Catégorie, ' + course.category + '.' : ''}  ${course.price ? 'Prix, ' + this.currencyPipe.transform(course.price, 'EUR', 'symbol', '1.2-2') : 'Gratuit.'}. Niveau, ${course.level}.`;


    if (!text.trim()) {
      alert('Il n\'y a pas de texte à lire.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR'; // Spécifiez la langue, c'est une bonne pratique

    this.isSpeaking = true; // Marquez la lecture comme commencée

    utterance.onstart = () => {
      console.log('🟢 Lecture en cours...');
      course.isSpeaking = true; // Mettez à jour l'état isSpeaking du cours
      // this.cdr.detectChanges(); // Forcer la détection des changements
    };
    utterance.onend = () => {
      this.isSpeaking = false;
      course.isSpeaking = false; // Mettez à jour l'état isSpeaking du cours
      console.log('✅ Lecture terminée.');
      // this.cdr.detectChanges();
    };

    utterance.onerror = (event) => {
      console.error('❌ Erreur lors de la lecture du texte:', event.error);
      this.isSpeaking = false;
      course.isSpeaking = false; // Mettez à jour l'état isSpeaking du cours
      //  this.cdr.detectChanges();
    };

    window.speechSynthesis.speak(utterance);
  }

// Tri des cours (les plus likés en premier) -  Utilisé pour la pagination.
    sortedCourses() {
    // Créer une copie du tableau pour éviter de modifier l'original pendant le tri
    return [...this.filteredCourses].sort((a, b) => Number(b.liked) - Number(a.liked));
  }

  toggleFavorite(course: any) {
    // 1. Basculer l'état 'liked'.
    course.liked = !course.liked;

    // 2. Trouver l'index du cours *dans le tableau original `courses`*.  C'est TRÈS important.
    const courseIndex = this.courses.findIndex(c => c.idCourse === course.idCourse);

    if (courseIndex !== -1) {
      // 3. Mettre à jour le cours *dans le tableau `courses`*.
      this.courses[courseIndex] = { ...course }; // Créez une copie pour ne pas muter directement

      if (course.liked) {
        // Appel du service pour ajouter aux favoris
        this.courseService.addToFavorites(course.idCourse).subscribe(
          (updatedCourse: Course) => {
          // 4. Ajouter la classe pour l'animation *AVANT* d'appliquer le filtre.
          this.courses[courseIndex].animateUp = true;

          // 5. Utiliser setTimeout pour appliquer le filtre *APRÈS* un court délai.
          setTimeout(() => {
            // Supprimez la classe d'animation APRES le délai.
            this.courses[courseIndex].animateUp = false;
            this.applyFilter();
          }, 500); // 500ms correspond à la durée de l'animation (moveUp dans le CSS).
        },
        (error) => {
          console.error('Erreur lors de l\'ajout aux favoris:', error);
          // Réinitialiser l'état 'liked' en cas d'erreur
          course.liked = !course.liked;
        }
      );
    } else {
      // Si on retire des favoris, on réapplique simplement le filtre.
      this.applyFilter();
    }
  } else {
    console.error("Course not found in 'courses' array:", course);
    // Gérer l'erreur, par exemple réinitialiser l'état 'liked' si le cours n'est pas trouvé.
    course.liked = !course.liked;
  }
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
      this.loadCourses(); // Recharge les cours en cas d'erreur
    },
    complete: () => {
      console.log("✔️ Suppression terminée !");
    }
  });
}
}

// Pagination
paginatedCourses(): any[] {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  return this.sortedCourses().slice(startIndex, endIndex);
}

totalPages(): number {
  return Math.ceil(this.filteredCourses.length / this.itemsPerPage);
}

getPages(): number[] {
  return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
}

goToPage(page: number): void {
  this.currentPage = page;
}

nextPage(): void {
  if (this.currentPage < this.totalPages()) {
    this.currentPage++;
  }
}

prevPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}

loadAverageRatingForCourse(idCourse: number): void {
  this.reviewService.getAverageRating(idCourse).subscribe(rating => {
    this.averageRating[idCourse] = rating;
  });
}
}