import { Routes } from '@angular/router';
import { Home } from './landing/home/home'
import { Homey } from './landing/homey/homey'
import { Services } from './landing/services/services';
import { Track } from './landing/track/track';
import { AboutUs } from './landing/about-us/about-us';
import { Contact } from './landing/contact/contact';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Verify } from './auth/verify/verify';
import { AdminDashboard } from './admin/admin-dashboard/admin-dashboard';
import { AdminParcels } from './admin/admin-parcels/admin-parcels';
import { AdminUsers } from './admin/admin-users/admin-users';
import { UserDashboard } from './user/user-dashboard/user-dashboard';
import { CreateDelivery } from './admin/create-delivery/create-delivery';
import { DeliveryHistory } from './user/delivery-history/delivery-history';
import { ParcelDetails } from './user/parcel-details/parcel-details';
import { ParcelTracking } from './user/parcel-tracking/parcel-tracking';
import { Profile } from './user/profile/profile';
import { DeliveryDetails } from './user/delivery-details/delivery-details';
import { DeliveryApproval } from './user/delivery-approval/delivery-approval';
import { DriverDashboard } from './driver/driver-dashboard/driver-dashboard';
import { AdminDrivers } from './admin/admin-drivers/admin-drivers';
import { ApprovedDeliveries } from './admin/approved-deliveries/approved-deliveries';
import { RejectedDeliveries } from './admin/rejected-deliveries/rejected-deliveries';
import { DriverLocationComponent } from './driver/driver-location/driver-location';
import { DriverDeliveries } from './driver/driver-deliveries/driver-deliveries';
import { DriverCompleted } from './driver/driver-completed/driver-completed';
import { DriverProfile } from './driver/driver-profile/driver-profile';
// import { UserNavbar } from './shared/user-navbar/user-navbar';



export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'homey', component: Homey },
    { path: 'services', component: Services },
    { path: 'track', component: Track }, 
    { path: 'about-us', component: AboutUs },
    { path: 'contact', component: Contact },
    { path: 'login', component: Login },
    { path: 'register', component: Register},
    { path: 'verify', component: Verify },
    { path: 'admin-dashboard', component: AdminDashboard },
    { path: 'admin-parcels', component: AdminParcels },
    { path: 'admin-users', component: AdminUsers },
    { path: 'admin-drivers', component: AdminDrivers },
    { path: 'approved-deliveries', component: ApprovedDeliveries },
    { path: 'rejected-deliveries', component: RejectedDeliveries },
    { path: 'user-dashboard', component: UserDashboard },
    { path: 'create-delivery', component: CreateDelivery },
    { path: 'delivery-history', component: DeliveryHistory },
    { path: 'delivery-approval', component: DeliveryApproval },
    { path: 'parcel-details/:trackingId', component: ParcelDetails },
    { path: 'parcel-tracking', component: ParcelTracking },
    { path: 'profile', component: Profile },
    { path: 'delivery-details', component: DeliveryDetails },
    { path: 'driver-dashboard', component: DriverDashboard },
    { path: 'driver-location', component: DriverLocationComponent },
    { path: 'driver-deliveries', component: DriverDeliveries },
    { path: 'driver-completed', component: DriverCompleted },
    { path: 'driver-profile', component: DriverProfile },
    // { path: 'userNavbar', component: UserNavbar },
];

