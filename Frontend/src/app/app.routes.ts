import { Routes } from '@angular/router';
import { Home } from './landing/home/home'
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { AdminParcels } from './admin/admin-parcels/admin-parcels';
import { AdminUsers } from './admin/admin-users/admin-users';
import { UserDashboard } from './user/user-dashboard/user-dashboard';
import { CreateDelivery } from './admin/create-delivery/create-delivery';
import { DeliveryHistory } from './user/delivery-history/delivery-history';
import { ParcelDetails } from './user/parcel-details/parcel-details';
import { ParcelTracking } from './user/parcel-tracking/parcel-tracking';
import { Profile } from './user/profile/profile';
// import { UserNavbar } from './shared/user-navbar/user-navbar';



export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'login', component: Login },
    { path: 'register', component: Register},
    { path: 'adminDashboard', component: AdminDashboard },
    { path: 'adminParcels', component: AdminParcels },
    { path: 'adminUsers', component: AdminUsers },
    { path: 'userDashboard', component: UserDashboard },
    { path: 'createDelivery', component: CreateDelivery },
    { path: 'deliveryHistory', component: DeliveryHistory },
    { path: 'parcelDetails', component: ParcelDetails },
    { path: 'parcelTracking', component: ParcelTracking },
    { path: 'profile', component: Profile },
    // { path: 'userNavbar', component: UserNavbar },
];
