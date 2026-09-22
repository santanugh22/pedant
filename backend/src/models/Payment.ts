import mongoose, { Document, Schema, Types } from 'mongoose';

export type PaymentStatus = 'created' | 'paid' | 'failed' | 'refunded';

export interface IPayment extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  competitionId: Types.ObjectId;
  registrationId: Types.ObjectId;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true, index: true },
    registrationId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, required: true, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
