import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleServiceService } from '../../article-service.service';
import { Article } from '../../models/article';

@Component({
  selector: 'app-article-details',
  templateUrl: './article-details.component.html',
  styleUrls: ['./article-details.component.scss']
})
export class ArticleDetailsComponent implements OnInit {
  article: Article | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleServiceService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.articleService.getArticleById(Number(id)).subscribe({
        next: (article) => {
          console.log('Loaded article:', article);
          console.log('Resources:', article.ressources);
          this.article = article;
          if (!this.article.ressources) {
            this.article.ressources = [];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading article:', error);
          this.error = 'Error loading article details';
          this.loading = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/articles']);
  }

  deleteArticle(id: number | undefined): void {
    if (id && confirm('Are you sure you want to delete this article?')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => {
          this.router.navigate(['/articles']);
        },
        error: (error) => {
          console.error('Error deleting article:', error);
          this.error = 'Error deleting article';
        }
      });
    }
  }
} 