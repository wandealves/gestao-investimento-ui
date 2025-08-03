import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginCredentials, AuthState } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'investment-app-auth';
  private readonly TOKEN_KEY = 'investment-app-token';
  
  // Mock users for demo purposes
  private readonly MOCK_USERS = [
    {
      id: '1',
      email: 'admin@investpro.com',
      password: 'admin123',
      name: 'Administrador',
      avatar: 'https://via.placeholder.com/40/3b82f6/ffffff?text=A'
    },
    {
      id: '2', 
      email: 'user@investpro.com',
      password: 'user123',
      name: 'Usuário Demo',
      avatar: 'https://via.placeholder.com/40/10b981/ffffff?text=U'
    }
  ];

  private authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  // Public computed signals
  isAuthenticated = computed(() => this.authState().isAuthenticated);
  currentUser = computed(() => this.authState().user);
  
  constructor(private router: Router) {
    this.loadAuthState();
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email
      const mockUser = this.MOCK_USERS.find(u => u.email === credentials.email);
      
      if (!mockUser || mockUser.password !== credentials.password) {
        return { success: false, error: 'Email ou senha inválidos' };
      }
      
      // Create user object without password
      const user: User = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        avatar: mockUser.avatar,
        createdAt: new Date()
      };
      
      // Generate mock token
      const token = this.generateMockToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours
      
      // Update auth state
      this.authState.set({
        isAuthenticated: true,
        user,
        token
      });
      
      // Save to localStorage
      this.saveAuthState(user, token);
      
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  logout(): void {
    this.authState.set({
      isAuthenticated: false,
      user: null,
      token: null
    });
    
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    
    this.router.navigate(['/login']);
  }

  private generateMockToken(): string {
    return 'mock-jwt-token-' + Math.random().toString(36).substr(2, 9);
  }

  private saveAuthState(user: User, token: string): void {
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private loadAuthState(): void {
    try {
      const savedUser = localStorage.getItem(this.AUTH_KEY);
      const savedToken = localStorage.getItem(this.TOKEN_KEY);
      
      if (savedUser && savedToken) {
        const user: User = JSON.parse(savedUser);
        this.authState.set({
          isAuthenticated: true,
          user,
          token: savedToken
        });
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      this.logout();
    }
  }

  // Method to get demo credentials for easier testing
  getDemoCredentials(): { admin: LoginCredentials; user: LoginCredentials } {
    return {
      admin: { email: 'admin@investpro.com', password: 'admin123' },
      user: { email: 'user@investpro.com', password: 'user123' }
    };
  }
}