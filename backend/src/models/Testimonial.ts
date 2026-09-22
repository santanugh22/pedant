import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITestimonial extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  name: string;
  photoUrl?: string;
  rating?: number;
  comment: string;
  videoUrl?: string;
  competitionId?: Types.ObjectId;
  createdAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    photoUrl: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, required: true },
    videoUrl: { type: String },
    competitionId: { type: Schema.Types.ObjectId, ref: 'Competition', index: true },
  },
  {
    timestamps: true,
  }
);

TestimonialSchema.index({ competitionId: 1, createdAt: -1 });

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
