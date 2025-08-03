import { Injectable, signal } from '@angular/core';
import { Dividend, DividendType } from '../models/investment.model';

@Injectable({
  providedIn: 'root'
})
export class DividendService {
  private readonly STORAGE_KEY = 'dividends';
  private dividendsSignal = signal<Dividend[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  get dividends() {
    return this.dividendsSignal.asReadonly();
  }

  addDividend(dividend: Omit<Dividend, 'id'>): Dividend {
    const newDividend: Dividend = {
      ...dividend,
      id: this.generateId()
    };

    const currentDividends = this.dividendsSignal();
    this.dividendsSignal.set([...currentDividends, newDividend]);
    this.saveToStorage();
    
    return newDividend;
  }

  updateDividend(id: string, updates: Partial<Dividend>): boolean {
    const currentDividends = this.dividendsSignal();
    const index = currentDividends.findIndex(div => div.id === id);
    
    if (index === -1) return false;

    const updatedDividends = [...currentDividends];
    updatedDividends[index] = { ...updatedDividends[index], ...updates };
    
    this.dividendsSignal.set(updatedDividends);
    this.saveToStorage();
    return true;
  }

  deleteDividend(id: string): boolean {
    const currentDividends = this.dividendsSignal();
    const filtered = currentDividends.filter(div => div.id !== id);
    
    if (filtered.length === currentDividends.length) return false;

    this.dividendsSignal.set(filtered);
    this.saveToStorage();
    return true;
  }

  getDividendsByInvestment(investmentId: string): Dividend[] {
    return this.dividendsSignal().filter(div => div.investmentId === investmentId);
  }

  getTotalDividends(): number {
    return this.dividendsSignal().reduce((total, div) => total + div.amount, 0);
  }

  getDividendsByType(type: DividendType): Dividend[] {
    return this.dividendsSignal().filter(div => div.type === type);
  }

  getDividendsByDateRange(startDate: Date, endDate: Date): Dividend[] {
    return this.dividendsSignal().filter(div => {
      const receivedDate = new Date(div.receivedDate);
      return receivedDate >= startDate && receivedDate <= endDate;
    });
  }

  getMonthlyDividends(year?: number): { month: string; amount: number }[] {
    const targetYear = year || new Date().getFullYear();
    const monthlyData: { [key: string]: number } = {};

    this.dividendsSignal()
      .filter(div => new Date(div.receivedDate).getFullYear() === targetYear)
      .forEach(div => {
        const month = new Date(div.receivedDate).toLocaleString('pt-BR', { month: 'long' });
        monthlyData[month] = (monthlyData[month] || 0) + div.amount;
      });

    return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));
  }

  getYearlyDividends(): { year: number; amount: number }[] {
    const yearlyData: { [key: number]: number } = {};

    this.dividendsSignal().forEach(div => {
      const year = new Date(div.receivedDate).getFullYear();
      yearlyData[year] = (yearlyData[year] || 0) + div.amount;
    });

    return Object.entries(yearlyData)
      .map(([year, amount]) => ({ year: Number(year), amount }))
      .sort((a, b) => a.year - b.year);
  }

  getDividendYield(investmentId: string, totalInvested: number): number {
    const investmentDividends = this.getDividendsByInvestment(investmentId);
    const lastYearDividends = investmentDividends
      .filter(div => {
        const dividendDate = new Date(div.receivedDate);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return dividendDate >= oneYearAgo;
      })
      .reduce((total, div) => total + div.amount, 0);

    return totalInvested > 0 ? (lastYearDividends / totalInvested) * 100 : 0;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const dividends = JSON.parse(stored).map((div: any) => ({
          ...div,
          receivedDate: new Date(div.receivedDate),
          exDividendDate: div.exDividendDate ? new Date(div.exDividendDate) : undefined,
          paymentDate: div.paymentDate ? new Date(div.paymentDate) : undefined
        }));
        this.dividendsSignal.set(dividends);
      } catch (error) {
        console.error('Error loading dividends from storage:', error);
      }
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.dividendsSignal()));
    } catch (error) {
      console.error('Error saving dividends to storage:', error);
    }
  }
}