// src/app/core/models/product.model.ts
export interface Product {
  id: string;                  // Firestore document ID
  isFavorite: boolean;          // هل المنتج مفضل
  Cost: number;                 // سعر الشراء
  quantity: number;             // الكمية المتاحة
  price: number;                // سعر البيع
  addedDate: string;            // تاريخ الإضافة (ISO string)
  name: string;                 // اسم المنتج
  category: string;             // التصنيف
  brand: string;                // الماركة
  description: string;          // تفاصيل إضافية
  lowStockThreshold: number;    // الحد الأدنى للتنبيه عند نفاد الكمية
  expiryDate: string;           // تاريخ الصلاحية (ISO string)
  imageUrl: string;             // رابط صورة المنتج
}
