import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Product } from '../../interfaces/product';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { Order } from '../../interfaces/order';
import { DatePipe } from '@angular/common';

export interface TableAction {
  name: string;
  icon?: string;            // ايقونة لو عايز      
  callback: (row: any) => void; // الدالة اللي هتتعمل Call عليها
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [DataTablesModule  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit , AfterViewInit, OnDestroy {

  @Input() columns:any[] = [];
  @Input() rows: any[] = [];
  @Input() actions: TableAction[] = [];  // actions: TableAction[] = [];
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();

  ngOnInit(): void {
     this.dtOptions = {
      pagingType: 'full_numbers',
      language: {searchPlaceholder: ' Looking for something ? Just type to search . . .',search: ''},
      columnDefs: [{targets: -1, orderable: false, searchable: false }],
      pageLength: 5,
      processing: true
    };

    console.log(this.rows);
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dtTrigger.next(null);  
    }, 0);
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

 
}




