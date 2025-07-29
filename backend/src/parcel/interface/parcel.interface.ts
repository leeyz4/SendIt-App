/* eslint-disable prettier/prettier */
export interface Parcel {
  id: string;
  senderId: string;
  recipientId: string;
  trackingId: string;
  description?: string;
  origin: string;
  pickUpLocation: string;
  destination: string;
  weight: number;
  price: number;
  status: 'pending' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
