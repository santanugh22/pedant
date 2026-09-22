import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReward {
  position: number;
  label: string;
  amount: number;
}

export interface ICompetitionDates {
  registrationStart: Date;
  registrationEnd: Date;
  submissionStart: Date;
  submissionEnd: Date;
  resultDate: Date;
}

export interface IJudge {
  name: string;
  title: string;
  experienceYears: number;
  photoUrl: string;
  introVideoUrl?: string;
}

export interface ICompetition extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  isMultiWin: boolean;
  winnersGetCertificate: boolean;
  coverImageUrl?: string;
  prizePool: number;
  entryFee: number;
  currency: string;
  totalSpots: number;
  bookedSpots: number;
  dates: ICompetitionDates;
  judge: IJudge;
  description: string;
  descriptionFull?: string;
  judgingParameters: string[];
  rulesAndEligibility: string[];
  rewards: IReward[];
  disclaimer: string;
  prizeMoneyInfoVideoUrl?: string;
  refundPolicyUrl?: string;
  paymentPartner: string;
  publishStatus: 'draft' | 'published' | 'cancelled' | 'archived';
  seriesKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompetitionSchema = new Schema<ICompetition>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, trim: true }],
    isMultiWin: { type: Boolean, default: true },
    winnersGetCertificate: { type: Boolean, default: true },
    coverImageUrl: { type: String },
    prizePool: { type: Number, required: true, min: 0 },
    entryFee: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    totalSpots: { type: Number, required: true, min: 1 },
    bookedSpots: { type: Number, default: 0, min: 0 },
    dates: {
      registrationStart: { type: Date, required: true },
      registrationEnd: { type: Date, required: true },
      submissionStart: { type: Date, required: true },
      submissionEnd: { type: Date, required: true },
      resultDate: { type: Date, required: true },
    },
    judge: {
      name: { type: String, required: true },
      title: { type: String, required: true },
      experienceYears: { type: Number, required: true, min: 0 },
      photoUrl: { type: String, required: true },
      introVideoUrl: { type: String },
    },
    description: { type: String, required: true },
    descriptionFull: { type: String },
    judgingParameters: [{ type: String }],
    rulesAndEligibility: [{ type: String }],
    rewards: [
      {
        position: { type: Number, required: true },
        label: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    disclaimer: {
      type: String,
      default: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
    },
    prizeMoneyInfoVideoUrl: { type: String },
    refundPolicyUrl: { type: String },
    paymentPartner: { type: String, default: 'Razorpay' },
    publishStatus: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'archived'],
      default: 'published',
      index: true,
    },
    seriesKey: { type: String, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for listing active/open competitions efficiently
CompetitionSchema.index({ publishStatus: 1, 'dates.registrationEnd': 1 });

export const Competition = mongoose.model<ICompetition>('Competition', CompetitionSchema);
