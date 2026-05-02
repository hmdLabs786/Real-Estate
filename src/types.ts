export enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  PLOT = 'plot'
}

export enum LeadStatus {
  UNQUALIFIED = 'unqualified',
  QUALIFIED = 'qualified',
  SERIOUS = 'serious'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  area: string; // The specific Karachi area
  type: PropertyType;
  rooms: number;
  bathrooms: number;
  areaSize: string;
  description: string;
  imageUrl: string;
  status: 'available' | 'sold';
  createdAt: string;
}

export interface Lead {
  id: string;
  userId: string;
  email?: string;
  displayName?: string;
  budget?: number;
  location?: string;
  propertyType?: string;
  status: LeadStatus;
  isSerious: boolean;
  lastInteraction: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  userEmail: string;
  userName: string;
  date: string;
  time: string;
  status: BookingStatus;
  createdAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}
