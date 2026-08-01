import { Router } from 'express';
import * as controller from '../controllers/ticket.controller';
import { requireAuth, requireRole } from '../middleware/auth';

export const ticketRouter = Router();

ticketRouter.use(requireAuth);

ticketRouter.get('/:bookingId/pdf', controller.downloadTicket);
ticketRouter.get('/lookup/:code', requireRole('admin', 'operator'), controller.lookupByCode);
