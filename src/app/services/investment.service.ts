import { Injectable, signal } from '@angular/core';
import { Investment, AssetType } from '../models/investment.model';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private readonly STORAGE_KEY = 'investments';
  private investmentsSignal = signal<Investment[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  get investments() {
    return this.investmentsSignal.asReadonly();
  }

  addInvestment(investment: Omit<Investment, 'id'>): Investment {
    const newInvestment: Investment = {
      ...investment,
      id: this.generateId()
    };

    const currentInvestments = this.investmentsSignal();
    this.investmentsSignal.set([...currentInvestments, newInvestment]);
    this.saveToStorage();
    
    return newInvestment;
  }

  updateInvestment(id: string, updates: Partial<Investment>): boolean {
    const currentInvestments = this.investmentsSignal();
    const index = currentInvestments.findIndex(inv => inv.id === id);
    
    if (index === -1) return false;

    const updatedInvestments = [...currentInvestments];
    updatedInvestments[index] = { ...updatedInvestments[index], ...updates };
    
    this.investmentsSignal.set(updatedInvestments);
    this.saveToStorage();
    return true;
  }

  deleteInvestment(id: string): boolean {
    const currentInvestments = this.investmentsSignal();
    const filtered = currentInvestments.filter(inv => inv.id !== id);
    
    if (filtered.length === currentInvestments.length) return false;

    this.investmentsSignal.set(filtered);
    this.saveToStorage();
    return true;
  }

  getInvestmentById(id: string): Investment | undefined {
    return this.investmentsSignal().find(inv => inv.id === id);
  }

  getInvestmentsByType(assetType: AssetType): Investment[] {
    return this.investmentsSignal().filter(inv => inv.assetType === assetType);
  }

  getTotalInvested(): number {
    return this.investmentsSignal().reduce((total, inv) => 
      total + (inv.purchasePrice * inv.quantity), 0
    );
  }

  getCurrentValue(): number {
    return this.investmentsSignal().reduce((total, inv) => 
      total + ((inv.currentPrice || inv.purchasePrice) * inv.quantity), 0
    );
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const investments = JSON.parse(stored).map((inv: any) => ({
          ...inv,
          purchaseDate: new Date(inv.purchaseDate)
        }));
        this.investmentsSignal.set(investments);
      } catch (error) {
        console.error('Error loading investments from storage:', error);
      }
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.investmentsSignal()));
    } catch (error) {
      console.error('Error saving investments to storage:', error);
    }
  }
}