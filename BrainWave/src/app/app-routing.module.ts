import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FrontHeaderComponent } from './components/front-header/front-header.component';
import { FrontFooterComponent } from './components/front-footer/front-footer.component';
import { LoginComponent } from './components/Usermanagement/login/login.component';
import { SignupComponent } from './components/Usermanagement/signup/signup.component';
import { ProfileComponent } from './components/Usermanagement/profile/profile.component';
import { AuthGuard } from './auth.guard';
import { UsersListComponent } from './components/Usermanagement/users-list/users-list.component';
import { ResetPasswordComponent } from './components/Usermanagement/reset-password/reset-password.component';

const routes: Routes = [

  {path:'home',component:HomeComponent},
  {path:'dashboard',component:DashboardComponent, canActivate: [AuthGuard]},
  {path:'front_header',component:FrontHeaderComponent},
  {path:'front_footer',component:FrontFooterComponent},
  {path:'login',component:LoginComponent},
  {path:'signup',component:SignupComponent},
  {path:'profile',component:ProfileComponent, canActivate: [AuthGuard]},
  {path:'listeusers',component:UsersListComponent, canActivate: [AuthGuard]},
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }