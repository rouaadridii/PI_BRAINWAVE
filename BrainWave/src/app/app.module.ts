import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ArticleComponent } from './components/article/article.component';
import { ArticleDetailsComponent } from './components/article-details/article-details.component';
import { AddArticleComponent } from './components/add-article/add-article.component';
import { EditArticleComponent } from './components/edit-article/edit-article.component';
import { FrontHeaderComponent } from './components/front-header/front-header.component';
import { FrontFooterComponent } from './components/front-footer/front-footer.component';
import { ArticleServiceService } from './article-service.service';
import { TranslationService } from './services/translation.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ArticleComponent,
    ArticleDetailsComponent,
    AddArticleComponent,
    EditArticleComponent,
    FrontHeaderComponent,
    FrontFooterComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: 'home', component: HomeComponent },
      { path: 'articles', component: ArticleComponent },
      { path: 'articles/add', component: AddArticleComponent },
      { path: 'articles/:id', component: ArticleDetailsComponent },
      { path: 'articles/edit/:id', component: EditArticleComponent },
      { path: '', redirectTo: '/home', pathMatch: 'full' }
    ])
  ],
  providers: [ArticleServiceService, TranslationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
