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

  constructor(private userService: UserService) {}
  
  ngOnInit() {
    const email = localStorage.getItem('userEmail');
    if (email) {
      this.userEmail = email.split('@')[0]; // Extract the part before "@"
    }
    this.userService.getUserProfile().subscribe(
      (data) => {
        this.userProfile = data;
        if (data.profileImage) {
          // If there's a profile image URL, create an image URL for frontend
          this.profileImageUrl = data.profileImage;
        }
      },
      (error) => {
        console.error('Error fetching user profile:', error);
      }
    );
  }
}
