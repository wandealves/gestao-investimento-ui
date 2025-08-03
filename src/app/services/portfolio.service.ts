import { Injectable, computed, inject } from '@angular/core';
import { InvestmentService } from './investment.service';
import { DividendService } from './dividend.service';
import { Portfolio, PortfolioSummary, AssetAllocation, AssetType } from '../models/investment.model';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private investmentService = inject(InvestmentService);
  private dividendService = inject(DividendService);

  portfolio = computed<Portfolio>(() => {
    const investments = this.investmentService.investments();
    const dividends = this.dividendService.dividends();
    
    const totalInvested = investments.reduce((total, inv) => 
      total + (inv.purchasePrice * inv.quantity), 0
    );
    
    const currentValue = investments.reduce((total, inv) => 
      total + ((inv.currentPrice || inv.purchasePrice) * inv.quantity), 0
    );
    
    const totalReturn = currentValue - totalInvested;
    const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const totalDividends = dividends.reduce((total, div) => total + div.amount, 0);

    return {
      investments,
      dividends,
      totalInvested,
      currentValue,
      totalReturn,
      totalReturnPercentage,
      totalDividends
    };
  });

  portfolioSummary = computed<PortfolioSummary>(() => {
    const portfolio = this.portfolio();
    const investments = portfolio.investments;
    
    const totalInvested = portfolio.totalInvested;
    const currentValue = portfolio.currentValue;
    const unrealizedGain = currentValue - totalInvested;
    const unrealizedGainPercentage = totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0;
    
    // Calculate dividend yield based on last 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const lastYearDividends = portfolio.dividends
      .filter(div => new Date(div.receivedDate) >= oneYearAgo)
      .reduce((total, div) => total + div.amount, 0);
    
    const dividendYield = currentValue > 0 ? (lastYearDividends / currentValue) * 100 : 0;
    
    // Calculate monthly dividends average
    const monthlyDividends = lastYearDividends / 12;
    
    // Calculate asset allocation
    const assetAllocation = this.calculateAssetAllocation(investments, currentValue);

    return {
      totalInvested,
      currentValue,
      unrealizedGain,
      unrealizedGainPercentage,
      dividendYield,
      monthlyDividends,
      assetAllocation
    };
  });

  private calculateAssetAllocation(investments: any[], totalValue: number): AssetAllocation[] {
    const allocation = new Map<AssetType, { value: number; count: number }>();

    investments.forEach(inv => {
      const value = (inv.currentPrice || inv.purchasePrice) * inv.quantity;
      const existing = allocation.get(inv.assetType) || { value: 0, count: 0 };
      allocation.set(inv.assetType, {
        value: existing.value + value,
        count: existing.count + 1
      });
    });

    return Array.from(allocation.entries()).map(([assetType, data]) => ({
      assetType,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      count: data.count
    }));
  }

  getAssetTypeLabel(assetType: AssetType): string {
    const labels = {
      [AssetType.STOCK]: 'Ações',
      [AssetType.REIT]: 'Fundos Imobiliários',
      [AssetType.FIXED_INCOME]: 'Renda Fixa',
      [AssetType.CRYPTO]: 'Criptomoedas',
      [AssetType.FUND]: 'Fundos'
    };
    return labels[assetType];
  }

  getTopPerformers(limit: number = 5) {
    return computed(() => {
      const investments = this.investmentService.investments();
      return investments
        .map(inv => {
          const currentPrice = inv.currentPrice || inv.purchasePrice;
          const gainLoss = (currentPrice - inv.purchasePrice) * inv.quantity;
          const gainLossPercentage = (currentPrice - inv.purchasePrice) / inv.purchasePrice * 100;
          
          return {
            ...inv,
            gainLoss,
            gainLossPercentage,
            currentValue: currentPrice * inv.quantity
          };
        })
        .sort((a, b) => b.gainLossPercentage - a.gainLossPercentage)
        .slice(0, limit);
    });
  }

  getWorstPerformers(limit: number = 5) {
    return computed(() => {
      const investments = this.investmentService.investments();
      return investments
        .map(inv => {
          const currentPrice = inv.currentPrice || inv.purchasePrice;
          const gainLoss = (currentPrice - inv.purchasePrice) * inv.quantity;
          const gainLossPercentage = (currentPrice - inv.purchasePrice) / inv.purchasePrice * 100;
          
          return {
            ...inv,
            gainLoss,
            gainLossPercentage,
            currentValue: currentPrice * inv.quantity
          };
        })
        .sort((a, b) => a.gainLossPercentage - b.gainLossPercentage)
        .slice(0, limit);
    });
  }

  getInvestmentsByValue() {
    return computed(() => {
      const investments = this.investmentService.investments();
      return investments
        .map(inv => {
          const currentPrice = inv.currentPrice || inv.purchasePrice;
          return {
            ...inv,
            currentValue: currentPrice * inv.quantity
          };
        })
        .sort((a, b) => b.currentValue - a.currentValue);
    });
  }
}