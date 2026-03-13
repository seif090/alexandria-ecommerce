import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login.component';
import { VendorDashboardComponent } from './components/vendor/vendor-dashboard.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { VendorShopComponent } from './components/vendor/vendor-shop/vendor-shop';
import { UserDashboardComponent } from './components/dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { SeedDataComponent } from './components/admin/seed-data.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'vendor-dashboard', component: VendorDashboardComponent },
  { path: 'user-dashboard', component: UserDashboardComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'admin/seed-data', component: SeedDataComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'shop/:id', component: VendorShopComponent },
  { path: '**', redirectTo: '' }
];
