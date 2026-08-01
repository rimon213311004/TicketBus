import { Schema, model, Document, Types } from 'mongoose';

/**
 * Exclusive claim on one seat of one trip. The unique {trip, seatNumber} index is what
 * actually prevents double booking — two concurrent requests cannot both insert.
 *
 * A null `expiresAt` means the hold is permanent (seat sold). Mongo's TTL monitor only
 * reaps documents whose indexed field holds a Date, so null-valued holds survive.
 */
export interface ISeatHold extends Document {
  _id: Types.ObjectId;
  trip: Types.ObjectId;
  seatNumber: string;
  user: Types.ObjectId;
  booking?: Types.ObjectId;
  expiresAt?: Date | null;
  createdAt: Date;
}

const seatHoldSchema = new Schema<ISeatHold>(
  {
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    seatNumber: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

seatHoldSchema.index({ trip: 1, seatNumber: 1 }, { unique: true });
seatHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SeatHold = model<ISeatHold>('SeatHold', seatHoldSchema);
