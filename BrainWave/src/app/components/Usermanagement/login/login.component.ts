import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  formLogin = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  

  showPendingNotification: boolean = false;
  showBannedNotification: boolean = false;
  recaptchaToken: string = '';

  isForgotPassword=false;
  forgotPasswordError: string = '';
  forgotPasswordSuccess: boolean = false;
  isLoading: boolean = false;
  forgotPasswordForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
});

  constructor(private userService: UserService, private router: Router) {}

  resolved(captchaResponse: string) {
    this.recaptchaToken = captchaResponse;
  }

  onLogin() {
    if (this.formLogin.valid && this.recaptchaToken) {
      const { email, password } = this.formLogin.value;

      if (email && password) {
        this.userService.login(email, password, this.recaptchaToken).subscribe(
          (response) => {
            const token = response?.token;
            if (token) {
              localStorage.setItem('jwt', token);

              const decodedToken: any = jwtDecode(token);
              const userEmail = decodedToken?.sub;
              const userRoles: string[] = decodedToken?.roles || [];

              if (userEmail) {
                localStorage.setItem('userEmail', userEmail);
              }

              // Fetch User Details to Check Status
              this.userService.getUserInfo().subscribe( // Assumes a getUserInfo api that returns the full user.
                (userDetails: any) => {
                  if (userDetails.status === 'PENDING') {
                    alert('Your account is still pending approval from the admin.');
                    localStorage.removeItem('jwt'); // Remove token
                    localStorage.removeItem('userEmail'); // Remove email
                    this.router.navigate(['/login']); // Go back to login
                  } else if (userDetails.banned) { // Check if banned is true
                    alert('Your account has been banned.');
                    localStorage.removeItem('jwt'); // Remove token
                    localStorage.removeItem('userEmail'); // Remove email
                    this.router.navigate(['/login']); // Go back to login
                  }
                  else {
                    if (userRoles.includes('ROLE_ADMIN')) {
                      this.router.navigate(['/dashboard']);
                    } else {
                      this.router.navigate(['/profile']);
                    }
                  }
                },
                (userDetailsError) => {
                  console.error('Error fetching user details:', userDetailsError);
                  alert('Login failed. Please try again.');
                  localStorage.removeItem('jwt'); // Remove token
                  localStorage.removeItem('userEmail'); // Remove email
                  this.router.navigate(['/login']);
                }
              );
            } else {
              alert('Invalid response from server');
            }
          },
          (error) => {
            console.error(error);
            if (error.status === 403 && error.error === "Your account is pending approval by the admin.") {
              this.showPendingNotification = true;
            }else if (error.status===403 && error.error ==="Your account has been banned. Please contact support."){
              this.showBannedNotification =true;
            } 
            else {
              alert('Login failed. Please check your credentials.');
            }
          }
        );
      } else {
        alert('Email and password are required');
      }
    }
  }
  closeNotification() {
    this.showPendingNotification = false; // Hide modal
    this.showBannedNotification =false;
  }

  showForgotPasswordForm() {
    this.isForgotPassword = true;
  }

  submitForgotPassword() {
    this.forgotPasswordError = '';
    this.isLoading = true;
    const email = this.forgotPasswordForm.value.email ?? ''; // Fallback to empty string if email is null or undefined
  
    this.userService.sendForgotPasswordEmail(email).subscribe(
      (response) => {
        this.forgotPasswordSuccess = true;
        this.isLoading = false;
      },
      (error) => {
        this.forgotPasswordError = 'Failed to send reset email. Please try again.';
        console.error(error);
        this.isLoading = false;
      }
    );
  }
  

}
