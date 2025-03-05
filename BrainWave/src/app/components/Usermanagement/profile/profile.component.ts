import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  userEmail: string | null = null;
  userProfile: any = null;
  profileImageUrl: string | ArrayBuffer | null = '';
  user: any;
  isModalOpen = false;  // To control modal visibility
  isPasswordModalOpen = false;
  isConfirmationModalOpen = false; // To control confirmation modal visibility
  errorMessage: string | null = null;
  constructor(private userService: UserService) {}
  


  userupdate = { 
    name: '', 
    surname: '', 
    phoneNumber: '', 
    address: '' 
  };

  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  ngOnInit(): void {
    this.userService.getUserInfo().subscribe(
      (data) => {
        this.user = data;  // Store user data
      },
      (error) => {
        console.error('Error fetching user data:', error);
      }
    );
  }

  openModal() {
    this.isModalOpen = true;
  }

  // Close the modal when the close button is clicked
  closeModal() {
    this.isModalOpen = false;
  }

  openPasswordModal() {
    this.isPasswordModalOpen = true;
  }

  closePasswordModal() {
    this.isPasswordModalOpen = false;
  }

  showConfirmationModal() {
    // Ensure the passwords match before asking for confirmation
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'New password and confirmation do not match!';
      return;
    }

    const passwordUpdateRequest = {
      oldPassword: this.passwordData.oldPassword,
      newPassword: this.passwordData.newPassword
    };

    this.userService.updateUserProfile(passwordUpdateRequest).subscribe(
      (response) => {
        console.log('Password verified successfully:', response);
        this.isPasswordModalOpen = false;
        this.isConfirmationModalOpen = true;
        this.errorMessage = null; // Clear error message if password is correct
      },(error) => {
        console.error('Error validating password:', error);
        if (error.error && error.error === 'Old password is incorrect!') {
          this.errorMessage = 'The old password is incorrect. Please try again.';
        } else {
          this.errorMessage = 'The old password is incorrect. Please try again.';
        }
      }
    );
  }

  closeConfirmationModal() {
    this.isConfirmationModalOpen = false;
  }

  updateProfile() {
    this.userService.updateUserProfile(this.user).subscribe(
      (response) => {
        console.log('Profile updated successfully:', response);
        this.closeModal(); // Close the modal after successful update
      },
      (error) => {
        console.error('Error updating profile:', error);
      }
    );
  }

  // Handle the actual password update after confirmation
  submitPasswordUpdate() {
    const passwordUpdateRequest = {
      oldPassword: this.passwordData.oldPassword,
      newPassword: this.passwordData.newPassword
    };

    // Call the service to update the password
    this.userService.updateUserProfile(passwordUpdateRequest).subscribe(
      (response) => {
        console.log('Password updated successfully:', response);
        this.closePasswordModal(); // Close the password modal after successful update
        this.closeConfirmationModal(); // Close the confirmation modal
        this.errorMessage = null; // Clear any previous error messages
        this.userService.logout();
      },
      (error) => {
        console.error('Error updating password:', error);
        this.errorMessage = 'Failed to update password. Please try again.';
      }
    );
  }

  
  
  
}
