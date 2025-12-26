// import { FirestoreDataConverter, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
// import { Product } from "../../../shared/interfaces/product";


// export const productConverter: FirestoreDataConverter<Product> = {
//   toFirestore(product: Product): DocumentData {
//     const { id, ...rest } = product; 
//     return { ...rest }; // ID هيتعامل معاه Firestore لوحده
//   },
//   fromFirestore(snapshot: QueryDocumentSnapshot): Product {
//     const data = snapshot.data();
//     return {
//       id: snapshot.id,
//       isFavorite: data.isFavorite ?? false,
//       Cost: data.Cost ?? 0,
//       quantity: data.quantity ?? 0,
//       price: data.price ?? 0,
//       addedDate: data.addedDate ?? new Date().toISOString(),
//       name: data.name ?? '',
//       category: data.category ?? '',
//       brand: data.brand ?? '',
//       description: data.description ?? '',
//       lowStockThreshold: data.lowStockThreshold ?? 0,
//       expiryDate: data.expiryDate ?? '',
//       imageUrl: data.imageUrl ?? ''
//     };
//   }
// };
