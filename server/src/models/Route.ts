import { Schema, model, Document, Types } from 'mongoose';

export interface IRoute extends Document {
  _id: Types.ObjectId;
  /** Stable public identifier, e.g. RT-DHK-CTG. */
  routeId: string;
  code: string;
  from: string;
  to: string;
  fromBn: string;
  toBn: string;
  fromDivision: string;
  toDivision: string;
  fromSlug: string;
  toSlug: string;
  slug: string;
  distanceKm: number;
  durationMinutes: number;
  /** Daily departures scheduled on this corridor. */
  departures: number;
  isPopular: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const routeSchema = new Schema<IRoute>(
  {
    routeId: { type: String, required: true, unique: true, uppercase: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    from: { type: String, required: true, trim: true, index: true },
    to: { type: String, required: true, trim: true, index: true },
    fromBn: { type: String, required: true },
    toBn: { type: String, required: true },
    fromDivision: { type: String, required: true, index: true },
    toDivision: { type: String, required: true, index: true },
    fromSlug: { type: String, required: true, lowercase: true },
    toSlug: { type: String, required: true, lowercase: true },
    slug: { type: String, required: true, lowercase: true, unique: true },
    distanceKm: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    departures: { type: Number, default: 3 },
    isPopular: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

routeSchema.index({ from: 1, to: 1 });

export const Route = model<IRoute>('Route', routeSchema);
