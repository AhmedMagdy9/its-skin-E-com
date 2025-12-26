import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { CartService } from '../../../core/services/cart/cart.service';
import { isPlatformBrowser } from '@angular/common';
import { ProductService } from '../../../core/services/product service/product.service';
import { Product } from '../../../shared/interfaces/product';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrdersService } from '../../../core/services/orders.service';
import { Order } from '../../../shared/interfaces/order';
import { NotyfService } from '../../../core/services/notyf/notyf.service';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [ ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {


cartItems:WritableSignal<Product[]> = signal<Product[]>([]);
private platformid = inject(PLATFORM_ID)
private productService = inject(ProductService)
private cartService = inject(CartService)
private ordersService = inject(OrdersService)
private notyf = inject(NotyfService)
orderForm = new FormGroup({
 customerName: new FormControl('', [Validators.required, Validators.minLength(3)]),
 phone: new FormControl('', [ Validators.required, Validators.pattern(/^01[0-9]{9}$/)]),
 address: new FormControl('', [Validators.required, Validators.minLength(5)]),
});


ngOnInit(): void {
    if (isPlatformBrowser(this.platformid)) {
      this.get()
     
    }
}

async get(){
  let cart = await this.cartService.getAllCartProducts()
  this.cartItems.set(cart)
  console.log('cartfire' ,cart)
}

async removeItem(id: string) {
  // given a product from cart before removing it
  const step1Items = await this.cartService.getAllCartProducts();
  const  item = step1Items.find((p: Product) => p.id === id);
  if (!item) return; // safety check
  // remove product from cart
  this.cartService.removeFromCartfire(id);
  // return product to stock
  this.productService.restoreProductToStock(item)
  this.notyf.error('product Deleted successfully')
  this.get()
}

async updateQuantityfire(id: string, event: any) {
  const newQty = +event.target.value;

  const item = this.cartItems().find((p: Product) => p.id === id);
  if (!item) return;

  const productsInStock = await this.productService.getAllProducts();
  const productInStock = productsInStock.find((p: Product) => p.id === id);
  if (!productInStock) return;

  const oldCartQty = item.quantity;
  const stockQty = productInStock.quantity;

    // if quantity is less than or equal to 0
  if (newQty <= 0) {
    // return product quantity to stock
    await this.productService.updateProduct(id, {
      quantity: stockQty + oldCartQty
    });

    // remove product from cart
    await this.cartService.removeFromCartfire(id);

    this.notyf.success('🗑️ Product removed from cart');
    this.get();
    return;
  }

  const diff = newQty - oldCartQty;
  // 🔴 لو بيزوّد والمخزون مش مكفي
  if (diff > 0 && stockQty < diff) {
    this.notyf.error('❌ المخزون غير كافي');
    event.target.value = oldCartQty; // رجّع الرقم القديم
    return;
  }

  // لو مفيش تغيير
  if (diff === 0) return;

  // 🟢 تحديث المخزون
  await this.productService.updateProduct(id, {quantity: stockQty - diff});


  // 🟢 تحديث الكارت
  await this.cartService.updateCartProduct(id, { quantity: newQty });

  this.notyf.success('✅ Product updated successfully');
  this.get();
}

async clr(){
  if (this.cartItems()) {
    this.cartItems().forEach((item) => {
      this.removeItem(item.id);
    });
    this.get()
    this.notyf.error('cart Deleted successfully')

  }



}

getTotal() {
    return this.cartItems().reduce((acc, item) => acc + item.price * item.quantity, 0);
}

async submitOrder() {
  if (this.orderForm.invalid || this.cartItems().length === 0) {
    this.notyf.error('رجاءً تأكد من إدخال البيانات كاملة ووجود منتجات في الكارت.');
    return;
  }

  const newOrder: Order = {
  id: crypto.randomUUID(),
  customerName: this.orderForm.value.customerName!,
  phone: this.orderForm.value.phone!,
  address: this.orderForm.value.address!,
  items: this.cartItems(), // Product[]
  totalPrice: this.getTotal(),
  date: new Date().toISOString(),
  status: 'pending',
  };
   //  add order
    await this.ordersService.addOrderfire(newOrder);
    // clear cart
    await this.cartService.clearCartfire();
    this.notyf.success('✅ Order added successfully');
    this.orderForm.reset();

}




}
