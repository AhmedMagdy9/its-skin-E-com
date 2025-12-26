import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { OrdersService } from '../../../core/services/orders.service';
import { Order } from '../../../shared/interfaces/order';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { DeleteorderService } from '../../../core/services/deleteorder/deleteorder.service';
import { NotyfService } from '../../../core/services/notyf/notyf.service';
import { ProductService } from '../../../core/services/product service/product.service';
import { Product } from '../../../shared/interfaces/product';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {
  allOrders:WritableSignal<Order[]> = signal<Order[]>([]);
  activeTab: 'pending' | 'completed' = 'pending';
  private platformid = inject(PLATFORM_ID)
  private deletedOrdersService = inject(DeleteorderService)
  private productService = inject(ProductService)
   private notyf = inject(NotyfService)

  constructor(private orderService: OrdersService) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformid)) {
      this.loadOrders();
    }
  }

 async loadOrders() {

   this.allOrders.set( await this.orderService.getAllOrdersfire());
    console.log(this.allOrders());
  }

  get pendingOrders() {
    return this.allOrders().filter(o => o.status === 'pending');
  }

  get completedOrders() {
    return this.allOrders().filter(o => o.status === 'completed');
  }

  markAsCompleted(id: string) {
    this.orderService.updateOrderfire(id, { status: 'completed' });
   this.notyf.success('order Delevary successfully')
    this.loadOrders();
  }

  complated(order: Order  ) {
    this.deletedOrdersService.addCompletedOrder(order);
    this.orderService.deleteOrderfire(order.id);
    this.notyf.success('order completed successfully')
    this.loadOrders();
  }

  deleteOrder(order: Order) {
     this.orderService.deleteOrderfire(order.id);
    
     order.items.forEach(p => {
       this.productService.restoreProductToStock(p);
     });

     this.notyf.success('order deleted successfully and stock updated')
     this.loadOrders();
     
  }



}
