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
import { DetailsCourseComponent } from './components/details-course/details-course.component';
import { FavoritCoursesComponent } from './favorit-courses/favorit-courses.component';
import { CoursesSoonComponent } from './courses-soon/courses-soon.component';
import { CoursesTeachersComponent } from './components/courses-teachers/courses-teachers.component';

const routes: Routes = [

  {path:'home',component:HomeComponent},
  {path:'dashboard',component:DashboardComponent, children: [
    {path: 'statcours', component: DashboardStatisticsComponent },
    {path: 'coursAdmin', component: AdminCoursesComponent },
    {path: 'Admindetailcourses/:id', component: AddDetailsCourseComponent },
    {path:'teachercourses',component:TeacherCoursesComponent},
    {path: 'coursteacher', component: AdminCoursesComponent },


  ]},
  {path:'front_header',component:FrontHeaderComponent},
  {path:'front_footer',component:FrontFooterComponent},
  {path: 'courses', component: CoursesListComponent },
  {path: 'adddetailCours', component: AddDetailsCourseComponent },
  {path: 'details/:id', component: DetailsCourseComponent },
  {path: 'courses/my-courses', component: FavoritCoursesComponent },
  {path: 'courses-coming-soon', component: CoursesSoonComponent },
  {path: 'courses-teachers', component: CoursesTeachersComponent },
  {path: 'Admindetailcourses/:id', component: AddDetailsCourseComponent },



  

 



  { path: '', redirectTo: '/home', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }