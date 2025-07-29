/* eslint-disable prettier/prettier */
import { UserRole } from 'generated/prisma';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  created_at: Date;
  updated_at: Date;
}
