import { Routes } from '@angular/router';
import { Home } from './landing/home/home'
import { Services } from './landing/services/services';
import { Track } from './landing/track/track';
import { AboutUs } from './landing/about-us/about-us';
import { Contact } from './landing/contact/contact';
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
import { DriverDashboard } from './driver/driver-dashboard/driver-dashboard';
import { AdminDrivers } from './admin/admin-drivers/admin-drivers';
// import { UserNavbar } from './shared/user-navbar/user-navbar';



export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'services', component: Services },
    { path: 'track', component: Track }, 
    { path: 'about-us', component: AboutUs },
    { path: 'contact', component: Contact },
    { path: 'login', component: Login },
    { path: 'register', component: Register},
    { path: 'admin-dashboard', component: AdminDashboard },
    { path: 'admin-parcels', component: AdminParcels },
    { path: 'admin-users', component: AdminUsers },
    { path: 'admin-drivers', component: AdminDrivers },
    { path: 'user-dashboard', component: UserDashboard },
    { path: 'create-delivery', component: CreateDelivery },
    { path: 'delivery-history', component: DeliveryHistory },
    { path: 'parcel-details', component: ParcelDetails },
    { path: 'parcel-tracking', component: ParcelTracking },
    { path: 'profile', component: Profile },
    { path: 'driver-dashboard', component: DriverDashboard },
    // { path: 'userNavbar', component: UserNavbar },
];

