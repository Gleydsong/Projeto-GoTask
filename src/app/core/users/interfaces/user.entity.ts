import { UserRole } from './user-role.type';

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
  avatarUrl: string | null;
  jobTitle: string;
  department: string;
  bio: string;
  phone: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}
