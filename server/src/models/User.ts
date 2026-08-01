import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES, UserRole } from '../constants';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  avatar?: string;
  operator?: Types.ObjectId;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 4, select: false },
    role: { type: String, enum: USER_ROLES, default: 'customer' },
    avatar: String,
    operator: { type: Schema.Types.ObjectId, ref: 'Operator' },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>('User', userSchema);
