import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-front-header-authentificated',
  templateUrl: './front-header-authentificated.component.html',
  styleUrls: ['./front-header-authentificated.component.scss']
})
export class FrontHeaderAuthentificatedComponent {
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

    logout() {
      this.userService.logout();
    }
}
