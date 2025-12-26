import { Injectable } from '@angular/core';
import { Expense } from '../../../shared/interfaces/Expenses';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

   private storageKey = 'expenses';





  // ===== Get All Expenses =====
  async getAllExpensesfire(): Promise<Expense[]> {
    const snap = await getDocs(collection(db, 'Expenses'));

    return snap.docs.map(d => {
      const data = d.data() as Partial<Omit<Expense, 'id'>>;

      return {
        id: d.id,
        title: data.title ?? '',
        amount: data.amount ?? 0,
        date: data.date ?? new Date().toISOString(),
        details: data.details ?? ''
      };
    });
  }

  // ===== Add Expense (Smart) =====
async addExpensefire(expense: Expense) {
  // check if expense already exists
  const existing = await this.getExpenseByTitle(expense.title);

  if (existing) {
    return this.updateExpense(existing.id, {
      amount: existing.amount + expense.amount
    });
  } else {
    return addDoc(collection(db, 'Expenses'), expense);
  }
}

  // ===== Update Expense =====
  updateExpense(id: string, data: Partial<Expense>) {
    return updateDoc(doc(db, 'Expenses', id), data);
  }

  // ===== Remove Expense =====
  removeExpense(id: string) {
    return deleteDoc(doc(db, 'Expenses', id));
  }

  // ===== Get Expense By Id =====
async getExpenseByTitle(title: string): Promise<Expense | undefined> {
  const q = query(
    collection(db, 'Expenses'),
   where('title', '==', title)
  );

  const snap = await getDocs(q);

  if (snap.empty) return undefined;

  const docSnap = snap.docs[0];

  const { id: _, ...rest } = docSnap.data() as Expense;

  return {
    id: docSnap.id,
    ...rest
  };
}

  // ===== Clear All Expenses =====
  async clearExpenses() {
    const snap = await getDocs(collection(db, 'Expenses'));
    const promises = snap.docs.map(d =>
      deleteDoc(doc(db, 'Expenses', d.id))
    );
    await Promise.all(promises);
  }






}
