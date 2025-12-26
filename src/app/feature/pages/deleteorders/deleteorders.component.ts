import { Order } from './../../../shared/interfaces/order';
import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { DeleteorderService } from '../../../core/services/deleteorder/deleteorder.service';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { NotyfService } from '../../../core/services/notyf/notyf.service';
import { TableAction, TableComponent } from '../../../shared/reusable-com/table/table.component';

@Component({
  selector: 'app-deleteorders',
  standalone: true,
  imports: [CommonModule, TableComponent ],
  templateUrl: './deleteorders.component.html',
  styleUrl: './deleteorders.component.scss'
})
export class DeleteordersComponent {


orderColumns = [
  { label: '#', key: 'index' },
  { label: 'Customer', key: 'customerName' },
  { label: 'Phone', key: 'phone' },
  { label: 'Address', key: 'address' },
  { label: 'Items', key: 'items' },
  { label: 'Total', key: 'totalPrice' },
  { label: 'Date', key: 'date' },
];

tableActions: TableAction[] = [
  { name: '🚮',  callback: (row) => this.deletePermanently(row) }
]

 deletedOrders:WritableSignal<Order[]> = signal<Order[]>([]);
 private platformid = inject(PLATFORM_ID)
 private notyf = inject(NotyfService)
 private deletedOrdersService = inject(DeleteorderService)

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformid)) {
        this.loadDeletedOrders(); 
    }
  
  }

 async loadDeletedOrders() {
    this.deletedOrders.set(await this.deletedOrdersService.getAllCompletedOrders());
    console.log(this.deletedOrders());
   
  }

  deletePermanently(Order: Order) {
    if (confirm('Are you sure you want to delete this order permanently?')) {
      this.deletedOrdersService.deleteCompletedOrder(Order.id);
      this.notyf.success('order Deleted successfully')
      this.loadDeletedOrders();
    }
  }

}
