import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private routerSubscription?: Subscription;
  
  isSidebarOpen = signal(false);

  ngOnInit(): void {
    // Close sidebar on route change on mobile screens
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (window.innerWidth < 1024) {
          this.closeSidebar();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  toggleSidebar(): void {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  onMenuItemClick(): void {
    // Close sidebar on mobile when menu item is clicked
    if (window.innerWidth < 1024) {
      this.closeSidebar();
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
      title: 'Adicionar Investimento',
      icon: '➕',
      route: '/investments/new'
    },
    {
      title: 'Proventos',
      icon: '💰',
      route: '/dividends'
    }
  ];
}