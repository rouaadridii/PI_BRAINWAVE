import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FrontHeaderComponent } from './components/front-header/front-header.component';
import { FrontFooterComponent } from './components/front-footer/front-footer.component';
import { BackArticleComponent } from './components/back-article/back-article.component';
import { FavoritesComponent } from './components/favorites/favorites.component';

const routes: Routes = [

  {path:'home',component:HomeComponent},
  {path:'dashboard',component:DashboardComponent},
  {path:'front_header',component:FrontHeaderComponent},
  {path:'front_footer',component:FrontFooterComponent},
  { path: 'back-office/articles', component: BackArticleComponent },
  { path: 'favorites', component: FavoritesComponent },

  { path: '', redirectTo: '/home', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }