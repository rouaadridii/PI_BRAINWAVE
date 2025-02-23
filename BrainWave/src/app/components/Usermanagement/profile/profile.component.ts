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
  user: any;

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
  
}
