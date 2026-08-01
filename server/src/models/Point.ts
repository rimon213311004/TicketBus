import { Schema, model, Document, Types } from 'mongoose';

/** Shared shape for boarding and dropping locations. */
interface PointFields {
  /** Stable public identifier, e.g. TRM-DHK-001. */
  terminalId: string;
  /** District/city the point belongs to — matches Route.from / Route.to. */
  city: string;
  division: string;
  upazila: string;
  name: string;
  address: string;
  slug: string;
  districtSlug: string;
  divisionSlug: string;
  lat: number;
  lng: number;
  phone: string;
  kind: 'terminal' | 'counter';
  isActive: boolean;
}

export interface IBoardingPoint extends Document, PointFields {
  _id: Types.ObjectId;
  code: string;
  minutesBeforeDeparture: number;
  createdAt: Date;
  updatedAt: Date;
}

const pointFields = {
  terminalId: { type: String, required: true, index: true },
  city: { type: String, required: true, index: true },
  division: { type: String, required: true, index: true },
  upazila: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  slug: { type: String, required: true, lowercase: true },
  districtSlug: { type: String, required: true, lowercase: true, index: true },
  divisionSlug: { type: String, required: true, lowercase: true, index: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  phone: { type: String, required: true },
  kind: { type: String, enum: ['terminal', 'counter'] as const, default: 'terminal' as const },
  isActive: { type: Boolean, default: true },
};

const boardingPointSchema = new Schema<IBoardingPoint>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    ...pointFields,
    minutesBeforeDeparture: { type: Number, default: 20 },
  },
  { timestamps: true },
);

boardingPointSchema.index({ city: 1, name: 1 }, { unique: true });

export const BoardingPoint = model<IBoardingPoint>('BoardingPoint', boardingPointSchema);

export interface IDroppingPoint extends Document, PointFields {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const droppingPointSchema = new Schema<IDroppingPoint>({ ...pointFields }, { timestamps: true });

droppingPointSchema.index({ city: 1, name: 1 }, { unique: true });

export const DroppingPoint = model<IDroppingPoint>('DroppingPoint', droppingPointSchema);
