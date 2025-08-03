import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private routerSubscription?: Subscription;
  private resizeHandler = this.handleResize.bind(this);
  
  isSidebarOpen = signal(this.getInitialSidebarState());
  currentTheme = this.themeService.theme;
  currentUser = this.authService.currentUser;
  showUserMenu = signal(false);
  isLoginPage = signal(false);

  ngOnInit(): void {
    // Close sidebar on route change on mobile screens and check for login page
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Check if current route is login page
        this.isLoginPage.set(event.url === '/login');
        
        if (window.innerWidth < 768) {
          this.closeSidebar();
        }
      });

    // Check initial route
    this.isLoginPage.set(this.router.url === '/login');

    // Listen for window resize to adjust sidebar state
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    window.removeEventListener('resize', this.resizeHandler);
  }

  toggleSidebar(): void {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  onMenuItemClick(): void {
    // Close sidebar on mobile when menu item is clicked
    if (window.innerWidth < 768) {
      this.closeSidebar();
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleUserMenu(): void {
    this.showUserMenu.set(!this.showUserMenu());
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu.set(false);
  }

  private getInitialSidebarState(): boolean {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Open sidebar by default on desktop (md screens and above)
    return window.innerWidth >= 768;
  }

  private handleResize(): void {
    const isLargeScreen = window.innerWidth >= 768;
    
    // Auto-open on desktop, auto-close on mobile
    if (isLargeScreen && !this.isSidebarOpen()) {
      this.isSidebarOpen.set(true);
    } else if (!isLargeScreen && this.isSidebarOpen()) {
      this.isSidebarOpen.set(false);
    }
  }

  menuItems = [
    {
      title: 'Dashboard',
      icon: '📊',
      route: '/dashboard'
    },
    {
      title: 'Investimentos',
      icon: '💼',
      route: '/investments'
    },
    {
      title: 'Proventos',
      icon: '💰',
      route: '/dividends'
    }
  ];
}