import mongoose, { Document, Schema, Types } from 'mongoose';

export type SubmissionStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'disqualified';

export interface ISubmission extends Document {
  _id: Types.ObjectId;
  competitionId: Types.ObjectId;
  userId: Types.ObjectId;
  registrationId: Types.ObjectId;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  thumbnailUrl?: string;
  status: SubmissionStatus;
  isEligibleForJudging: boolean;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    registrationId: { type: Schema.Types.ObjectId, ref: 'Registration', required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['video', 'image'], required: true },
    thumbnailUrl: { type: String },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected', 'disqualified'],
      default: 'submitted',
      required: true,
    },
    isEligibleForJudging: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// One active submission per user per competition
SubmissionSchema.index({ competitionId: 1, userId: 1 }, { unique: true });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
