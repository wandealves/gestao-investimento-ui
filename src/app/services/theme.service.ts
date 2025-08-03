import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'investment-app-theme';
  
  theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // Apply theme changes to the document
    effect(() => {
      this.applyTheme(this.theme());
    });
  }

  toggleTheme(): void {
    const newTheme = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(newTheme);
    localStorage.setItem(this.THEME_KEY, newTheme);
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  private getInitialTheme(): Theme {
    // Check localStorage first
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }

    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return 'light';
  }

  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // For DaisyUI, we primarily use data-theme
      root.setAttribute('data-theme', theme);
      
      // Also add/remove dark class for TailwindCSS dark mode
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }
}