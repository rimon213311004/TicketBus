import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendCreated, sendSuccess } from '../utils/response';
import { env } from '../config/env';
import * as bookingService from '../services/booking.service';
import * as seatHoldService from '../services/seatHold.service';

export const holdSeats = asyncHandler(async (req: Request, res: Response) => {
  const { tripId, seatNumbers } = req.body;
  const result = await seatHoldService.holdSeats(tripId, seatNumbers, req.user!.id);
  return sendSuccess(res, result, 'Seats held');
});

export const releaseSeats = asyncHandler(async (req: Request, res: Response) => {
  const { tripId, seatNumbers } = req.body;
  await seatHoldService.releaseSeats(tripId, seatNumbers, req.user!.id);
  return sendSuccess(res, null, 'Seats released');
});

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.createBooking(req.user!.id, req.body);
  return sendCreated(res, { booking }, 'Booking created');
});

export const listMyBookings = asyncHandler(async (req: Request, res: Response) => {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const bookings = await bookingService.listMyBookings(req.user!.id, status);
  return sendSuccess(res, { bookings });
});

export const getBooking = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  const booking = await bookingService.getBookingById(
    req.params.bookingId,
    isAdmin ? undefined : req.user!.id,
  );
  return sendSuccess(res, { booking });
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.cancelBooking(
    req.params.bookingId,
    req.user!.id,
    req.body?.reason,
  );
  return sendSuccess(res, { booking }, 'Booking cancelled');
});

export const getPaymentInstructions = asyncHandler(async (_req: Request, res: Response) => {
  return sendSuccess(res, {
    receiverNumber: env.payment.receiverNumber,
    methods: [
      { id: 'bkash', label: 'bKash', number: env.payment.receiverNumber, type: 'Personal' },
      { id: 'nagad', label: 'Nagad', number: env.payment.receiverNumber, type: 'Personal' },
      { id: 'rocket', label: 'Rocket', number: env.payment.receiverNumber, type: 'Personal' },
      {
        id: 'bank',
        label: 'Bank Transfer',
        number: env.payment.receiverNumber,
        accountName: 'TicketBus',
        type: 'Bank',
      },
      { id: 'cash', label: 'Cash at Counter', type: 'Offline' },
    ],
  });
});

export const submitPayment = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.submitPayment(
    req.params.bookingId,
    req.user!.id,
    req.body,
  );
  return sendSuccess(res, { booking }, 'Payment submitted for verification');
});

export const listPendingPayments = asyncHandler(async (_req: Request, res: Response) => {
  const payments = await bookingService.listPendingPayments();
  return sendSuccess(res, { payments });
});

export const getAdminStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await bookingService.getAdminStats();
  return sendSuccess(res, stats);
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.verifyPayment(
    req.params.paymentId,
    req.user!.id,
    req.body?.notes,
  );
  return sendSuccess(res, { booking }, 'Payment verified, ticket issued');
});

export const rejectPayment = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.rejectPayment(
    req.params.paymentId,
    req.user!.id,
    req.body.reason,
  );
  return sendSuccess(res, { booking }, 'Payment rejected');
});
