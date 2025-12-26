import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Order } from '../../../shared/interfaces/order';
import { isPlatformBrowser } from '@angular/common';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class DeleteorderService {

 private readonly deletedKey = 'deletedOrders';
 private readonly COMPLETED_ORDERS_COLLECTION = 'completedOrders';
 private platformid = inject(PLATFORM_ID)

 constructor() {}






 // ===== Get All Completed Orders =====
  async getAllCompletedOrders(): Promise<Order[]> {
    const snap = await getDocs(collection(db, this.COMPLETED_ORDERS_COLLECTION));

    return snap.docs.map(d => {
      const data = d.data() as Partial<Omit<Order, 'id'>>;

      return {
        id: d.id,
        customerName: data.customerName ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        items: data.items ?? [],
        totalPrice: data.totalPrice ?? 0,
        date: data.date ?? '',
        status: data.status ?? 'completed'
      };
    });
  }

  // ===== Add Completed Order =====
  async addCompletedOrder(order: Order) {
    const ref = doc(db, this.COMPLETED_ORDERS_COLLECTION, order.id);

    return setDoc(ref, {
      ...order,
      status: 'completed'
    });
  }

  // ===== Delete Completed Order (نهائي) =====
  deleteCompletedOrder(id: string) {
    return deleteDoc(doc(db, this.COMPLETED_ORDERS_COLLECTION, id));
  }

  // ===== Get Completed Order By Id =====
  async getCompletedOrderById(id: string): Promise<Order | undefined> {
    const ref = doc(db, this.COMPLETED_ORDERS_COLLECTION, id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return undefined;

    const { id: _, ...rest } = snap.data() as Order;

    return {
      id: snap.id,
      ...rest
    };
  }


  // ===== Clear All Completed Orders =====
async clearCompletedOrders() {
  const snap = await getDocs(collection(db, this.COMPLETED_ORDERS_COLLECTION));

  const promises = snap.docs.map(d =>
    deleteDoc(doc(db, this.COMPLETED_ORDERS_COLLECTION, d.id))
  );

  await Promise.all(promises);
}





















    // جلب كل المنتجات
  getAllDeletedOrders(): Order[] {
      if (isPlatformBrowser(this.platformid)) {
        const products = localStorage.getItem(this.deletedKey);
        return products ? JSON.parse(products) : [];
      } else {
        // لو مش في المتصفح (زي وقت الـ build)
        return [];
      }
    }

  // ✅ أضف أوردر ممسوح
  addDeletedOrder(order: Order) {
    const deletedOrders = this.getAllDeletedOrders();
    deletedOrders.push(order);
    localStorage.setItem(this.deletedKey, JSON.stringify(deletedOrders));
  }

  // ✅ احذف أوردر ممسوح نهائيًا
  deleteDeletedOrder(orderId: string) {
    const deletedOrders = this.getAllDeletedOrders().filter(o => o.id !== orderId);
    localStorage.setItem(this.deletedKey, JSON.stringify(deletedOrders));
  }

  // ✅ امسح الكل (لو حبيت)
  clearDeletedOrders() {
    localStorage.removeItem(this.deletedKey);
  }
}
