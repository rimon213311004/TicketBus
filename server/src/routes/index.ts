import { Router } from 'express';
import { authRouter } from './auth.routes';
import { tripRouter, catalogRouter } from './trip.routes';
import { bookingRouter, paymentRouter } from './booking.routes';
import { ticketRouter } from './ticket.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/trips', tripRouter);
apiRouter.use('/catalog', catalogRouter);
apiRouter.use('/bookings', bookingRouter);
apiRouter.use('/payments', paymentRouter);
apiRouter.use('/tickets', ticketRouter);
