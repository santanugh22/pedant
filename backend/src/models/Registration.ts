import mongoose, { Document, Schema, Types } from 'mongoose';

export type RegistrationStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'expired'
  | 'cancelled'
  | 'refunded';

export interface IRegistration extends Document {
  _id: Types.ObjectId;
  competitionId: Types.ObjectId;
  userId: Types.ObjectId;
  status: RegistrationStatus;
  entryFeePaid: number;
  paymentId?: Types.ObjectId;
  registeredAt: Date;
  confirmedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'expired', 'cancelled', 'refunded'],
      default: 'pending_payment',
      required: true,
      index: true,
    },
    entryFeePaid: { type: Number, required: true, min: 0 },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    registeredAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date },
    expiresAt: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Concurrency-critical partial unique index:
// Guarantees at the database engine level that no user can hold two simultaneous active (pending or confirmed)
// registrations for the same competition, while permitting re-registration if a prior hold expired or was cancelled.
RegistrationSchema.index(
  { competitionId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending_payment', 'confirmed'] },
    },
  }
);

// Index for expiry sweep jobs
RegistrationSchema.index({ status: 1, expiresAt: 1 });

export const Registration = mongoose.model<IRegistration>('Registration', RegistrationSchema);
