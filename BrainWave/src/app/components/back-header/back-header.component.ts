import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-back-header',
  templateUrl: './back-header.component.html',
  styleUrls: ['./back-header.component.scss']
})
export class BackHeaderComponent {

  constructor(private userService: UserService) {}

  
  logout() {
    this.userService.logout();
  }
}
