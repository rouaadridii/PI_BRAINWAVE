import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ArticleServiceService } from '../../article-service.service';
import { Article } from '../../models/article';
import { Ressource } from '../../models/ressource';

export interface FormErrors {
  [key: string]: string;
  title: string;
  date: string;
  picture: string;
  categorie: string;
  resource: string;
  resourceDescription: string;
  resourceUrl: string;
}

@Component({
  selector: 'app-add-article',
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.scss']
})
export class AddArticleComponent {
  article: Article = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    picture: '',
    status: true,
    views: 0,
    numberShares: 0,
    categorie: 'NEWS',
    user: { id: 1 },
    ressources: []
  };

  newResource: Ressource = {
    description: '',
    video: '',
    pdf: '',
    picture: ''
  };

  formErrors: FormErrors = {
    title: '',
    date: '',
    picture: '',
    categorie: '',
    resource: '',
    resourceDescription: '',
    resourceUrl: ''
  };

  error: string | null = null;

  constructor(
    private articleService: ArticleServiceService,
    private router: Router
  ) { }

  addResource(): void {
    // Validate resource fields
    if (!this.newResource.description && !this.newResource.video && 
        !this.newResource.pdf && !this.newResource.picture) {
      alert('Please fill at least one field for the resource');
      return;
    }

    // Validate field lengths
    if (this.newResource.description && this.newResource.description.length > 255) {
      alert('Description must be less than 255 characters');
      return;
    }

    if (this.newResource.video && this.newResource.video.length > 255) {
      alert('Video URL must be less than 255 characters');
      return;
    }

    if (this.newResource.pdf && this.newResource.pdf.length > 255) {
      alert('PDF URL must be less than 255 characters');
      return;
    }

    if (this.newResource.picture && this.newResource.picture.length > 255) {
      alert('Picture URL must be less than 255 characters');
      return;
    }

    // Ensure ressources array exists
    if (!this.article.ressources) {
      this.article.ressources = [];
    }

    // Create a new resource with proper structure
    const resourceToAdd: Ressource = {
      description: this.newResource.description || '',
      video: this.newResource.video || '',
      pdf: this.newResource.pdf || '',
      picture: this.newResource.picture || '',
      article: null
    };

    // Add the resource
    this.article.ressources.push(resourceToAdd);
    console.log('Added resource:', resourceToAdd);

    // Reset form
    this.newResource = {
      description: '',
      video: '',
      pdf: '',
      picture: ''
    };
  }

  private ensureValidUrl(url: string | undefined): string | undefined {
    if (!url || url.trim() === '') return undefined;
    
    try {
      // Tenter de créer un objet URL pour validation
      const urlObject = new URL(url);
      return urlObject.toString();
    } catch {
      // Si l'URL n'est pas valide, ajouter https://
      return url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `https://${url}`;
    }
  }

  removeResource(index: number): void {
    if (this.article.ressources) {
      this.article.ressources.splice(index, 1);
      console.log('Resources after removal:', this.article.ressources);
    }
  }

  validateForm(): boolean {
    let isValid = true;
    this.formErrors = {
      title: '',
      date: '',
      picture: '',
      categorie: '',
      resource: '',
      resourceDescription: '',
      resourceUrl: ''
    };

    // Validation du titre
    if (!this.article.title || this.article.title.trim().length === 0) {
      this.formErrors.title = 'Title is required';
      isValid = false;
    }

    // Validation de la date
    if (!this.article.date) {
      this.formErrors.date = 'Date is required';
      isValid = false;
    }

    // Validation de l'URL de l'image
    if (!this.article.picture || this.article.picture.trim().length === 0) {
      this.formErrors.picture = 'Picture URL is required';
      isValid = false;
    }

    // Validation de la catégorie
    if (!this.article.categorie) {
      this.formErrors.categorie = 'Category is required';
      isValid = false;
    }

    // Validate that at least one resource is added
    if (!this.article.ressources || this.article.ressources.length === 0) {
      this.formErrors.resource = 'At least one resource is required';
      isValid = false;
    }

    return isValid;
  }

  // Validation d'URL
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  onSubmit(): void {
    // Check for pending resource
    if (this.newResource.description || this.newResource.video || 
        this.newResource.pdf || this.newResource.picture) {
      this.addResource(); // Add any pending resource
    }

    if (this.validateForm()) {
      // Ensure resources array exists
      if (!this.article.ressources) {
        this.article.ressources = [];
      }

      console.log('Submitting article with resources:', this.article);

      this.articleService.createArticle(this.article).subscribe({
        next: (response) => {
          console.log('Article created successfully:', response);
          this.router.navigate(['/articles']);
        },
        error: (error) => {
          console.error('Error creating article:', error);
          this.error = 'Error creating article';
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/articles']);
  }
} 