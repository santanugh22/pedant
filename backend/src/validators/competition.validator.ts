import { z } from 'zod';

export const competitionQuerySchema = z.object({
  category: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
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
