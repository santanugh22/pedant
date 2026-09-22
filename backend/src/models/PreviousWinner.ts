import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPreviousWinner extends Document {
  _id: Types.ObjectId;
  competitionId: Types.ObjectId;
  name: string;
  photoUrl: string;
  videoUrl?: string;
  position: number;
  edition?: string;
  createdAt: Date;
}

const PreviousWinnerSchema = new Schema<IPreviousWinner>(
  {
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', required: true, index: true },
    name: { type: String, required: true, trim: true },
    photoUrl: { type: String, required: true },
    videoUrl: { type: String },
    position: { type: Number, required: true },
    edition: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

PreviousWinnerSchema.index({ competitionId: 1, position: 1 });

export const PreviousWinner = mongoose.model<IPreviousWinner>('PreviousWinner', PreviousWinnerSchema);
