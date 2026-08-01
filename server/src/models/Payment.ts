import { Schema, model, Document, Types } from 'mongoose';
import { PAYMENT_METHODS, PaymentMethod, PAYMENT_STATUSES, PaymentStatus } from '../constants';

export interface IPayment extends Document {
  _id: Types.ObjectId;
  booking: Types.ObjectId;
  user: Types.ObjectId;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  /** Mobile number the customer sent the money from. Absent for cash. */
  senderNumber?: string;
  /** Mobile-banking TrxID or bank deposit slip reference. Absent for cash. */
  trxId?: string;
  receiverNumber?: string;
  bankName?: string;
  bankAccountName?: string;
  submittedAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  /** Set by counter staff when cash is collected. */
  collectedBy?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'PENDING', index: true },
    senderNumber: String,
    trxId: { type: String, uppercase: true, trim: true },
    receiverNumber: String,
    bankName: String,
    bankAccountName: String,
    submittedAt: Date,
    verifiedAt: Date,
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: Date,
    rejectionReason: String,
    collectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: String,
  },
  { timestamps: true },
);

// A transaction ID can only ever be claimed once. Partial index so the many cash
// payments (which have no trxId) don't collide with each other on null.
paymentSchema.index(
  { trxId: 1 },
  { unique: true, partialFilterExpression: { trxId: { $type: 'string' } } },
);

export const Payment = model<IPayment>('Payment', paymentSchema);
