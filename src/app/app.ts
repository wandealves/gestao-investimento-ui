import { Component, signal, inject } from '@angular/core';
import { LayoutComponent } from './components/layout/layout.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private themeService = inject(ThemeService);
  protected readonly title = signal('gestao-investimento-ui');
}
