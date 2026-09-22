import mongoose from 'mongoose';
import { User } from '../models/User';
import { Referral } from '../models/Referral';
import { env } from '../config/env';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';

export class ReferralService {
  static async getMyReferral(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const referrals = await Referral.find({ referrerId: user._id });
    const totalEarned = referrals
      .filter((r) => r.status === 'credited')
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    const referralLink = `https://feedants.com/r/${user.referralCode}`;

    return {
      referralCode: user.referralCode,
      referralLink,
      rewardAmount: env.REFERRAL_REWARD_AMOUNT,
      totalEarned: user.walletBalance || totalEarned,
      totalReferrals: referrals.length,
      successfulReferrals: referrals.filter((r) => r.status === 'credited').length,
    };
  }

  static async redeem(referralCode: string, newUserId: string) {
    const userObjectId = new mongoose.Types.ObjectId(newUserId);
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });

    if (!referrer) {
      throw new NotFoundError('Invalid referral code');
    }

    if (referrer._id.toString() === newUserId) {
      throw new ValidationError('Self-referral is not permitted');
    }

    const alreadyReferred = await Referral.findOne({ referredUserId: userObjectId });
    if (alreadyReferred) {
      return { status: 'already_referred' };
    }

    const referral = await Referral.create({
      referrerId: referrer._id,
      referredUserId: userObjectId,
      status: 'pending',
      rewardAmount: env.REFERRAL_REWARD_AMOUNT,
    });

    await User.findByIdAndUpdate(userObjectId, { referredBy: referrer._id });

    return { status: 'success', referralId: referral._id.toString() };
  }
}
