import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FrontHeaderComponent } from './components/front-header/front-header.component';
import { FrontFooterComponent } from './components/front-footer/front-footer.component';
import { BackHeaderComponent } from './components/back-header/back-header.component';
import { BackMenuAdminComponent } from './components/back-menu-admin/back-menu-admin.component';
import { TeacherCoursesComponent } from './components/teacher-courses/teacher-courses.component';
import { CoursesListComponent } from './components/courses-list/courses-list.component';
import { AdminCoursesComponent } from './components/admin-courses/admin-courses.component';
import { DetailsCourseComponent } from './components/details-course/details-course.component';
import { AddDetailsCourseComponent } from './components/add-details-course/add-details-course.component';
import { DashboardStatisticsComponent } from './components/dashboard-statistics/dashboard-statistics.component';
import { UpdateCourseComponent } from './components/update-course/update-course.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DashboardComponent,
    FrontHeaderComponent,
    FrontFooterComponent,
    BackHeaderComponent,
    BackMenuAdminComponent,
    TeacherCoursesComponent,
    CoursesListComponent,
    AdminCoursesComponent,
    DetailsCourseComponent,
    AddDetailsCourseComponent,
    DashboardStatisticsComponent,
    UpdateCourseComponent
   
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
   HttpClientModule,
   

    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
