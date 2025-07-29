import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeliveryStatusService {
  private deliveryCompletedSource = new BehaviorSubject<string>('');
  deliveryCompleted$ = this.deliveryCompletedSource.asObservable();

  constructor() {}

  notifyDeliveryCompleted(parcelId: string) {
    console.log('📦 Delivery completed notification for parcel:', parcelId);
    this.deliveryCompletedSource.next(parcelId);
  }

  refreshCompletedDeliveries() {
    console.log('🔄 Refreshing completed deliveries...');
    this.deliveryCompletedSource.next('refresh');
  }
} 