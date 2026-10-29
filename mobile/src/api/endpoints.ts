import { apiClient } from './client';
import {
  ParkingSlot,
  SlotAvailabilitySummary,
  ParkingSession,
  FareEstimation,
  Invoice,
  DailyRevenue,
  PagedResponse,
  VehicleEntryPayload,
  CheckoutPayload,
  PaymentUpdatePayload,
} from '../types';

export const slotsApi = {
  getAll: async (): Promise<ParkingSlot[]> => {
    const res = await apiClient.get<ParkingSlot[]>('/api/v1/slots');
    return res.data;
  },

  getAvailability: async (): Promise<SlotAvailabilitySummary> => {
    const res = await apiClient.get<SlotAvailabilitySummary>('/api/v1/slots/availability');
    return res.data;
  },

  getAvailable: async (): Promise<ParkingSlot[]> => {
    const res = await apiClient.get<ParkingSlot[]>('/api/v1/slots/available');
    return res.data;
  },

  getOccupied: async (): Promise<ParkingSlot[]> => {
    const res = await apiClient.get<ParkingSlot[]>('/api/v1/slots/occupied');
    return res.data;
  },

  getById: async (slotId: number): Promise<ParkingSlot> => {
    const res = await apiClient.get<ParkingSlot>(`/api/v1/slots/${slotId}`);
    return res.data;
  },
};

export const sessionsApi = {
  entry: async (payload: VehicleEntryPayload): Promise<ParkingSession> => {
    const res = await apiClient.post<ParkingSession>('/api/v1/sessions/entry', payload);
    return res.data;
  },

  getActive: async (): Promise<ParkingSession[]> => {
    const res = await apiClient.get<ParkingSession[]>('/api/v1/sessions/active');
    return res.data;
  },

  getActiveById: async (sessionId: number): Promise<ParkingSession> => {
    const res = await apiClient.get<ParkingSession>(`/api/v1/sessions/active/${sessionId}`);
    return res.data;
  },

  estimateFare: async (sessionId: number, atTimestamp?: string): Promise<FareEstimation> => {
    const params = atTimestamp ? { at: atTimestamp } : {};
    const res = await apiClient.get<FareEstimation>(`/api/v1/sessions/${sessionId}/fare`, { params });
    return res.data;
  },

  checkout: async (sessionId: number, payload?: CheckoutPayload): Promise<Invoice> => {
    const res = await apiClient.post<Invoice>(`/api/v1/sessions/${sessionId}/checkout`, payload || {});
    return res.data;
  },

  getInvoice: async (sessionId: number): Promise<Invoice> => {
    const res = await apiClient.get<Invoice>(`/api/v1/sessions/${sessionId}/invoice`);
    return res.data;
  },

  updatePayment: async (sessionId: number, payload: PaymentUpdatePayload): Promise<ParkingSession> => {
    const res = await apiClient.patch<ParkingSession>(`/api/v1/sessions/${sessionId}/payment`, payload);
    return res.data;
  },

  getHistory: async (page = 0, size = 10, direction = 'desc'): Promise<PagedResponse<ParkingSession>> => {
    const res = await apiClient.get<PagedResponse<ParkingSession>>('/api/v1/sessions/history', {
      params: { page, size, direction },
    });
    return res.data;
  },
};

export const reportsApi = {
  getDailyRevenue: async (date?: string): Promise<DailyRevenue> => {
    const params = date ? { date } : {};
    const res = await apiClient.get<DailyRevenue>('/api/v1/reports/revenue', { params });
    return res.data;
  },
};
