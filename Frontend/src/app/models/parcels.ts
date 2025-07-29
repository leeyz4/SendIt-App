export interface Parcel {
  id: string;
  trackingId: string;
  description: string;
  weight: number;
  price: number;
  pickupLocation: string;
  destination: string;
  status: string;
  approvalStatus: string;
  rejectionReason?: string;
  deliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  senderId: string;
  recipientId: string;
  assignedDriverId?: string;
  sender?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  recipient?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  assignedDriver?: {
    id: string;
    name: string;
    email: string;
  };
  length?: number;
  width?: number;
  height?: number;
}

export enum ParcelStatus {
  PENDING = 'PENDING',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
} 