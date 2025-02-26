import { Component, OnInit } from '@angular/core';
import { ArticleServiceService } from '../../article-service.service';
import { Article } from '../../models/article';
import { Ressource } from '../../models/ressource';
import { Router } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {
  searchText: string = '';
  filteredArticles: Article[] = [];
  articles: Article[] = [];
  showAddForm = false;

  newArticle: Article = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    categorie: 'NEWS',
    status: true,
    views: 0,
    numberShares: 0,
    ressources: [],
    user: { id: 1 }
  };

  newResource: Ressource = {
    description: '',
    video: '',
    pdf: '',
    picture: ''
  };

  loading = false;
  error: string | null = null;
  selectedCategorie: 'ALL' | 'NEWS' | 'SUCCESS_STORY' | 'BLOG' = 'ALL';

  sourceLang: string = 'fr';
  targetLang: string = 'en';

  searchPlaceholder: string = 'Search by title...';

  constructor(
    private articleService: ArticleServiceService,
    private router: Router,
    private translationService: TranslationService
  ) { }

  ngOnInit(): void {
    console.log('Article component initialized');
    this.sourceLang = localStorage.getItem('sourceLanguage') || 'fr';
    this.targetLang = localStorage.getItem('targetLanguage') || 'en';
    
    this.translationService.setLanguages(this.sourceLang, this.targetLang);
    
    this.loadArticles();

    // Ajouter le placeholder à la liste des éléments à traduire
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
      searchInput.setAttribute('placeholder', this.searchPlaceholder);
      searchInput.classList.add('translate-placeholder');
    }
  }

  onLanguageChange(source: string, target: string) {
    try {
      // Garder la langue actuelle comme source
      const currentSource = this.sourceLang;
      
      // Mettre à jour la langue source avec la langue cliquée
      this.sourceLang = source;
      
      // La langue cible devient la langue sur laquelle on clique
      this.targetLang = source;
      
      // Configurer le service de traduction
      this.translationService.setLanguages(currentSource, source);
      
      // Traduire la page
      const elementsToTranslate = document.querySelectorAll('.translate');
      this.translationService.translatePage(elementsToTranslate);
    } catch (error) {
      console.error(error);
    }
  }

  loadArticles(): void {
    this.loading = true;
    this.error = null;
    this.articleService.getAllArticles().subscribe({
      next: (data: Article[]) => {
        if (data && Array.isArray(data)) {
          this.articles = data;
          this.filteredArticles = [...this.articles];
          setTimeout(() => {
            const elementsToTranslate = document.querySelectorAll('.translate');
            this.translationService.translatePage(elementsToTranslate);
          }, 100);
        } else {
          this.error = 'Invalid data format received';
        }
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to load articles:', error);
        this.error = `Error loading articles: ${error.message}`;
        this.loading = false;
      }
    });
  }
  
  filterArticles(): void {
    let filtered = this.articles;
    
    // First filter by search text if any
    if (this.searchText) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
    
    // Then filter by category if not ALL
    if (this.selectedCategorie !== 'ALL') {
      filtered = filtered.filter(article => article.categorie === this.selectedCategorie);
    }
    
    this.filteredArticles = filtered;
  }

  onCategorieChange(categorie: 'ALL' | 'NEWS' | 'SUCCESS_STORY' | 'BLOG'): void {
    this.selectedCategorie = categorie;
    this.filterArticles();
  }

  addResource(): void {
    if (!this.newArticle.ressources) {
      this.newArticle.ressources = [];
    }
    this.newArticle.ressources.push({...this.newResource});
    this.newResource = {
      description: '',
      video: '',
      pdf: '',
      picture: ''
    };
  }

  removeResource(index: number): void {
    if (this.newArticle.ressources) {
      this.newArticle.ressources.splice(index, 1);
    }
  }

  onSubmit(): void {
    console.log('Submitting article:', this.newArticle);
    this.articleService.createArticle(this.newArticle).subscribe({
      next: (response: Article) => {
        console.log('Article created successfully:', response);
        this.loadArticles();
        this.showAddForm = false;
        this.resetNewArticle();
        window.location.reload();
      },
      error: (error) => {
        console.error('Error creating article:', error);
        alert('Error creating article: ' + error.message);
      }
    });
  }

  deleteArticle(id: number | undefined): void {
    if (id && confirm('Are you sure you want to delete this article?')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => {
          this.loadArticles();
        },
        error: (error) => {
          console.error('Error deleting article:', error);
          alert('Error deleting article');
        }
      });
    }
  }

  editArticle(id: number | undefined): void {
    if (id) {
      this.router.navigate(['/articles/edit', id]);
    }
  }
  
  private resetNewArticle(): void {
    this.newArticle = {
      title: '',
      date: new Date().toISOString().split('T')[0],
      categorie: 'NEWS',
      status: true,
      views: 0,
      numberShares: 0,
      ressources: [],
      user: { id: 1 }
    };
    this.newResource = {
      description: '',
      video: '',
      pdf: '',
      picture: ''
    };
  }
}
