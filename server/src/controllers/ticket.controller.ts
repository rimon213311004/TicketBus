import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import * as ticketService from '../services/ticket.service';
import * as bookingService from '../services/booking.service';

export const downloadTicket = asyncHandler(async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  const pdf = await ticketService.generateTicketPdf(
    req.params.bookingId,
    isAdmin ? undefined : req.user!.id,
  );

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="ticket-${req.params.bookingId}.pdf"`);
  res.setHeader('Content-Length', pdf.length);
  res.end(pdf);
});

/** Counter staff scan the QR and look the booking up by its printed code. */
export const lookupByCode = asyncHandler(async (req: Request, res: Response) => {
  const booking = await bookingService.getBookingByCode(req.params.code);
  return sendSuccess(res, { booking });
});
