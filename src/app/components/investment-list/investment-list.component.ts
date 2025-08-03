import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvestmentService } from '../../services/investment.service';
import { PortfolioService } from '../../services/portfolio.service';
import { InvestmentFormComponent } from '../investment-form/investment-form.component';
import { Investment, AssetType } from '../../models/investment.model';

@Component({
  selector: 'app-investment-list',
  imports: [CommonModule, FormsModule, InvestmentFormComponent],
  templateUrl: './investment-list.component.html',
  styleUrl: './investment-list.component.css'
})
export class InvestmentListComponent {
  private investmentService = inject(InvestmentService);
  private portfolioService = inject(PortfolioService);
  private router = inject(Router);

  searchTerm = signal('');
  selectedAssetType = signal<AssetType | 'ALL'>('ALL');
  sortBy = signal<'name' | 'ticker' | 'value' | 'performance'>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  investments = this.investmentService.investments;
  assetTypes = Object.values(AssetType);

  filteredAndSortedInvestments = computed(() => {
    let filtered = this.investments();

    // Filter by search term
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(inv => 
        inv.name.toLowerCase().includes(term) || 
        inv.ticker.toLowerCase().includes(term) ||
        (inv.sector && inv.sector.toLowerCase().includes(term))
      );
    }

    // Filter by asset type
    if (this.selectedAssetType() !== 'ALL') {
      filtered = filtered.filter(inv => inv.assetType === this.selectedAssetType());
    }

    // Sort investments
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy()) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'ticker':
          comparison = a.ticker.localeCompare(b.ticker);
          break;
        case 'value':
          const aValue = (a.currentPrice || a.purchasePrice) * a.quantity;
          const bValue = (b.currentPrice || b.purchasePrice) * b.quantity;
          comparison = aValue - bValue;
          break;
        case 'performance':
          const aPerf = a.currentPrice ? ((a.currentPrice - a.purchasePrice) / a.purchasePrice) * 100 : 0;
          const bPerf = b.currentPrice ? ((b.currentPrice - b.purchasePrice) / b.purchasePrice) * 100 : 0;
          comparison = aPerf - bPerf;
          break;
      }

      return this.sortDirection() === 'asc' ? comparison : -comparison;
    });
  });

  onSort(field: 'name' | 'ticker' | 'value' | 'performance'): void {
    if (this.sortBy() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortDirection.set('asc');
    }
  }

  onDelete(investment: Investment): void {
    if (confirm(`Deseja realmente excluir o investimento "${investment.name}"?`)) {
      this.investmentService.deleteInvestment(investment.id);
    }
  }

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

  getCurrentValue(investment: Investment): number {
    return (investment.currentPrice || investment.purchasePrice) * investment.quantity;
  }

  getTotalInvested(investment: Investment): number {
    return investment.purchasePrice * investment.quantity;
  }

  getPerformance(investment: Investment): number {
    if (!investment.currentPrice) return 0;
    return ((investment.currentPrice - investment.purchasePrice) / investment.purchasePrice) * 100;
  }

  getGainLoss(investment: Investment): number {
    const currentValue = this.getCurrentValue(investment);
    const totalInvested = this.getTotalInvested(investment);
    return currentValue - totalInvested;
  }

  getSortIcon(field: string): string {
    if (this.sortBy() !== field) return '';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  getTotalInvestedAmount(): number {
    return this.filteredAndSortedInvestments().reduce((total, inv) => total + this.getTotalInvested(inv), 0);
  }

  getTotalCurrentValue(): number {
    return this.filteredAndSortedInvestments().reduce((total, inv) => total + this.getCurrentValue(inv), 0);
  }

  getTotalGainLoss(): number {
    return this.filteredAndSortedInvestments().reduce((total, inv) => total + this.getGainLoss(inv), 0);
  }

  showForm = signal(false);

  onAddInvestment(): void {
    this.showForm.set(true);
  }

  onFormSave(): void {
    this.showForm.set(false);
  }

  onFormCancel(): void {
    this.showForm.set(false);
  }
}