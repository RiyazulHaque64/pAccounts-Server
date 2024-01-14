export interface TUser {
  name: string;
  email: string;
  role: 'user' | 'admin';
  photoUrl: string;
  status: 'in-progress' | 'blocked';
  isDeleted: boolean;
}
