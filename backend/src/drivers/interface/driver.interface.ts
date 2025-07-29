/* eslint-disable prettier/prettier */
import { UserRole } from 'generated/prisma';

export interface Driver {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  status: string;
  created_at: Date;
  updated_at: Date;
}
