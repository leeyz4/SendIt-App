export interface Driver {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string; // 'active' or 'inactive'
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  // Add any other fields returned by the backend
} 