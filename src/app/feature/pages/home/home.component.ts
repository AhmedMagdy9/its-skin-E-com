import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { Product } from '../../../shared/interfaces/product';
import { ProductService } from '../../../core/services/product service/product.service';
import {  isPlatformBrowser } from '@angular/common';
import { CartService } from '../../../core/services/cart/cart.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotyfService } from '../../../core/services/notyf/notyf.service';;
import { TableAction, TableComponent } from "../../../shared/reusable-com/table/table.component";







@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TableComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {



productColumns = [
  { label: 'Name', key: 'name' },
  { label: 'Category', key: 'category' },
  { label: 'Quantity', key: 'quantity' },
  { label: 'Expiry', key: 'expiryDate' },
  { label: 'Price', key: 'price' },
  { label: 'Cost', key: 'Cost' },
];

tableActions: TableAction[] = [
  { name: '🛒',  callback: (row) => this.addToCart(row) },
  { name: '🛠️', callback: (row) => this.startEdit(row) },
  { name: '🚮',  callback: (row) => this.deleteProduct(row) },
];


  private platformid = inject(PLATFORM_ID)
  private cartService = inject(CartService)
  private notyf = inject(NotyfService)
  private productService = inject(ProductService)
  products:WritableSignal<Product[]> = signal<Product[]>([]);
  categories:WritableSignal<string[]> = signal <string[]>([])
  searchTerm:WritableSignal<string> = signal('');
  toggleForm:WritableSignal<boolean> = signal(false);
  editingProductId:WritableSignal<string > = signal('');
  editForm: FormGroup = new FormGroup({
     name: new FormControl('', Validators.required),
     brand: new FormControl('', Validators.required),
     category: new FormControl('', Validators.required),
     quantity: new FormControl(0, [Validators.required, Validators.min(1)]),
     price: new FormControl<number | null>(null, [Validators.min(1)]),
     Cost: new FormControl<number | null>(null, [Validators.min(1)]),
     expiryDate: new FormControl<string | null>(null),
     lowStockThreshold: new FormControl<number | null>(null),
     description: new FormControl(''),
   });

 


  ngOnInit(): void {
   if (isPlatformBrowser(this.platformid)) {
     this.categories.set(this.productService.categories)

     this.getProducts();
     
   }
  }


 async getProducts(){
    let productsfire = await this.productService.getAllProducts()
    console.log(productsfire)
    this.products.set(productsfire)
    
  }

  

 deleteProduct(product: any): void {
    this.productService.deleteProduct(product.id)
     this.getProducts();
    this.notyf.error('Product Deleted successfully')
  }

 getExpiryColor(expiryDate: string): string {
  const today = new Date();
  // update date format
  if (expiryDate.includes('-')) {
    const [day, month, year] = expiryDate.split('-');
    expiryDate = `${year}-${month}-${day}`;
    
  }

  const expiry = new Date(expiryDate);
  const diffInTime = expiry.getTime() - today.getTime();
  const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) return 'text-red-600'; // expired
  else if (diffInDays <= 60) return 'text-yellow-600'; // expiring soon 2 manths
  else return 'text-green-600'; // not expired
  }
  

async addToCart(product: any) {
 
if (product.quantity <= 0) {
  this.notyf.error('Product out of stock')
  return
}
  await this.productService.updateProduct(product.id, {quantity: product.quantity - 1 });
  this.cartService.addToCartfire(product);

  this.notyf.success('Product added successfully')
   //  update  list table
   this.getProducts();

 
  }

  // start edit
  startEdit(product: any) {
    this.editingProductId.set(product.id); 
    this.toggleForm.set(true);
    this.editForm.patchValue(product);
  }

  // save edit
async saveEdit() {
  if (!this.editingProductId()) return;
  const id = this.editingProductId();
  const updatedData = this.editForm.value;

  try {
    // 1️⃣ update Firestore
    await this.productService.updateProduct(id, updatedData);
    // 3️⃣ Cleanup
    this.toggleForm.set(false);
    this.editForm.reset();
     this.getProducts();
    this.notyf.success('Product updated successfully');
  } catch (error) {
    console.error(error);
    this.notyf.error('Update failed');
  }
}

  // cancel edit
  cancelEdit() {
    this.toggleForm.set(false);
    this.editForm.reset();
  }

 
}
