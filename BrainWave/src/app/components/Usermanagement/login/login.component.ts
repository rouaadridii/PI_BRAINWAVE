import { Component } from '@angular/core';
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
    email : new FormControl('', [Validators.required, Validators.email]),
    password : new FormControl('', [Validators.required]),
    });

    constructor(private userService: UserService, private router: Router) {}

    onLogin() {
      if (this.formLogin.valid) {
        const { email, password } = this.formLogin.value;
    
        if (email && password) {
          this.userService.login(email, password).subscribe(
            (response) => {
              const token = response?.token;
              if (token) {
                localStorage.setItem('jwt', token); // Store the JWT token
    
                // Decode the token
                const decodedToken: any = jwtDecode(token);
                console.log('Decoded Token:', decodedToken); // Debugging
    
                // Extract and store the user's email
                const userEmail = decodedToken?.sub; // 'sub' usually contains the email
                if (userEmail) {
                  localStorage.setItem('userEmail', userEmail);
                  console.log('User Email:', userEmail); // Debugging
                }
    
                this.router.navigate(['/profile']); // Redirect to profile
              } else {
                alert('Invalid response from server');
              }
            },
            (error) => {
              alert('Login failed. Please check your credentials.');
            }
          );
        } else {
          alert('Email and password are required');
        }
      }
    }
    
    
    
    
    
    
}


