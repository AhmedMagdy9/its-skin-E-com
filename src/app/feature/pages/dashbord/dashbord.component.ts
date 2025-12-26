import { Component, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { OrdersService } from '../../../core/services/orders.service';
import { DeleteorderService } from '../../../core/services/deleteorder/deleteorder.service';
import { ProductService } from '../../../core/services/product service/product.service';
import { CurrencyPipe, DecimalPipe, isPlatformBrowser} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../shared/interfaces/product';
import { Order } from '../../../shared/interfaces/order';


@Component({
  selector: 'app-dashbord',
  standalone: true,
  imports: [ DecimalPipe  , FormsModule],
  templateUrl: './dashbord.component.html',
  styleUrl: './dashbord.component.scss'
})
export class DashbordComponent {
  private platformid = inject(PLATFORM_ID)
  private orders: WritableSignal<Order[]> = signal<Order[]>([]);
  private allDeletedOrders: WritableSignal<Order[]> = signal<Order[]>([]);
  private allProducts: WritableSignal<Product[]> = signal<Product[]>([]);
  totalOrders = signal(0);
  pendingOrders = signal(0);
  completedOrders = signal(0);
  deletedOrders = signal(0);
  totalProducts = signal(0);
  totalProductsCost = signal(0);
  totalProductsPrice = signal(0);
  totalRevenue = signal(0);
  filteredProfit = signal(0);
  filteredProfitPercentage = signal(0); 
  filteredCost = signal(0);  
  filteredRevenue = signal(0); 
  topProducts: any[] = [];
  months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو','يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر' ];
  years = [2020, 2021 ,2022 , 2023 , 2024 ,2025 ,2026 , 2027 , 2028 , 2029 , 2030];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
 

  constructor(private orderService: OrdersService, private productService: ProductService ,private deleteorderService: DeleteorderService) {}
 

  ngOnInit() {
   if (isPlatformBrowser(this.platformid)) {
     this.loadDashboardData();
    
   }
  }

async  loadDashboardData() {
   this.orders.set(await this.orderService.getAllOrdersfire());  // all orders   
   this.allDeletedOrders.set(await this.deleteorderService.getAllCompletedOrders()) ; // completed orders
   this.totalOrders.set(this.orders().length);
   this.pendingOrders.set(this.orders().filter(o => o.status === 'pending').length);
   this.completedOrders.set(this.orders().filter(o => o.status === 'completed').length);
   this.deletedOrders.set(this.allDeletedOrders().length);
   this.allProducts.set(await this.productService.getAllProducts()) ; 
   console.log(  'allProducts',this.allProducts());
   this.totalProducts.set(this.allProducts().length);
   this.totalProductsCost.set(this.allProducts().reduce((sum, p) => sum + Number(p.Cost * p.quantity || 0), 0));
    console.log(  'this.totalProductsCost',this.totalProductsCost());
   this.totalProductsPrice.set(this.allProducts().reduce((sum, p) => sum + Number(p.price * p.quantity || 0), 0));
   console.log(  'this.totalProductsPrice',this.totalProductsPrice());


    this.calculateRevenueAndTopProducts(this.allDeletedOrders());
  }

  calculateRevenueAndTopProducts(deletedOrders: any[]) {
    const productStats: any = {}; // sum of sold and revenue
    deletedOrders.forEach(order => {
      order.items.forEach((item: any) => {
        if (!productStats[item.name]) {
          productStats[item.name] = {
            name: item.name,
            sold: 0,
            revenue: 0
          };
        }
        productStats[item.name].sold += item.quantity;
        productStats[item.name].revenue += item.price * item.quantity;
      });
    });

    // transform object to array
    this.topProducts = Object.values(productStats)
      .sort((a: any, b: any) => b.sold - a.sold)
      .slice(0, 5); // start from index 5

    // calculate total revenue
    this.totalRevenue.set(this.topProducts.reduce((acc: number, p: any) => acc + p.revenue, 0));
  }

  // chart profit
  getPendingPercent() {
    return this.totalOrders() ? (this.pendingOrders() / this.totalOrders()) * 100 : 0;
  }

  getCompletedPercent() {
    return this.totalOrders() ? (this.completedOrders() / this.totalOrders()) * 100 : 0;
  }

  getDeletedPercent() {
    return this.totalOrders() ? (this.deletedOrders() / this.totalOrders()) * 100 : 0;
  }

//  to calculate monthly revenue and profit from deleted orders
 getMonthlyRevenueAndProfit(month: number | string, year: number | string): { revenue: number; profit: number; profitPercentage: number; purchases: number;} {
  // 🧩 تحويل الشهر والسنة لأرقام واضحة
  const selectedMonth = Number(month);
  const selectedYear = Number(year);

  // ✅ فلترة الطلبات حسب الشهر والسنة
  const monthlyOrders = this.allDeletedOrders().filter(order => {
    const [orderYear, orderMonth] = order.date.split('-').map(Number);
    return orderMonth === selectedMonth && orderYear === selectedYear;
  });

  // ✅ فلترة المنتجات الجديدة حسب الشهر والسنة
  const monthlyProducts = this.allProducts().filter((p: any) => {
    if (!p.addedDate) return false;
    const date = new Date(p.addedDate);
    if (isNaN(date.getTime())) return false;
    return (
      date.getUTCMonth() + 1 === selectedMonth &&
      date.getUTCFullYear() === selectedYear
    );
  });

  // 💰 حساب المبيعات والتكلفة من الطلبات
  const  {totalRevenue , totalOrderCost} = this.calculateOrderRevenue(monthlyOrders);
  const {totalCost}  = this.calculateOrderCost(this.allDeletedOrders() ,selectedMonth ,selectedYear  )

  // 🏪 حساب تكلفة المنتجات الجديدة في المخزون
  const totalStockPurchases = this.calculateStockPurchases(monthlyProducts);
  

  // 💹 حساب الربح ونسبة الربح من الطلبات فقط
  const totalProfit = totalRevenue - totalOrderCost;
  const profitPercentage = totalRevenue > 0 ? (totalProfit / totalOrderCost) * 100 : 0;

  // 🧮 إجمالي المشتريات الشهرية (اللي اتشرت سواء اتباع منها أو لسه)
  const totalPurchases = totalCost + totalStockPurchases;

  return {
    revenue: +totalRevenue.toFixed(2),
    profit: +totalProfit.toFixed(2),
    profitPercentage: +profitPercentage.toFixed(2),
    purchases: +totalPurchases.toFixed(2)
  };
  }


//  to calculate total revenue from orders 
  calculateOrderRevenue(orders: any[]): { totalRevenue: number; totalOrderCost: number } {
  let totalRevenue = 0;
  let totalOrderCost = 0;

  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      const price = +item.price || 0;
      const cost = +item.Cost  || 0;
      const qty = +item.quantity || 0;

      totalRevenue += price * qty;
      totalOrderCost += cost * qty;
    });
  });

  return { totalRevenue, totalOrderCost };
  }

  //  to calculate total cost from orders
  calculateOrderCost(orders: any[], selectedMonth: number, selectedYear: number): { totalCost: number } {
  let totalCost = 0;

  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      const itemDate = new Date(item.addedDate);
      const itemMonth = itemDate.getMonth() + 1; // getMonth returns 0 → 11
      const itemYear = itemDate.getFullYear();

      if (itemMonth === selectedMonth && itemYear === selectedYear) {
        const cost = +item.Cost || 0;
        const qty = +item.quantity || 0;
        totalCost += cost * qty;
      }
    });
  });
  return { totalCost };
  }

//  to calculate total stock purchases
  calculateStockPurchases(products: any[]): number {
  return products.reduce((sum, p: any) => {
    const cost = +p.Cost  || 0;
    const qty = +p.quantity || 0;
    return sum + (cost * qty);
  }, 0);
  }

  filterByMonth() {
  const result = this.getMonthlyRevenueAndProfit(
    Number(this.selectedMonth),
    Number(this.selectedYear)
  );

  this.filteredRevenue.set(result.revenue);
  this.filteredCost.set(result.purchases);
  this.filteredProfit.set(result.profit);
  this.filteredProfitPercentage.set(result.profitPercentage);

  }

  //  to calculate total profit percentage
  getDeletedOrdersProfitPercentage(): number {
  const deletedOrders = this.deleteorderService.getAllDeletedOrders();

  let totalCost = 0;
  let totalRevenue = 0;

  deletedOrders.forEach(order => {
    order.items?.forEach((p: any) => {
      const cost = Number(p.Cost ?? p.cost) || 0;
      const price = Number(p.price) || 0;
      const qty = Number(p.quantity) || 0;

      totalCost += cost * qty;
      totalRevenue += price * qty;
    });
  });

  const totalProfit = totalRevenue - totalCost;
  const profitPercentage = totalRevenue > 0 ? (totalProfit / totalCost) * 100 : 0;

  return +profitPercentage.toFixed(2);
  }
}
