import { Component, inject, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpensesService } from '../../../core/services/Expenses/expenses.service';
import { Expense } from '../../../shared/interfaces/Expenses';
import { isPlatformBrowser } from '@angular/common';
import { NotyfService } from '../../../core/services/notyf/notyf.service';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [ReactiveFormsModule ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent {
  filteredExpenses: Expense[] = [];
  private platformid = inject(PLATFORM_ID)
  private notyfService = inject(NotyfService)
   expenseForm: FormGroup = new FormGroup({
      title: new FormControl('', Validators.required),
      amount: new FormControl('', [Validators.required, Validators.min(1)]),
      date: new FormControl('', Validators.required),
      details: new FormControl('')
    });

  constructor(private expensesService: ExpensesService) {}

  ngOnInit(): void {
   if (isPlatformBrowser(this.platformid)) {
     this.filteredExpenses = this.expensesService.getAllExpenses();
   }
   
  }

  onAddExpense(): void {
    if (this.expenseForm.valid) {
      const newExpense: Expense = this.expenseForm.value;
      console.log(this.expenseForm.value);
      newExpense.id = Date.now().toString();
      this.expensesService.addExpense(newExpense);
      this.filteredExpenses = this.expensesService.getAllExpenses();
      this.notyfService.success('Expense added successfully.');
      this.expenseForm.reset();
    }
  }
 // ✅ فلترة حسب الشهر
  filterByMonth(event: any) {
  const month = event.target.value; // مثلاً "2025-11"
  console.log(month);
  
  this.filteredExpenses = this.expensesService.getExpensesByMonth(month);
  }


  deleteExpense(id: string): void {
    this.expensesService.deleteExpense(id);
    this.notyfService.error('Expense deleted successfully.');
    this.filteredExpenses = this.expensesService.getAllExpenses();
  }
}
