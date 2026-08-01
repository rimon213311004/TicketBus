import { Schema, model, Document, Types } from 'mongoose';

export interface IOperator extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  /** Every coach photo for this operator, used by the fleet gallery. */
  gallery: string[];
  description?: string;
  hasAc: boolean;
  hasNonAc: boolean;
  hasSleeper: boolean;
  rating: number;
  totalReviews: number;
  contactPhone?: string;
  contactEmail?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const operatorSchema = new Schema<IOperator>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: String,
    coverImage: String,
    gallery: { type: [String], default: [] },
    description: String,
    hasAc: { type: Boolean, default: true },
    hasNonAc: { type: Boolean, default: false },
    hasSleeper: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    contactPhone: String,
    contactEmail: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Operator = model<IOperator>('Operator', operatorSchema);
