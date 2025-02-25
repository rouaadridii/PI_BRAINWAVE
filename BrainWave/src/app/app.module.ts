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
import { AjouterReclamationComponent } from './components/ajouter-reclamation/ajouter-reclamation.component';
import { ListeReclamationsComponent } from './components/liste-reclamation/liste-reclamation.component';
import { AdminReclamationComponent } from './components/admin-reclamation/admin-reclamation.component';
import { ListTeacherComponent } from './components/list-teacher/list-teacher.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DashboardComponent,
    FrontHeaderComponent,
    FrontFooterComponent,
    BackHeaderComponent,
    BackMenuAdminComponent,
    AjouterReclamationComponent,
    ListeReclamationsComponent,
    AdminReclamationComponent,
    ListTeacherComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
