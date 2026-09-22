import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { Referral } from '../models/Referral';
import { env } from '../config/env';
import { generateReferralCode } from '../utils/codeGenerator';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors';
import { SignupInput, LoginInput } from '../validators/auth.validator';

export class AuthService {
  static async signup(input: SignupInput) {
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new ConflictError('VALIDATION_ERROR', 'A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
    let referralCode = generateReferralCode();

    // Ensure referral code is unique
    let codeCollision = await User.findOne({ referralCode });
    while (codeCollision) {
      referralCode = generateReferralCode();
      codeCollision = await User.findOne({ referralCode });
    }

    let referrer: IUser | null = null;
    if (input.referralCode) {
      referrer = await User.findOne({ referralCode: input.referralCode.toUpperCase() });
    }

    const user = await User.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      referralCode,
      referredBy: referrer ? referrer._id : null,
      walletBalance: 0,
    });

    // If referred by a valid user, create pending Referral record
    if (referrer) {
      // Reject self-referral just in case
      if (referrer._id.toString() !== user._id.toString()) {
        await Referral.create({
          referrerId: referrer._id,
          referredUserId: user._id,
          status: 'pending',
          rewardAmount: env.REFERRAL_REWARD_AMOUNT,
        });
      }
    }

    const payload = { userId: user._id.toString(), email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        walletBalance: user.walletBalance,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(input: LoginInput) {
    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const payload = { userId: user._id.toString(), email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        walletBalance: user.walletBalance,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refresh(token: string) {
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    const newAccessToken = signAccessToken({ userId: user._id.toString(), email: user.email });
    return { accessToken: newAccessToken };
  }

  static async getMe(userId: string) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const referralCount = await Referral.countDocuments({ referrerId: user._id });

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImageUrl: user.profileImageUrl,
      referralCode: user.referralCode,
      walletBalance: user.walletBalance,
      referralCount,
      createdAt: user.createdAt,
    };
  }
}
