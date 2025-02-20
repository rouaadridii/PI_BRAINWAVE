import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  isToggled = false;

  toggle() {
    this.isToggled = !this.isToggled;
  }

  formSignUp = new FormGroup({
    cin : new FormControl('', [Validators.required, Validators.pattern('^[0-9]{8}$')]),
    name : new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]),
    surname : new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]),
    birthdt : new FormControl('', [Validators.required, this.birthDateValidator]),
    picture : new FormControl('', [Validators.required, Validators.pattern('\\.(jpg|png)$')]),
    tel : new FormControl('', [Validators.required, Validators.pattern('^[0-9]{8}$')]),
    address : new FormControl('', Validators.required),
    diploma : new FormControl('', [Validators.required, this.fileValidator(['pdf'])]),
    cv : new FormControl('', [Validators.required, this.fileValidator(['pdf'])]),
    level : new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]+$')]),
    email : new FormControl('', [Validators.required, Validators.email]),
    pwd : new FormControl('', [Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+={}|:<>?]).{8,}$')]),
    confirmpwd: new FormControl('', Validators.required)
    });
    
  // Custom Validator: Birthdate Validator
  birthDateValidator(control: AbstractControl): ValidationErrors | null {
    const birthDate = new Date(control.value);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const month = new Date().getMonth() - birthDate.getMonth();
  
    // If age is greater than 85, return error
    if (age > 85 || (age === 85 && month > 0)) {
      return { invalidAge: true };
    }
    return null;
  }

  // Custom Validator: File Validator
  fileValidator(allowedExtensions: string[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value;
      if (file) {
        const extension = file.split('.').pop()?.toLowerCase();
        if (!allowedExtensions.includes(extension)) {
          return { invalidFileType: true };
        }
      }
      return null;
    };
  }

}
