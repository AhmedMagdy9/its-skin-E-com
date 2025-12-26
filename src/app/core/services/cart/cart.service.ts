import { computed, Injectable, signal } from '@angular/core';
import { Product } from '../../../shared/interfaces/product';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../firebase.config';


@Injectable({
  providedIn: 'root'
})
export class CartService {

  
 // ===== Get All Cart Products =====
  async getAllCartProducts(): Promise<Product[]> {
    const snap = await getDocs(collection(db, 'cart'));

    return snap.docs.map(d => {
      const data = d.data() as Partial<Omit<Product, 'id'>>;

      return {
        id: d.id,
        isFavorite: data.isFavorite ?? false,
        Cost: data.Cost ?? 0,
        quantity: data.quantity ?? 1, // cart products quantity
        price: data.price ?? 0,
        addedDate: data.addedDate ?? new Date().toISOString(),
        name: data.name ?? '',
        category: data.category ?? '',
        brand: data.brand ?? '',
        description: data.description ?? '',
        lowStockThreshold: data.lowStockThreshold ?? 0,
        expiryDate: data.expiryDate ?? '',
        imageUrl: data.imageUrl ?? ''
      };
    });
  }

  // ===== Add Product To Cart (Smart) =====
async addToCartfire(product: Product) {
  const cartRef = doc(db, 'cart', product.id);

  const existing = await this.getCartProductById(product.id);
  console.log('existing', existing);

  if (existing) {
    // if product is already in cart
    return this.updateCartProduct(product.id, {
      quantity: existing.quantity + 1
    });
  } else {
    // if product is not in cart add it
    return setDoc(cartRef, {
      ...product,
      quantity: 1
    });
  }
}


  // ===== Update Cart Product =====
  updateCartProduct(id: string, data: Partial<Product>) {
    return updateDoc(doc(db, 'cart', id), data);
  }

  // ===== Remove Product From Cart =====
  removeFromCartfire(id: string) {
    return deleteDoc(doc(db, 'cart', id));
  }

  // ===== Get Cart Product By id =====
async getCartProductById(id: string): Promise<Product | undefined> {
  const docRef = doc(db, 'cart', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return undefined;

  // all data except id
  const { id: _, ...rest } = docSnap.data() as Product;

  return {
    id: docSnap.id, // Document ID is the product id
    ...rest
  };
}

 // ===== Clear Cart =====
  async clearCartfire() {
    const snap = await getDocs(collection(db, 'cart'));
    const promises = snap.docs.map(d => deleteDoc(doc(db, 'cart', d.id)));
    await Promise.all(promises);
  }

}
