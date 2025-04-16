import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { TextToSpeechService } from './text-to-speech.service';
import { FavoriteService } from './favorite.service';
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
import { BackArticleComponent } from './components/back-article/back-article.component';
import { BackHeaderComponent } from './components/back-header/back-header.component';
import { BackMenuAdminComponent } from './components/back-menu-admin/back-menu-admin.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { SimilarArticlesService } from './similar-articles.service';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { ChatbotService } from './services/chatbot.service';
import { LineToBrPipe } from './pipes/line-to-br.pipe';
import { NotificationWebsocketService } from './services/notification-websocket.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ArticleComponent,
    ArticleDetailsComponent,
    AddArticleComponent,
    EditArticleComponent,
    FrontHeaderComponent,
    FrontFooterComponent,
    BackArticleComponent,
    BackHeaderComponent,
    BackMenuAdminComponent,
    DashboardComponent,
    FavoritesComponent,
    ChatbotComponent,
    LineToBrPipe
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
      { path: 'back-office', component: BackArticleComponent },  

      { path: '', redirectTo: '/home', pathMatch: 'full' }
    ]),
    AppRoutingModule
  ],
  providers: [ArticleServiceService, TranslationService,TextToSpeechService,FavoriteService, SimilarArticlesService, ChatbotService, NotificationWebsocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
