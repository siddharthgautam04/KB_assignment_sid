// src/types/index.ts

/** Roles as emitted by the backend JWT/user object */
export type Role = 'USER' | 'ADMIN';

/** User returned by backend (both user and admin share this base) */
export interface BaseUser {
  id: string;
  name: string;
  role: Role;
  employeeId?: string | null;   // present for USER
  username?: string | null;     // present for ADMIN or if you choose to set it for USER
}

/** Concrete convenience types (optional to use) */
export interface User extends BaseUser {
  role: 'USER';
  // employeeId typically present for users
}

export interface Admin extends BaseUser {
  role: 'ADMIN';
  username: string;   // admins always have a username
  // password is never returned by the API; omit from the type
}

export type AuthUser = User | Admin;

/** Resource matches Prisma model (String? for type/description/status) */
export interface Resource {
  id: string;
  name: string;
  ip: string;
  type?: string | null;                       // <- optional (fixes your error)
  status?: 'up' | 'down' | 'unknown' | null;  // <- optional and backend-aligned
  description?: string | null;                // <- optional
  createdAt: string;
  updatedAt: string;
}

/** Booking as returned by the backend */
export interface Booking {
  id: string;
  resourceId: string;
  userId: string;
  start: string;                  // ISO datetime from backend
  end: string;                    // ISO datetime from backend
  purpose?: string | null;
  createdAt: string;
  // when listed by resource, backend includes user info (select)
  user?: {
    id: string;
    name: string;
    employeeId?: string | null;
  };
}

/* ------------------------------------------------------------------
   The following store-state interfaces were used in the local
   (no-backend) version. They’re kept only to avoid import errors.
   You can delete them once you’ve fully migrated to services.
-------------------------------------------------------------------*/

/** @deprecated: use authService instead of a local store state */
export interface AuthState {
  user: AuthUser | null;
  // these signatures are placeholders to avoid breakage during migration
  loginUser?: (employeeId?: string, username?: string) => Promise<void> | void;
  loginAdmin?: (username: string, password: string) => Promise<void> | boolean | void;
  signupUser?: (employeeId: string, name: string, username?: string) => Promise<void> | boolean | void;
  signupAdmin?: (username: string, password: string) => Promise<void> | boolean | void;
  logout?: () => void;
}

/** @deprecated: fetch from backend via resourcesService */
export interface ResourcesState {
  resources: Resource[];
  addResource?: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateResource?: (id: string, resource: Partial<Resource>) => void;
  deleteResource?: (id: string) => void;
  getResource?: (id: string) => Resource | undefined;
}

/** @deprecated: use bookingsService; backend enforces conflicts */
export interface BookingsState {
  bookings: Booking[];
  addBooking?: (booking: Partial<Booking>) => boolean | Promise<boolean>;
  updateBooking?: (id: string, booking: Partial<Booking>) => boolean | Promise<boolean>;
  deleteBooking?: (id: string) => void | Promise<void>;
  getResourceBookings?: (resourceId: string) => Booking[];
  checkConflict?: (resourceId: string, startISO: string, endISO: string, excludeBookingId?: string) => boolean;
}

/** @deprecated */
export interface UsersState {
  users: User[];
  ensureUser?: (employeeId: string, name: string) => User;
}