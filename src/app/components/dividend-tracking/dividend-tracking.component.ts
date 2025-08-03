import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DividendService } from '../../services/dividend.service';
import { InvestmentService } from '../../services/investment.service';
import { Dividend, DividendType, Investment } from '../../models/investment.model';

@Component({
  selector: 'app-dividend-tracking',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dividend-tracking.component.html',
  styleUrl: './dividend-tracking.component.css'
})
export class DividendTrackingComponent {
  private fb = inject(FormBuilder);
  private dividendService = inject(DividendService);
  private investmentService = inject(InvestmentService);

  showForm = signal(false);
  selectedYear = signal(new Date().getFullYear());
  isLoading = signal(false);

  dividends = this.dividendService.dividends;
  investments = this.investmentService.investments;
  dividendTypes = Object.values(DividendType);

  dividendForm: FormGroup = this.fb.group({
    investmentId: ['', [Validators.required]],
    type: [DividendType.DIVIDEND, [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    receivedDate: [new Date().toISOString().split('T')[0], [Validators.required]],
    exDividendDate: [''],
    paymentDate: ['']
  });

  filteredDividends = computed(() => {
    return this.dividends()
      .filter(div => new Date(div.receivedDate).getFullYear() === this.selectedYear())
      .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime());
  });

  monthlyDividends = computed(() => {
    return this.dividendService.getMonthlyDividends(this.selectedYear());
  });

  yearlyTotal = computed(() => {
    return this.filteredDividends().reduce((total, div) => total + div.amount, 0);
  });

  averageMonthly = computed(() => {
    const total = this.yearlyTotal();
    return total / 12;
  });

  dividendsByType = computed(() => {
    const byType = new Map<DividendType, number>();
    this.filteredDividends().forEach(div => {
      const current = byType.get(div.type) || 0;
      byType.set(div.type, current + div.amount);
    });
    return Array.from(byType.entries()).map(([type, amount]) => ({ type, amount }));
  });

  onShowForm(): void {
    this.showForm.set(true);
    this.resetForm();
  }

  onHideForm(): void {
    this.showForm.set(false);
    this.resetForm();
  }

  onSubmit(): void {
    if (this.dividendForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      const formValue = this.dividendForm.value;
      const dividendData = {
        investmentId: formValue.investmentId,
        type: formValue.type,
        amount: Number(formValue.amount),
        receivedDate: new Date(formValue.receivedDate),
        exDividendDate: formValue.exDividendDate ? new Date(formValue.exDividendDate) : undefined,
        paymentDate: formValue.paymentDate ? new Date(formValue.paymentDate) : undefined
      };

      try {
        this.dividendService.addDividend(dividendData);
        this.onHideForm();
      } catch (error) {
        console.error('Error saving dividend:', error);
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onDelete(dividend: Dividend): void {
    const investment = this.getInvestmentById(dividend.investmentId);
    const investmentName = investment?.name || 'investimento desconhecido';
    
    if (confirm(`Deseja realmente excluir o provento de ${this.formatCurrency(dividend.amount)} do ${investmentName}?`)) {
      this.dividendService.deleteDividend(dividend.id);
    }
  }

  getInvestmentById(id: string): Investment | undefined {
    return this.investments().find(inv => inv.id === id);
  }

  getDividendTypeLabel(type: DividendType): string {
    const labels = {
      [DividendType.DIVIDEND]: 'Dividendo',
      [DividendType.INTEREST_ON_EQUITY]: 'JCP',
      [DividendType.REIT_INCOME]: 'Rendimento FII',
      [DividendType.FIXED_INCOME_COUPON]: 'Cupom Renda Fixa'
    };
    return labels[type];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  private resetForm(): void {
    this.dividendForm.reset({
      type: DividendType.DIVIDEND,
      receivedDate: new Date().toISOString().split('T')[0]
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.dividendForm.controls).forEach(key => {
      const control = this.dividendForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.dividendForm.get(fieldName);
    if (control?.errors && control?.touched) {
      if (control.errors['required']) return `${this.getFieldLabel(fieldName)} é obrigatório`;
      if (control.errors['min']) return `${this.getFieldLabel(fieldName)} deve ser maior que ${control.errors['min'].min}`;
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      investmentId: 'Investimento',
      type: 'Tipo de Provento',
      amount: 'Valor',
      receivedDate: 'Data de Recebimento',
      exDividendDate: 'Data Ex-Dividendo',
      paymentDate: 'Data de Pagamento'
    };
    return labels[fieldName] || fieldName;
  }

  getAvailableYears(): number[] {
    const years = new Set<number>();
    this.dividends().forEach(div => {
      years.add(new Date(div.receivedDate).getFullYear());
    });
    
    // Add current year if no dividends exist
    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }
    
    return Array.from(years).sort((a, b) => b - a);
  }

  onYearChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedYear.set(+target.value);
  }
}