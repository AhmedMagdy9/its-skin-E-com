import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
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
  filterApplied = false;
  allProducts:WritableSignal<Product[]> = signal<Product[]>([])
  categories:WritableSignal<string[]> = signal <string[]>([])
  brands:WritableSignal<string[]> = signal <string[]>([])
  selectedCatOrBrand:WritableSignal<string> =signal('');
  filteredProducts:WritableSignal<Product[]> = signal<Product[]>([]);
  private platformid = inject(PLATFORM_ID)
  private cartService = inject(CartService);
  private notyf = inject(NotyfService)

  constructor(private productService: ProductService) {}


ngOnInit(): void {
   if (isPlatformBrowser(this.platformid)) {
     this.getCatBrand();
    
   }
}

async getCatBrand() {
  // get all products
  const products = await this.productService.getAllProducts();
  this.allProducts.set(products);
  // get categories and brands
  this.categories.set([...new Set(products.map(p => p.category))]);
  this.brands.set([...new Set(products.map(p => p.brand))]);
}

filterProducts(filterWord: string): void {
  this.filterApplied = true;
  this.filteredProducts.set(this.allProducts().filter(p => p.category === filterWord || p.brand === filterWord));
}

async addToCart(product: any) {
if (product.quantity <= 0) {
  this.notyf.error('Product out of stock')
  return
}
  await this.productService.updateProduct(product.id, {quantity: product.quantity - 1 });
  this.cartService.addToCartfire(product);
  this.notyf.success('Product added successfully')
  this.getCatBrand();

}


}
