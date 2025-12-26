
import { Product } from './../../../shared/interfaces/product';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { addDoc, collection, deleteDoc, doc,  getDoc,  getDocs , query, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from '../../../firebase.config';







@Injectable({
  providedIn: 'root'
})
export class ProductService {

private storageKey = 'products';
products!:Product[]
categories = ["شامبو",  "بلسم",  "ليف ان",  "سيرم شعر","ماسك شعر" ,   "تريتمنت", "سبوت تريتمنت" ,   "غسول",  "غسول زيتي", "مرطب",   "صن سكرين",   "سيرم",  "ايسنس",  "تونر",  "مقشر", "كريم عين", "ماسك وجة" , "شفرات سكرين"];



  async getAllProducts(): Promise<Product[]> {
   const snap = await getDocs(collection(db, 'products'));

   return snap.docs.map(d => {
   const data = d.data() as Partial<Omit<Product, 'id'>>;

   return {
      id: d.id,
      isFavorite: data.isFavorite ?? false,
      Cost: data.Cost ?? 0,
      quantity: data.quantity ?? 0,
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

  addProduct(product: any) {
    return addDoc(collection(db, 'products'), product);
  }

  // return product to stock
  async restoreProductToStock(product: Product) {
   const productRef = doc(db, 'products', product.id);

   const snap = await getDoc(productRef);

   if (snap.exists()) {
   const data = snap.data() as Product;

    // product exists
    return updateDoc(productRef, {
      quantity: data.quantity + product.quantity
    });
  } else {
   //  product doesn't exist return 
    return setDoc(productRef, {
      ...product
    });
  }
  }

  updateProduct(id:string, data: any) {
    return updateDoc(doc(db, 'products', id), data);
  }

  deleteProduct(id: string) {
    return deleteDoc(doc(db, 'products', id));
  }

  async getByCategory(category: string) {
   const q = query(
    collection(db, 'products'),
    where('category', '==', category)
    );

   const snap = await getDocs(q);
   return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  
}
