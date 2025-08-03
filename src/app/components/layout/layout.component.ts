import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  isSidebarOpen = signal(false);

  toggleSidebar(): void {
    this.isSidebarOpen.set(!this.isSidebarOpen());
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
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