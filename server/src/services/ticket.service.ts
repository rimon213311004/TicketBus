import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Booking, Payment } from '../models';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

const COLORS = {
  primary: '#2563EB',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E5E7EB',
  success: '#22C55E',
  warning: '#F59E0B',
};

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Dhaka',
  }).format(date);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeZone: 'Asia/Dhaka' }).format(date);
}

interface PopulatedBooking {
  bookingCode: string;
  status: string;
  seatNumbers: string[];
  passengers: { name: string; gender: string; age?: number; seatNumber: string }[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  farePerSeat: number;
  totalAmount: number;
  serviceCharge: number;
  payableAmount: number;
  paymentMethod: string;
  journeyDate: Date;
  holdExpiresAt?: Date | null;
  trip: { departureLabel: string; arrivalLabel: string; departureTime: Date; busType: string; acType: string };
  operator: { name: string };
  route: { from: string; to: string };
  boardingPoint: { name: string; city: string; minutesBeforeDeparture: number };
  droppingPoint: { name: string; city: string };
}

/**
 * Renders a ticket for CONFIRMED bookings, or a pay-at-counter voucher otherwise.
 * The voucher is deliberately marked as not valid for travel.
 */
export async function generateTicketPdf(bookingId: string, userId?: string): Promise<Buffer> {
  const booking = (await Booking.findById(bookingId)
    .populate('trip', 'departureLabel arrivalLabel departureTime busType acType')
    .populate('operator', 'name')
    .populate('route', 'from to')
    .populate('boardingPoint', 'name city minutesBeforeDeparture')
    .populate('droppingPoint', 'name city')
    .lean()) as unknown as (PopulatedBooking & { user: { toString(): string } }) | null;

  if (!booking) throw AppError.notFound('Booking not found');
  if (userId && booking.user.toString() !== userId) throw AppError.forbidden();

  if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
    throw AppError.badRequest('This booking is no longer valid');
  }

  const payment = await Payment.findOne({ booking: bookingId }).sort({ createdAt: -1 }).lean();
  const isTicket = booking.status === 'CONFIRMED';

  const qrDataUrl = await QRCode.toDataURL(booking.bookingCode, { margin: 1, width: 320 });
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  renderDocument(doc, booking, payment, isTicket, qrBuffer);
  doc.end();

  return done;
}

function renderDocument(
  doc: PDFKit.PDFDocument,
  booking: PopulatedBooking,
  payment: { method: string; trxId?: string; status: string; senderNumber?: string } | null,
  isTicket: boolean,
  qrBuffer: Buffer,
) {
  const left = 40;
  const width = doc.page.width - 80;

  doc.rect(0, 0, doc.page.width, 90).fill(COLORS.primary);
  doc.fillColor('#FFFFFF').fontSize(22).text('TicketBus', left, 28);
  doc.fontSize(9).text('Bangladesh Bus Ticketing', left, 56);
  doc
    .fontSize(16)
    .text(isTicket ? 'E-TICKET' : 'BOOKING VOUCHER', left, 30, { width, align: 'right' });
  doc.fontSize(10).text(booking.bookingCode, left, 56, { width, align: 'right' });

  let y = 110;

  if (!isTicket) {
    doc.rect(left, y, width, 54).fill('#FEF3C7');
    doc.fillColor(COLORS.warning).fontSize(11).text('NOT VALID FOR TRAVEL', left + 14, y + 10);
    doc
      .fillColor(COLORS.text)
      .fontSize(9)
      .text(
        booking.paymentMethod === 'cash'
          ? `Present this voucher and pay BDT ${booking.payableAmount} in cash at the counter. Your ticket is issued once payment is collected.${booking.holdExpiresAt ? ` Seats are held until ${formatDateTime(new Date(booking.holdExpiresAt))}.` : ''}`
          : 'Your payment is awaiting verification. This becomes a valid ticket once our team confirms your transaction.',
        left + 14,
        y + 26,
        { width: width - 28 },
      );
    y += 70;
  }

  doc.image(qrBuffer, doc.page.width - 40 - 96, y, { width: 96 });

  doc.fillColor(COLORS.muted).fontSize(9).text('OPERATOR', left, y);
  doc.fillColor(COLORS.text).fontSize(14).text(booking.operator.name, left, y + 13);
  doc
    .fillColor(COLORS.muted)
    .fontSize(9)
    .text(`${booking.trip.busType} · ${booking.trip.acType}`, left, y + 32);

  y += 58;
  doc.fillColor(COLORS.muted).fontSize(9).text('JOURNEY', left, y);
  doc
    .fillColor(COLORS.text)
    .fontSize(16)
    .text(`${booking.route.from}  →  ${booking.route.to}`, left, y + 13);
  doc
    .fillColor(COLORS.muted)
    .fontSize(10)
    .text(formatDate(new Date(booking.journeyDate)), left, y + 34);

  y += 62;
  doc.moveTo(left, y).lineTo(left + width, y).strokeColor(COLORS.border).stroke();
  y += 16;

  const col2 = left + width / 2;
  doc.fillColor(COLORS.muted).fontSize(9).text('DEPARTURE', left, y);
  doc.fillColor(COLORS.text).fontSize(13).text(booking.trip.departureLabel, left, y + 13);
  doc.fillColor(COLORS.muted).fontSize(9).text('ARRIVAL (EST.)', col2, y);
  doc.fillColor(COLORS.text).fontSize(13).text(booking.trip.arrivalLabel, col2, y + 13);

  y += 40;
  doc.fillColor(COLORS.muted).fontSize(9).text('BOARDING POINT', left, y);
  doc
    .fillColor(COLORS.text)
    .fontSize(11)
    .text(`${booking.boardingPoint.name}, ${booking.boardingPoint.city}`, left, y + 13, {
      width: width / 2 - 10,
    });
  doc
    .fillColor(COLORS.muted)
    .fontSize(8)
    .text(`Arrive ${booking.boardingPoint.minutesBeforeDeparture} min early`, left, y + 29);

  doc.fillColor(COLORS.muted).fontSize(9).text('DROPPING POINT', col2, y);
  doc
    .fillColor(COLORS.text)
    .fontSize(11)
    .text(`${booking.droppingPoint.name}, ${booking.droppingPoint.city}`, col2, y + 13, {
      width: width / 2 - 10,
    });

  y += 54;
  doc.moveTo(left, y).lineTo(left + width, y).strokeColor(COLORS.border).stroke();
  y += 16;

  doc.fillColor(COLORS.muted).fontSize(9).text('PASSENGERS', left, y);
  y += 16;

  doc.fillColor(COLORS.muted).fontSize(8);
  doc.text('SEAT', left, y);
  doc.text('NAME', left + 70, y);
  doc.text('GENDER', left + 300, y);
  doc.text('AGE', left + 400, y);
  y += 14;

  for (const passenger of booking.passengers) {
    doc.fillColor(COLORS.text).fontSize(11);
    doc.text(passenger.seatNumber, left, y);
    doc.text(passenger.name, left + 70, y, { width: 220 });
    doc.text(passenger.gender, left + 300, y);
    doc.text(passenger.age ? String(passenger.age) : '-', left + 400, y);
    y += 18;
  }

  y += 8;
  doc.moveTo(left, y).lineTo(left + width, y).strokeColor(COLORS.border).stroke();
  y += 16;

  doc.fillColor(COLORS.muted).fontSize(9).text('FARE SUMMARY', left, y);
  y += 16;

  const rows: [string, string][] = [
    [`Fare (${booking.seatNumbers.length} × BDT ${booking.farePerSeat})`, `BDT ${booking.totalAmount}`],
    ['Service charge', `BDT ${booking.serviceCharge}`],
    ['Total payable', `BDT ${booking.payableAmount}`],
  ];

  for (const [label, value] of rows) {
    const isTotal = label === 'Total payable';
    doc.fillColor(isTotal ? COLORS.text : COLORS.muted).fontSize(isTotal ? 12 : 10);
    doc.text(label, left, y);
    doc.text(value, left, y, { width, align: 'right' });
    y += isTotal ? 20 : 16;
  }

  doc.fillColor(COLORS.muted).fontSize(9);
  doc.text(`Payment method: ${booking.paymentMethod.toUpperCase()}`, left, y);
  y += 14;
  if (payment?.trxId) {
    doc.text(`Transaction ID: ${payment.trxId}`, left, y);
    y += 14;
  }
  doc.text(`Status: ${booking.status.replace(/_/g, ' ')}`, left, y);
  y += 14;
  doc.text(`Contact: ${booking.contactName} · ${booking.contactPhone}`, left, y);

  const footerY = doc.page.height - 70;
  doc.moveTo(left, footerY).lineTo(left + width, footerY).strokeColor(COLORS.border).stroke();
  doc
    .fillColor(COLORS.muted)
    .fontSize(8)
    .text(
      `Show this ${isTicket ? 'ticket' : 'voucher'} at boarding. Support: ${env.payment.receiverNumber} · Generated ${formatDateTime(new Date())}`,
      left,
      footerY + 10,
      { width, align: 'center' },
    );
}
