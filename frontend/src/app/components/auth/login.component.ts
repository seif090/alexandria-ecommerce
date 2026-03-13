import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
        <h2 class="text-3xl font-black text-center text-blue-800 mb-8">Welcome Back</h2>
        <form (submit)="onLogin()">
          <div class="mb-5">
            <label class="block text-gray-700 font-bold mb-2">Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" 
                   class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none" required>
          </div>
          <div class="mb-8">
            <label class="block text-gray-700 font-bold mb-2">Password</label>
            <input type="password" [(ngModel)]="password" name="password" 
                   class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none" required>
          </div>
          <button type="submit" 
                  class="w-full bg-blue-700 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-colors shadow-lg">
            Sign In
          </button>
        </form>
        <p class="mt-8 text-center text-gray-500">
          New here? <a href="#" class="text-blue-700 font-bold">Create an account</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => alert('Login failed')
    });
  }
}
