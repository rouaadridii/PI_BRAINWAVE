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
import { LoginComponent } from './components/Usermanagement/login/login.component';
import { SignupComponent } from './components/Usermanagement/signup/signup.component';
import { ProfileComponent } from './components/Usermanagement/profile/profile.component';
import { FrontHeaderAuthentificatedComponent } from './components/front-header-authentificated/front-header-authentificated.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DashboardComponent,
    FrontHeaderComponent,
    FrontFooterComponent,
    BackHeaderComponent,
    BackMenuAdminComponent,
    LoginComponent,
    SignupComponent,
    ProfileComponent,
    FrontHeaderAuthentificatedComponent,
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
