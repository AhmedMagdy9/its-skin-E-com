import { Injectable } from '@angular/core';
import { Expense } from '../../../shared/interfaces/Expenses';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

   private storageKey = 'expenses';

  getAllExpenses(): Expense[] {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  addExpense(expense: Expense): void {
    const expenses = this.getAllExpenses();
    expenses.push(expense);
    localStorage.setItem(this.storageKey, JSON.stringify(expenses));
  }

getExpensesByMonth(month: string): Expense[] {
  return this.getAllExpenses().filter(e => e.date.startsWith(month));
}



  deleteExpense(id: string): void {
    const expenses = this.getAllExpenses().filter(e => e.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(expenses));
  }
}
