import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpensesService } from '../../../core/services/Expenses/expenses.service';
import { Expense } from '../../../shared/interfaces/Expenses';
import { isPlatformBrowser } from '@angular/common';
import { NotyfService } from '../../../core/services/notyf/notyf.service';
import { TableAction, TableComponent } from '../../../shared/reusable-com/table/table.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [ReactiveFormsModule, TableComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent {


  ExpensesColumns = [
  { label: 'Name', key: 'title' },
  { label: 'amount', key: 'amount' },
  { label: 'Date', key: 'date' },
  { label: 'Details', key: 'details' }
  ];

  tableActions: TableAction[] = [
    { name: '🚮',  callback: (row) => this.deleteExpense(row.id) }
  ];

  filteredExpenses:WritableSignal<Expense[]> = signal<Expense[]>([]);
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
     this.loadExpenses();
   }
   
  }

async loadExpenses() {
  const data = await this.expensesService.getAllExpensesfire();
  this.filteredExpenses.set(data);
}


  onAddExpense(){
    if (this.expenseForm.valid) {
      const newExpense: Expense = this.expenseForm.value;
      console.log(this.expenseForm.value);
      // newExpense.id = Date.now().toString();
      this.expensesService.addExpensefire(newExpense);
      this.loadExpenses
      this.notyfService.success('Expense added successfully.');
      this.expenseForm.reset();
    }
  }

//  filter by month
  filterByMonth(event: any) {
   const month = event.target.value; // مثلاً "2025-11"
   if(!month) return
   this.filteredExpenses.set(this.filteredExpenses().filter(expense => expense.date.startsWith(month)));
  
  }


  deleteExpense(id: string): void {
    this.expensesService.removeExpense(id);
    this.notyfService.error('Expense deleted successfully.');
    this.loadExpenses
  }
}
