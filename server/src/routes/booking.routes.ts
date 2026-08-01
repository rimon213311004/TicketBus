import { Router } from 'express';
import * as controller from '../controllers/booking.controller';
import { validate } from '../middleware/validate';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  holdSeatsSchema,
  releaseSeatsSchema,
  createBookingSchema,
  bookingIdSchema,
  cancelBookingSchema,
  submitPaymentSchema,
  verifyPaymentSchema,
  rejectPaymentSchema,
} from '../validators/booking.validator';

export const bookingRouter = Router();

bookingRouter.use(requireAuth);

bookingRouter.post('/hold', validate(holdSeatsSchema), controller.holdSeats);
bookingRouter.post('/release', validate(releaseSeatsSchema), controller.releaseSeats);
bookingRouter.post('/', validate(createBookingSchema), controller.createBooking);
bookingRouter.get('/', controller.listMyBookings);
bookingRouter.get('/:bookingId', validate(bookingIdSchema), controller.getBooking);
bookingRouter.post('/:bookingId/cancel', validate(cancelBookingSchema), controller.cancelBooking);

export const paymentRouter = Router();

paymentRouter.get('/instructions', controller.getPaymentInstructions);

paymentRouter.use(requireAuth);

paymentRouter.post(
  '/:bookingId/submit',
  validate(submitPaymentSchema),
  controller.submitPayment,
);
paymentRouter.get('/pending', requireRole('admin'), controller.listPendingPayments);
paymentRouter.get('/admin-stats', requireRole('admin'), controller.getAdminStats);
paymentRouter.post(
  '/:paymentId/verify',
  requireRole('admin'),
  validate(verifyPaymentSchema),
  controller.verifyPayment,
);
paymentRouter.post(
  '/:paymentId/reject',
  requireRole('admin'),
  validate(rejectPaymentSchema),
  controller.rejectPayment,
);
