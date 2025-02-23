import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const token = localStorage.getItem('jwt'); 

    // Allow access to the login and signup routes even if the user is not authenticated
    if (state.url === '/login' || state.url === '/signup') {
      return true;
    }

    // If the user is not authenticated, block access to all other routes and redirect to login
    if (!token) {
      this.router.navigate(['/login']);  // Redirect to login
      return false;
    }

    // If the user is authenticated, allow access to all routes
    return true;
  }
}
