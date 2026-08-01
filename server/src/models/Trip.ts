import { Schema, model, Document, Types } from 'mongoose';
import { BusType, AcType } from '../constants';

export interface ITrip extends Document {
  _id: Types.ObjectId;
  code: string;
  operator: Types.ObjectId;
  bus: Types.ObjectId;
  route: Types.ObjectId;
  departureTime: Date;
  arrivalTime: Date;
  /** "06:00" — kept denormalised for cheap listing and sorting. */
  departureLabel: string;
  arrivalLabel: string;
  busType: BusType;
  acType: AcType;
  fare: number;
  totalSeats: number;
  /** Seat numbers already sold on this trip. */
  bookedSeats: string[];
  boardingPoints: Types.ObjectId[];
  droppingPoints: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tripSchema = new Schema<ITrip>(
  {
    code: { type: String, required: true, index: true },
    operator: { type: Schema.Types.ObjectId, ref: 'Operator', required: true, index: true },
    bus: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
    route: { type: Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
    departureTime: { type: Date, required: true, index: true },
    arrivalTime: { type: Date, required: true },
    departureLabel: { type: String, required: true },
    arrivalLabel: { type: String, required: true },
    busType: { type: String, required: true },
    acType: { type: String, required: true },
    fare: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    bookedSeats: { type: [String], default: [] },
    boardingPoints: [{ type: Schema.Types.ObjectId, ref: 'BoardingPoint' }],
    droppingPoints: [{ type: Schema.Types.ObjectId, ref: 'DroppingPoint' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

tripSchema.index({ route: 1, departureTime: 1 });
tripSchema.index({ code: 1, departureTime: 1 }, { unique: true });

export const Trip = model<ITrip>('Trip', tripSchema);
