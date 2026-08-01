import { create } from 'zustand';
import type { Passenger, PaymentMethod, Trip } from '@/types';

interface BookingDraft {
  trip: Trip | null;
  seatNumbers: string[];
  holdExpiresAt: string | null;
  passengers: Passenger[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  boardingPointId: string;
  droppingPointId: string;
  paymentMethod: PaymentMethod | null;
}

interface BookingState extends BookingDraft {
  setTrip: (trip: Trip) => void;
  toggleSeat: (seatNumber: string, maxSeats?: number) => void;
  setHold: (seatNumbers: string[], expiresAt: string) => void;
  setPassengerDetails: (details: Partial<BookingDraft>) => void;
  reset: () => void;
}

const empty: BookingDraft = {
  trip: null,
  seatNumbers: [],
  holdExpiresAt: null,
  passengers: [],
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  boardingPointId: '',
  droppingPointId: '',
  paymentMethod: null,
};

export const MAX_SEATS_PER_BOOKING = 4;

export const useBookingStore = create<BookingState>((set) => ({
  ...empty,

  setTrip: (trip) =>
    set((state) =>
      state.trip?._id === trip._id ? { trip } : { ...empty, trip },
    ),

  toggleSeat: (seatNumber, maxSeats = MAX_SEATS_PER_BOOKING) =>
    set((state) => {
      const selected = state.seatNumbers.includes(seatNumber);
      if (selected) {
        return { seatNumbers: state.seatNumbers.filter((s) => s !== seatNumber) };
      }
      if (state.seatNumbers.length >= maxSeats) return state;
      return { seatNumbers: [...state.seatNumbers, seatNumber] };
    }),

  setHold: (seatNumbers, holdExpiresAt) => set({ seatNumbers, holdExpiresAt }),

  setPassengerDetails: (details) => set(details),

  reset: () => set(empty),
}));
