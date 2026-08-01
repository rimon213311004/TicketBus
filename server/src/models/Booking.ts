import { Schema, model, Document, Types } from 'mongoose';
import { BOOKING_STATUSES, BookingStatus, PAYMENT_METHODS, PaymentMethod, GENDERS, Gender } from '../constants';

export interface IPassengerInfo {
  name: string;
  age?: number;
  gender: Gender;
  seatNumber: string;
}

export interface IBooking extends Document {
  _id: Types.ObjectId;
  bookingCode: string;
  user: Types.ObjectId;
  trip: Types.ObjectId;
  operator: Types.ObjectId;
  route: Types.ObjectId;
  seatNumbers: string[];
  passengers: IPassengerInfo[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  boardingPoint: Types.ObjectId;
  droppingPoint: Types.ObjectId;
  farePerSeat: number;
  totalAmount: number;
  serviceCharge: number;
  discount: number;
  payableAmount: number;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  /** When the seat hold lapses while status is PENDING_PAYMENT. */
  holdExpiresAt?: Date | null;
  journeyDate: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const passengerInfoSchema = new Schema<IPassengerInfo>(
  {
    name: { type: String, required: true, trim: true },
    age: Number,
    gender: { type: String, enum: GENDERS, required: true },
    seatNumber: { type: String, required: true },
  },
  { _id: false },
);

const bookingSchema = new Schema<IBooking>(
  {
    bookingCode: { type: String, required: true, unique: true, uppercase: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    operator: { type: Schema.Types.ObjectId, ref: 'Operator', required: true },
    route: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
    seatNumbers: { type: [String], required: true },
    passengers: { type: [passengerInfoSchema], required: true },
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true, lowercase: true },
    boardingPoint: { type: Schema.Types.ObjectId, ref: 'BoardingPoint', required: true },
    droppingPoint: { type: Schema.Types.ObjectId, ref: 'DroppingPoint', required: true },
    farePerSeat: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    serviceCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    payableAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    status: { type: String, enum: BOOKING_STATUSES, default: 'PENDING_PAYMENT', index: true },
    holdExpiresAt: { type: Date, default: null },
    journeyDate: { type: Date, required: true },
    cancelledAt: Date,
    cancellationReason: String,
    confirmedAt: Date,
  },
  { timestamps: true },
);

export const Booking = model<IBooking>('Booking', bookingSchema);
