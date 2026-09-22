import mongoose, { Document, Schema, Types } from 'mongoose';

export type ReferralStatus = 'pending' | 'credited';

export interface IReferral extends Document {
  _id: Types.ObjectId;
  referrerId: Types.ObjectId;
  referredUserId: Types.ObjectId;
  status: ReferralStatus;
  rewardAmount: number;
  creditedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    referredUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    status: { type: String, enum: ['pending', 'credited'], default: 'pending', required: true },
    rewardAmount: { type: Number, required: true, min: 0 },
    creditedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

ReferralSchema.index({ referrerId: 1 });

export const Referral = mongoose.model<IReferral>('Referral', ReferralSchema);
