import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FrontHeaderComponent } from './components/front-header/front-header.component';
import { FrontFooterComponent } from './components/front-footer/front-footer.component';
import { TeacherCoursesComponent } from './components/teacher-courses/teacher-courses.component';
import { CoursesListComponent } from './components/courses-list/courses-list.component';

const routes: Routes = [

  {path:'home',component:HomeComponent},
  {path:'dashboard',component:DashboardComponent},
  {path:'front_header',component:FrontHeaderComponent},
  {path:'front_footer',component:FrontFooterComponent},
  {path:'techercours',component:TeacherCoursesComponent},
  {path: 'courses-list', component: CoursesListComponent },



  { path: '', redirectTo: '/home', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }