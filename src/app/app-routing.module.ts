import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FrontHeaderComponent } from './components/front-header/front-header.component';
import { FrontFooterComponent } from './components/front-footer/front-footer.component';
import { TeacherCoursesComponent } from './components/teacher-courses/teacher-courses.component';
import { CoursesListComponent } from './components/courses-list/courses-list.component';
import { AdminCoursesComponent } from './components/admin-courses/admin-courses.component';
import { DashboardStatisticsComponent } from './components/dashboard-statistics/dashboard-statistics.component';
import { AddDetailsCourseComponent } from './components/add-details-course/add-details-course.component';
import { UpdateCourseComponent } from './components/update-course/update-course.component';

const routes: Routes = [

  {path:'home',component:HomeComponent},
  {path:'dashboard',component:DashboardComponent, children: [
    {path: 'statcours', component: DashboardStatisticsComponent },
    {path: 'coursAdmin', component: AdminCoursesComponent },
  ]},
  {path:'front_header',component:FrontHeaderComponent},
  {path:'front_footer',component:FrontFooterComponent},
  {path:'teachercourses',component:TeacherCoursesComponent},
  {path: 'courses-list', component: CoursesListComponent },
  {path: 'adddetailCours', component: AddDetailsCourseComponent },
  { path: 'modifier-cours/:idCourse', component: UpdateCourseComponent },

  

 



  { path: '', redirectTo: '/home', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }