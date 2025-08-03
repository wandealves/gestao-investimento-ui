import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';
import { AssetType } from '../../models/investment.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private portfolioService = inject(PortfolioService);

  portfolioSummary = this.portfolioService.portfolioSummary;
  portfolio = this.portfolioService.portfolio;
  topPerformers = this.portfolioService.getTopPerformers(3);
  worstPerformers = this.portfolioService.getWorstPerformers(3);

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  getAssetTypeLabel(assetType: AssetType): string {
    return this.portfolioService.getAssetTypeLabel(assetType);
  }

  getPerformanceClass(percentage: number): string {
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-slate-800';
  }

  getColorForIndex(index: number): string {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // emerald
      '#8b5cf6', // violet
      '#f59e0b', // amber
      '#ef4444', // red
      '#06b6d4', // cyan
      '#84cc16', // lime
      '#f97316'  // orange
    ];
    return colors[index % colors.length];
  }
}