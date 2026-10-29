export type SlotStatus = 'AVAILABLE' | 'OCCUPIED';
export type SessionStatus = 'ACTIVE' | 'COMPLETED';
export type PaymentStatus = 'UNPAID' | 'PAID';

export interface ParkingSlot {
  id: number;
  slotNumber: string;
  status: SlotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SlotAvailabilitySummary {
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  occupancyRatePercent: number;
}

export interface ParkingSession {
  id: number;
  vehicleNumber: string;
  slotId: number;
  slotNumber: string;
  entryTime: string;
  exitTime?: string | null;
  status: SessionStatus;
  durationSeconds: number;
  durationFormatted: string;
  totalFee: number;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface FareEstimation {
  sessionId: number;
  vehicleNumber: string;
  slotNumber: string;
  entryTime: string;
  estimatedAt: string;
  durationSeconds: number;
  durationFormatted: string;
  billableBlocks: number;
  ratePerBlockInr: number;
  estimatedFee: number;
}

export interface Invoice {
  invoiceNumber: string;
  sessionId: number;
  vehicleNumber: string;
  slotNumber: string;
  entryTime: string;
  exitTime: string;
  durationSeconds: number;
  durationFormatted: string;
  totalFee: number;
  paymentStatus: PaymentStatus;
  currency: string;
  issuedAt: string;
}

export interface DailyRevenue {
  date: string;
  totalFinalizedCharges: number;
  paidRevenue: number;
  unpaidOutstandingAmount: number;
  completedSessionsCount: number;
  currency: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface VehicleEntryPayload {
  vehicleNumber: string;
  slotId?: number | null;
}

export interface CheckoutPayload {
  exitTime?: string;
  markAsPaid?: boolean;
}

export interface PaymentUpdatePayload {
  paymentStatus: PaymentStatus;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: string[];
}
