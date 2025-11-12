import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { Order } from '../../../shared/interfaces/order';
import { DeleteorderService } from '../../../core/services/deleteorder/deleteorder.service';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { NotyfService } from '../../../core/services/notyf/notyf.service';

@Component({
  selector: 'app-deleteorders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './deleteorders.component.html',
  styleUrl: './deleteorders.component.scss'
})
export class DeleteordersComponent {


 deletedOrders:WritableSignal<Order[]> = signal<Order[]>([]);
 private platformid = inject(PLATFORM_ID)
 private notyf = inject(NotyfService)
 private deletedOrdersService = inject(DeleteorderService)

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformid)) {
        this.loadDeletedOrders(); 
    }
  
  }

  loadDeletedOrders() {
    this.deletedOrders.set(this.deletedOrdersService.getAllDeletedOrders());
  }

  deletePermanently(orderId: string) {
    if (confirm('Are you sure you want to delete this order permanently?')) {
      this.deletedOrdersService.deleteDeletedOrder(orderId);
      this.notyf.success('order Deleted successfully')
      this.loadDeletedOrders();
    }
  }

}
