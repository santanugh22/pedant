import { z } from 'zod';

export const competitionQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['all', 'open', 'closing_soon', 'concluded']).optional(),
  sortBy: z.enum(['closing_soon', 'prize_high', 'fee_low', 'spots_left', 'newest']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const createCompetitionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().min(2, 'Category is required'),
  tags: z.array(z.string()).default([]),
  isMultiWin: z.boolean().default(true),
  winnersGetCertificate: z.boolean().default(true),
  coverImageUrl: z.string().url().optional(),
  prizePool: z.number().min(0, 'Prize pool must be >= 0'),
  entryFee: z.number().min(0, 'Entry fee must be >= 0'),
  currency: z.string().default('INR'),
  totalSpots: z.number().min(1, 'Total spots must be >= 1'),
  dates: z.object({
    registrationStart: z.coerce.date().optional(),
    registrationEnd: z.coerce.date(),
    submissionStart: z.coerce.date().optional(),
    submissionEnd: z.coerce.date(),
    resultDate: z.coerce.date(),
  }),
  judge: z.object({
    name: z.string().min(2, 'Judge name is required'),
    title: z.string().min(2, 'Judge title/credentials required'),
    experienceYears: z.number().min(0).default(5),
    photoUrl: z.string().url().optional(),
    introVideoUrl: z.string().url().optional(),
  }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  descriptionFull: z.string().optional(),
  judgingParameters: z.array(z.string()).default([]),
  rulesAndEligibility: z.array(z.string()).default([]),
  rewards: z
    .array(
      z.object({
        position: z.number(),
        label: z.string(),
        amount: z.number(),
      })
    )
    .default([]),
  disclaimer: z.string().default('Disclaimer: Only contributions from paid participants will be considered for judging.'),
  prizeMoneyInfoVideoUrl: z.string().url().optional(),
  refundPolicyUrl: z.string().url().optional(),
  seriesKey: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  registrationId: z.string().min(10, 'Registration ID is required'),
  razorpayOrderId: z.string().min(5, 'Razorpay Order ID is required'),
  razorpayPaymentId: z.string().min(5, 'Razorpay Payment ID is required'),
  razorpaySignature: z.string().min(10, 'Razorpay Signature is required'),
});

export const presignSubmissionSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.enum(['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp'], {
    errorMap: () => ({ message: 'Only MP4/MOV videos and JPEG/PNG/WEBP images are accepted' }),
  }),
});

export const createSubmissionSchema = z.object({
  fileKey: z.string().min(1, 'File key/URL is required'),
  mediaType: z.enum(['video', 'image']),
});

export const redeemReferralSchema = z.object({
  referralCode: z.string().min(4, 'Valid referral code required'),
});
