import { Component, inject, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InvestmentService } from '../../services/investment.service';
import { Investment, AssetType } from '../../models/investment.model';

@Component({
  selector: 'app-investment-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './investment-form.component.html',
  styleUrl: './investment-form.component.css'
})
export class InvestmentFormComponent {
  private fb = inject(FormBuilder);
  private investmentService = inject(InvestmentService);

  investment = input<Investment | null>(null);
  onSave = output<Investment>();
  onCancel = output<void>();

  isLoading = signal(false);
  
  assetTypes = Object.values(AssetType);
  
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    ticker: ['', [Validators.required, Validators.minLength(2)]],
    assetType: [AssetType.STOCK, [Validators.required]],
    purchasePrice: [0, [Validators.required, Validators.min(0.01)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    purchaseDate: [new Date().toISOString().split('T')[0], [Validators.required]],
    currentPrice: [0, [Validators.min(0)]],
    sector: [''],
    notes: ['']
  });

  constructor() {
    // Watch for investment input changes to populate form
    if (this.investment()) {
      this.populateForm(this.investment()!);
    }
  }

  private populateForm(investment: Investment): void {
    this.form.patchValue({
      name: investment.name,
      ticker: investment.ticker,
      assetType: investment.assetType,
      purchasePrice: investment.purchasePrice,
      quantity: investment.quantity,
      purchaseDate: investment.purchaseDate.toISOString().split('T')[0],
      currentPrice: investment.currentPrice || 0,
      sector: investment.sector || '',
      notes: investment.notes || ''
    });
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

  onSubmit(): void {
    if (this.form.valid && !this.isLoading()) {
      this.isLoading.set(true);
      
      const formValue = this.form.value;
      const investmentData = {
        name: formValue.name,
        ticker: formValue.ticker.toUpperCase(),
        assetType: formValue.assetType,
        purchasePrice: Number(formValue.purchasePrice),
        quantity: Number(formValue.quantity),
        purchaseDate: new Date(formValue.purchaseDate),
        currentPrice: formValue.currentPrice ? Number(formValue.currentPrice) : undefined,
        sector: formValue.sector || undefined,
        notes: formValue.notes || undefined
      };

      try {
        let savedInvestment: Investment;
        
        if (this.investment()) {
          // Update existing investment
          this.investmentService.updateInvestment(this.investment()!.id, investmentData);
          savedInvestment = { ...this.investment()!, ...investmentData };
        } else {
          // Create new investment
          savedInvestment = this.investmentService.addInvestment(investmentData);
        }

        this.onSave.emit(savedInvestment);
        this.resetForm();
      } catch (error) {
        console.error('Error saving investment:', error);
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancelClick(): void {
    this.resetForm();
    this.onCancel.emit();
  }

  private resetForm(): void {
    this.form.reset({
      assetType: AssetType.STOCK,
      purchaseDate: new Date().toISOString().split('T')[0],
      quantity: 1
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (control?.errors && control?.touched) {
      if (control.errors['required']) return `${this.getFieldLabel(fieldName)} é obrigatório`;
      if (control.errors['minlength']) return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['min']) return `${this.getFieldLabel(fieldName)} deve ser maior que ${control.errors['min'].min}`;
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nome',
      ticker: 'Código',
      assetType: 'Tipo de Ativo',
      purchasePrice: 'Preço de Compra',
      quantity: 'Quantidade',
      purchaseDate: 'Data de Compra',
      currentPrice: 'Preço Atual',
      sector: 'Setor',
      notes: 'Observações'
    };
    return labels[fieldName] || fieldName;
  }
}