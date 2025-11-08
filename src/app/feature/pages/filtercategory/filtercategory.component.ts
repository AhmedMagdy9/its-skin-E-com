import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Product } from '../../../shared/interfaces/product';
import { ProductService } from '../../../core/services/product service/product.service';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotyfService } from '../../../core/services/notyf/notyf.service';
import { CartService } from '../../../core/services/cart/cart.service';

@Component({
  selector: 'app-filtercategory',
  standalone: true,
  imports: [CommonModule, CurrencyPipe , FormsModule],
  templateUrl: './filtercategory.component.html',
  styleUrl: './filtercategory.component.scss'
})
export class FiltercategoryComponent {

  categories: string[] = [];
  brands: string[] = [];
  selectedCatOrBrand = '';
  filteredProducts: Product[] = [];
  private platformid = inject(PLATFORM_ID)
  private cartService = inject(CartService);
  private notyf = inject(NotyfService)

  constructor(private productService: ProductService) {}


  ngOnInit(): void {
   if (isPlatformBrowser(this.platformid)) {
     // ✅ استرجاع الفئات من كل المنتجات 
    const allProducts = this.productService.getAll();
    this.categories = [...new Set(allProducts.map(p => p.category))];
     // ✅ استرجاع الشركات من كل المنتجات 
    const allProductsBrand = this.productService.getAll();
    this.brands = [...new Set(allProductsBrand.map(p => p.brand))];
    
   }
  }

  filterProducts(filterWord: string): void {
  const allProducts = this.productService.getAll();
  this.filteredProducts = allProducts.filter(p => p.category === filterWord || p.brand === filterWord);
  }




  addToCart(product: any) {
  // ✅ 1. أضف المنتج للكارت
 this.cartService.addToCart(product);

  // ✅ 2. قلل الكمية في السيرفس
  this.productService.decreaseQuantity(product.id);

  // ✅ 3. هات النسخة الجديدة من المنتج بعد التحديث
  const updatedProduct = this.productService.getAll().find((p: any) => p.id === product.id);

  // ✅ 4. لو الكمية وصلت صفر احذفه
  if (updatedProduct && updatedProduct.quantity === 0) {
     this.productService.delete(product.id);
  }

  this.notyf.success('Product added successfully')
  // ✅ 5. حدث الليستة في الصفحة

 
  }
}
