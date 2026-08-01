import { Schema, model, Document, Types } from 'mongoose';
import { BUS_TYPES, BusType, AC_TYPES, AcType, AMENITIES, Amenity } from '../constants';

export interface IBus extends Document {
  _id: Types.ObjectId;
  operator: Types.ObjectId;
  registrationNumber: string;
  name: string;
  busType: BusType;
  acType: AcType;
  totalSeats: number;
  layout: string;
  amenities: Amenity[];
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const busSchema = new Schema<IBus>(
  {
    operator: { type: Schema.Types.ObjectId, ref: 'Operator', required: true, index: true },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    busType: { type: String, enum: BUS_TYPES, required: true },
    acType: { type: String, enum: AC_TYPES, required: true },
    totalSeats: { type: Number, required: true },
    layout: { type: String, required: true },
    amenities: [{ type: String, enum: AMENITIES }],
    images: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Bus = model<IBus>('Bus', busSchema);
