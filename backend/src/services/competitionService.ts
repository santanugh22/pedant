import mongoose from 'mongoose';
import { Competition, ICompetition } from '../models/Competition';
import { Registration } from '../models/Registration';
import { Submission } from '../models/Submission';
import { PreviousWinner } from '../models/PreviousWinner';
import { Testimonial } from '../models/Testimonial';
import { computeCompetitionLifecycle, computeUserCta, UserContext } from './lifecycleService';
import { NotFoundError } from '../utils/errors';
import { redis } from '../config/redis';
import { logger } from '../config/logger';

const COMPETITION_CACHE_TTL = 30; // seconds

export class CompetitionService {
  static async listCompetitions(category?: string, page = 1, limit = 10, userId?: string) {
    const query: any = { publishStatus: 'published' };
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const [competitions, total] = await Promise.all([
      Competition.find(query).sort({ 'dates.registrationEnd': 1 }).skip(skip).limit(limit).lean(),
      Competition.countDocuments(query),
    ]);

    let userRegistrationsSet = new Set<string>();
    if (userId) {
      const regDocs = await Registration.find({
        userId: new mongoose.Types.ObjectId(userId),
        status: { $in: ['pending_payment', 'confirmed'] },
      }).select('competitionId status');
      userRegistrationsSet = new Set(regDocs.map((r) => r.competitionId.toString()));
    }

    const now = new Date();
    const data = competitions.map((comp) => {
      const spotsLeft = Math.max(0, comp.totalSpots - comp.bookedSpots);
      const lifecycle = computeCompetitionLifecycle(comp, now);
      const isRegistered = userId ? userRegistrationsSet.has(comp._id.toString()) : false;

      return {
        id: comp._id.toString(),
        title: comp.title,
        slug: comp.slug,
        category: comp.category,
        tags: comp.tags,
        isMultiWin: comp.isMultiWin,
        winnersGetCertificate: comp.winnersGetCertificate,
        coverImageUrl: comp.coverImageUrl,
        prizePool: comp.prizePool,
        entryFee: comp.entryFee,
        currency: comp.currency,
        totalSpots: comp.totalSpots,
        bookedSpots: comp.bookedSpots,
        spotsLeft,
        dates: comp.dates,
        judge: comp.judge,
        lifecycle,
        isRegistered,
      };
    });

    return {
      competitions: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCompetitionById(idOrSlug: string, userId?: string) {
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    // 1. Fetch public competition data (check Redis cache first if available)
    const cacheKey = `competition:public:${idOrSlug}`;
    let comp: any = null;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        comp = JSON.parse(cached);
      }
    } catch (e: any) {
      logger.debug(`Cache read miss or error: ${e.message}`);
    }

    if (!comp) {
      const doc = await Competition.findOne(query).lean();
      if (!doc) {
        throw new NotFoundError('Competition not found');
      }
      comp = doc;
      try {
        await redis.setex(cacheKey, COMPETITION_CACHE_TTL, JSON.stringify(comp));
      } catch (e: any) {
        logger.debug(`Cache write error: ${e.message}`);
      }
    }

    const now = new Date();
    const spotsLeft = Math.max(0, comp.totalSpots - comp.bookedSpots);
    const lifecycle = computeCompetitionLifecycle(comp, now);

    // 2. Compute dynamic user context if user is authenticated
    let userContext: UserContext | undefined = undefined;

    if (userId) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const compObjectId = new mongoose.Types.ObjectId(comp._id);

      const [registration, submission] = await Promise.all([
        Registration.findOne({
          competitionId: compObjectId,
          userId: userObjectId,
          status: { $in: ['pending_payment', 'confirmed'] },
        }),
        Submission.findOne({
          competitionId: compObjectId,
          userId: userObjectId,
        }),
      ]);

      const ctaButton = computeUserCta(comp, registration, submission, now);

      userContext = {
        isAuthenticated: true,
        registrationStatus: registration ? registration.status : null,
        hasSubmitted: !!submission,
        submissionId: submission ? submission._id.toString() : null,
        ctaButton,
      };
    }

    return {
      id: comp._id.toString(),
      title: comp.title,
      slug: comp.slug,
      category: comp.category,
      tags: comp.tags,
      isMultiWin: comp.isMultiWin,
      winnersGetCertificate: comp.winnersGetCertificate,
      coverImageUrl: comp.coverImageUrl,
      prizePool: comp.prizePool,
      entryFee: comp.entryFee,
      currency: comp.currency,
      totalSpots: comp.totalSpots,
      bookedSpots: comp.bookedSpots,
      spotsLeft,
      dates: comp.dates,
      serverTime: now.toISOString(),
      lifecycle,
      judge: comp.judge,
      description: comp.description,
      descriptionFull: comp.descriptionFull,
      judgingParameters: comp.judgingParameters,
      rulesAndEligibility: comp.rulesAndEligibility,
      rewards: comp.rewards,
      disclaimer: comp.disclaimer,
      prizeMoneyInfoVideoUrl: comp.prizeMoneyInfoVideoUrl,
      refundPolicyUrl: comp.refundPolicyUrl,
      paymentPartner: comp.paymentPartner,
      ...(userContext ? { userContext } : {}),
    };
  }

  static async getWinners(competitionId: string, page = 1, limit = 10) {
    const compObjectId = new mongoose.Types.ObjectId(competitionId);
    const skip = (page - 1) * limit;

    const [winners, total] = await Promise.all([
      PreviousWinner.find({ competitionId: compObjectId }).sort({ position: 1 }).skip(skip).limit(limit).lean(),
      PreviousWinner.countDocuments({ competitionId: compObjectId }),
    ]);

    return {
      winners: winners.map((w) => ({
        id: w._id.toString(),
        name: w.name,
        photoUrl: w.photoUrl,
        videoUrl: w.videoUrl,
        position: w.position,
        edition: w.edition,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getTestimonials(competitionId?: string, page = 1, limit = 10) {
    const query: any = {};
    if (competitionId && mongoose.Types.ObjectId.isValid(competitionId)) {
      query.$or = [{ competitionId: new mongoose.Types.ObjectId(competitionId) }, { competitionId: null }];
    }

    const skip = (page - 1) * limit;
    const [testimonials, total] = await Promise.all([
      Testimonial.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Testimonial.countDocuments(query),
    ]);

    return {
      testimonials: testimonials.map((t) => ({
        id: t._id.toString(),
        name: t.name,
        photoUrl: t.photoUrl,
        rating: t.rating,
        comment: t.comment,
        videoUrl: t.videoUrl,
        createdAt: t.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
