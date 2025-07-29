export interface LocationUpdateDto {
  driverId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  locationName?: string; // Optional location name like "Embu", "Nairobi"
}

export interface Location {
  id: string;
  driverId: string;
  parcelId?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  address?: string;
} 