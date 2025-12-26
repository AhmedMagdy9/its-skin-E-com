import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ProductService } from '../../../core/services/product service/product.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../shared/interfaces/product';
import { NotyfService } from '../../../core/services/notyf/notyf.service';

@Component({
  selector: 'app-addproduct',
  standalone: true,
  imports: [ ReactiveFormsModule],
  templateUrl: './addproduct.component.html',
  styleUrl: './addproduct.component.scss'
})
export class AddproductComponent implements OnInit {

  private productService = inject(ProductService)
  private notyf = inject(NotyfService)
  categories:WritableSignal<string[]> = signal <string[]>([])
  productForm = new FormGroup({
    id: new FormControl(''), // هيتولد أوتوماتيك لما نضيف المنتج
    name: new FormControl('', Validators.required),
    brand: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    quantity: new FormControl(0, [Validators.required, Validators.min(1)]),
    price: new FormControl<number | null>(null, [Validators.min(1)]),
    Cost: new FormControl<number | null>(null, [Validators.min(1)]),
    expiryDate: new FormControl<string | null>(null),
    addedDate: new FormControl(new Date().toISOString()), // بيتسجل تلقائيًا
    description: new FormControl(''),
    lowStockThreshold: new FormControl<number | null>(null),
    isFavorite: new FormControl(false)
  });
   
  ngOnInit(): void {
    this.categories.set(this.productService.categories)
  }



  addprductFire(){
    if (this.productForm.valid) {
      const { id, ...product } = this.productForm.value;
      console.log(product)
      this.productService.addProduct(product)
  }
}  

}
