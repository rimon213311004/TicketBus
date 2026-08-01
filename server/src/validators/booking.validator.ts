import { z } from 'zod';
import { GENDERS, PAYMENT_METHODS, ONLINE_PAYMENT_METHODS } from '../constants';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const phoneRegex = /^01[3-9]\d{8}$/;

export const holdSeatsSchema = z.object({
  body: z.object({
    tripId: objectId,
    seatNumbers: z.array(z.string().min(1)).min(1, 'Select at least one seat').max(4, 'Maximum 4 seats per booking'),
  }),
});

export const releaseSeatsSchema = z.object({
  body: z.object({
    tripId: objectId,
    seatNumbers: z.array(z.string().min(1)).min(1),
  }),
});

export const createBookingSchema = z.object({
  body: z.object({
    tripId: objectId,
    seatNumbers: z.array(z.string().min(1)).min(1).max(4),
    passengers: z
      .array(
        z.object({
          name: z.string().min(2, 'Passenger name is required'),
          age: z.number().int().min(1).max(120).optional(),
          gender: z.enum(GENDERS),
          seatNumber: z.string().min(1),
        }),
      )
      .min(1),
    contactName: z.string().min(2, 'Contact name is required'),
    contactPhone: z.string().regex(phoneRegex, 'Enter a valid Bangladeshi mobile number'),
    contactEmail: z.string().email('Enter a valid email address'),
    boardingPointId: objectId,
    droppingPointId: objectId,
    paymentMethod: z.enum(PAYMENT_METHODS),
  }),
});

export const submitPaymentSchema = z.object({
  params: z.object({ bookingId: objectId }),
  body: z.object({
    method: z.enum(ONLINE_PAYMENT_METHODS as [string, ...string[]]),
    senderNumber: z.string().min(6, 'Enter the number you sent money from'),
    trxId: z.string().min(4, 'Enter the transaction ID').max(40),
    amount: z.number().positive(),
    bankName: z.string().optional(),
    bankAccountName: z.string().optional(),
  }),
});

export const verifyPaymentSchema = z.object({
  params: z.object({ paymentId: objectId }),
  body: z.object({ notes: z.string().max(500).optional() }),
});

export const rejectPaymentSchema = z.object({
  params: z.object({ paymentId: objectId }),
  body: z.object({ reason: z.string().min(3, 'Give a reason for the rejection').max(500) }),
});

export const bookingIdSchema = z.object({
  params: z.object({ bookingId: objectId }),
});

export const cancelBookingSchema = z.object({
  params: z.object({ bookingId: objectId }),
  body: z.object({ reason: z.string().max(500).optional() }),
});
