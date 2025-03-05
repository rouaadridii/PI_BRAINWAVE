import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import FormBuilder
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  resetPasswordSuccess = false;
  resetPasswordError = '';
  token: string = '';
  isLoading = false;
  tokenIsValid = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder // Inject FormBuilder
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
        this.token = params['token'];
        console.log("Token from route params: ", this.token);
        this.verifyToken();
    });
}

  verifyToken(){
    this.userService.verifyToken(this.token).subscribe({
      next: (response)=>{
        this.tokenIsValid = true;
      },
      error: (error)=>{
        this.resetPasswordError = 'Invalid or expired token.';
        this.tokenIsValid = false;
      }
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  submitResetPassword() {
    this.resetPasswordError = '';
    this.isLoading = true;
    this.userService.resetPassword(this.token, this.resetPasswordForm.value.password).subscribe(
      (response) => {
        this.resetPasswordSuccess = true;
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      (error) => {
        this.resetPasswordError =
          'Error resetting password. Please check your link or try again.';
        console.error(error);
        this.isLoading = false;
      }
    );
}
}