import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FrontHeaderComponent } from './components/front-header/front-header.component';
import { FrontFooterComponent } from './components/front-footer/front-footer.component';
import { AjouterReclamationComponent } from './components/ajouter-reclamation/ajouter-reclamation.component';
import { ListeReclamationsComponent } from './components/liste-reclamation/liste-reclamation.component';
import { AdminReclamationComponent } from './components/admin-reclamation/admin-reclamation.component';
import { ListTeacherComponent } from './components/list-teacher/list-teacher.component';

const routes: Routes = [

  {path:'home',component:HomeComponent},
  {path:'dashboard',component:DashboardComponent,children:[ 
    {path:'adminrecalamtion',component: AdminReclamationComponent},]

  },
  {path:'front_header',component:FrontHeaderComponent},
  {path:'front_footer',component:FrontFooterComponent},
  {path:'ajouterrecalamtion',component:AjouterReclamationComponent},
  {path:'listrecalamtion',component: ListeReclamationsComponent},
 
  {path:'listeTeacher',component: ListTeacherComponent},
 


  { path: '', redirectTo: '/home', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }