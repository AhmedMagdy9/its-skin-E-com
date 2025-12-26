import { Injectable } from '@angular/core';
import { Order } from '../../shared/interfaces/order';
import {  collection, deleteDoc, doc,  getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

 private ordersKey = 'allOrders';













// ===== Get All Orders =====
  async getAllOrdersfire(): Promise<Order[]> {
    const snap = await getDocs(collection(db, 'orders'));

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
        status: data.status ?? 'pending'
      };
    });
  }

  // ===== Add Order =====
  async addOrderfire(order: Order) {
    console.log('order in addOrder' ,order)
    const orderRef = doc(db, 'orders', order.id);

    return setDoc(orderRef, {
      ...order
    });
  }

  // ===== Update Order =====
  updateOrderfire(id: string, data: Partial<Order>) {
    return updateDoc(doc(db, 'orders', id), data);
  }

  // ===== Delete Order =====
  deleteOrderfire(id: string) {
    return deleteDoc(doc(db, 'orders', id));
  }

  // ===== Get Order By Id =====
  async getOrderById(id: string): Promise<Order | undefined> {
    const docRef = doc(db, 'orders', id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return undefined;

    const { id: _, ...rest } = snap.data() as Order;

    return {
      id: snap.id,
      ...rest
    };
  }



















 //==============================================================
  // ✅ رجّع كل الطلبات
  getAllOrders(): Order[] {
    return JSON.parse(localStorage.getItem(this.ordersKey) || '[]');
  }

  // ✅ أضف طلب جديد
  addOrder(order: Order) {
    const orders = this.getAllOrders();
    orders.push(order);
    localStorage.setItem(this.ordersKey, JSON.stringify(orders));
  }

  // ✅ امسح طلب
  deleteOrder(id: string) {
    const updated = this.getAllOrders().filter(o => o.id !== id);
    localStorage.setItem(this.ordersKey, JSON.stringify(updated));
  }

  // ✅ حدّث طلب (لو هتضيف الحالة مثلاً)
  updateOrder(updatedOrder: Order) {
    const orders = this.getAllOrders().map(o => o.id === updatedOrder.id ? updatedOrder : o);
    localStorage.setItem(this.ordersKey, JSON.stringify(orders));
  }

  // ✅ تحديث الحالة فقط (لو حبيت تستخدمها في المستقبل)
  updateOrderStatus(orderId: string, newStatus: 'pending' | 'completed') {
    const orders = this.getAllOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = newStatus;
      localStorage.setItem(this.ordersKey, JSON.stringify(orders));
    }
  }
}
