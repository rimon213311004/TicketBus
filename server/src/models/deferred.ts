import { Schema, model } from 'mongoose';

/**
 * Schemas for modules scheduled after the booking slice. They are registered now so
 * references resolve and the collections exist, but no routes touch them yet.
 */

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true },
    maxDiscount: Number,
    minPurchase: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    validFrom: Date,
    validUntil: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export const Coupon = model('Coupon', couponSchema);

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    operator: { type: Schema.Types.ObjectId, ref: 'Operator', required: true, index: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true },
);
reviewSchema.index({ user: 1, booking: 1 }, { unique: true });
export const Review = model('Review', reviewSchema);

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    body: String,
    type: { type: String, default: 'info' },
    link: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);
export const Notification = model('Notification', notificationSchema);

const walletSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 },
    transactions: [
      {
        type: { type: String, enum: ['credit', 'debit'] },
        amount: Number,
        reason: String,
        createdAt: { type: Date },
      },
    ],
  },
  { timestamps: true },
);
export const Wallet = model('Wallet', walletSchema);

const refundSchema = new Schema(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['REQUESTED', 'APPROVED', 'REJECTED', 'PAID'], default: 'REQUESTED' },
    method: String,
    receiverNumber: String,
    reason: String,
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    processedAt: Date,
  },
  { timestamps: true },
);
export const Refund = model('Refund', refundSchema);

const driverSchema = new Schema(
  {
    operator: { type: Schema.Types.ObjectId, ref: 'Operator', required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    photo: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export const Driver = model('Driver', driverSchema);

const trackingSchema = new Schema(
  {
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    latitude: Number,
    longitude: Number,
    speedKmh: Number,
    recordedAt: { type: Date },
  },
  { timestamps: true },
);
export const Tracking = model('Tracking', trackingSchema);

const activityLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true },
    entity: String,
    entityId: String,
    metadata: Schema.Types.Mixed,
    ip: String,
  },
  { timestamps: true },
);
export const ActivityLog = model('ActivityLog', activityLogSchema);
