import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  profileImageUrl?: string;
  referralCode: string;
  referredBy?: Types.ObjectId | null;
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    profileImageUrl: { type: String },
    referralCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    walletBalance: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
