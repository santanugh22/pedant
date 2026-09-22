import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/db';
import { User } from '../models/User';
import { Competition } from '../models/Competition';
import { Registration } from '../models/Registration';
import { Payment } from '../models/Payment';
import { PreviousWinner } from '../models/PreviousWinner';
import { Testimonial } from '../models/Testimonial';
import { Referral } from '../models/Referral';
import { Submission } from '../models/Submission';
import { logger } from '../config/logger';

export async function seedDatabase(options: { isLarge?: boolean; clean?: boolean } = {}) {
  const { isLarge = false, clean = true } = options;

  if (clean) {
    logger.info('Cleaning existing collections before seeding...');
    await Promise.all([
      User.deleteMany({}),
      Competition.deleteMany({}),
      Registration.deleteMany({}),
      Payment.deleteMany({}),
      PreviousWinner.deleteMany({}),
      Testimonial.deleteMany({}),
      Referral.deleteMany({}),
      Submission.deleteMany({}),
    ]);
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const now = new Date();

  // ----------------------------------------------------
  // 1. Seed Demo Users
  // ----------------------------------------------------
  logger.info('Seeding users...');
  const userRegistered = await User.create({
    name: 'Siddharth Rao',
    email: 'registered@feedants.com',
    phone: '+919876543210',
    passwordHash,
    referralCode: 'SIDD123',
    walletBalance: 20,
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  });

  const userFresh = await User.create({
    name: 'Aanya Sharma',
    email: 'demo@feedants.com',
    phone: '+919876543211',
    passwordHash,
    referralCode: 'AANYA88',
    walletBalance: 0,
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  });

  const userSubmitted = await User.create({
    name: 'Rohan Mehra',
    email: 'creator@feedants.com',
    phone: '+919876543212',
    passwordHash,
    referralCode: 'ROHAN55',
    walletBalance: 10,
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
  });

  // Additional mock users for registrations
  const additionalUsers = await User.insertMany([
    {
      name: 'Pooja Hegde',
      email: 'pooja@feedants.com',
      passwordHash,
      referralCode: 'POOJA01',
      walletBalance: 0,
      profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    },
    {
      name: 'Aditya Roy',
      email: 'aditya@feedants.com',
      passwordHash,
      referralCode: 'ADITYA02',
      walletBalance: 10,
      profileImageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
    },
    {
      name: 'Tanvi Joshi',
      email: 'tanvi@feedants.com',
      passwordHash,
      referralCode: 'TANVI03',
      walletBalance: 30,
      profileImageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80',
    },
    {
      name: 'Kabir Verma',
      email: 'kabir@feedants.com',
      passwordHash,
      referralCode: 'KABIR04',
      walletBalance: 0,
      profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    },
  ]);

  // ----------------------------------------------------
  // 2. Primary Reference Competition: Feedants Classical Dance
  // ----------------------------------------------------
  logger.info('Seeding reference competition: Feedants Classical Dance...');
  const regStart = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const regEnd = new Date(now.getTime() + (1 * 24 * 3600 + 6 * 3600 + 28 * 60 + 32) * 1000);
  const subStart = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const subEnd = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
  const resDate = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);

  const classicalDance = await Competition.create({
    _id: new mongoose.Types.ObjectId('65a000000000000000000001'),
    title: 'Feedants Classical Dance',
    slug: 'feedants-classical-dance',
    category: 'Dance',
    tags: ['Dance', 'Multi-Win'],
    isMultiWin: true,
    winnersGetCertificate: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80',
    prizePool: 1500,
    entryFee: 99,
    currency: 'INR',
    totalSpots: 20,
    bookedSpots: 1, // 1/20 booked -> Exactly 19 spots left!
    dates: {
      registrationStart: regStart,
      registrationEnd: regEnd,
      submissionStart: subStart,
      submissionEnd: subEnd,
      resultDate: resDate,
    },
    judge: {
      name: 'Manju Dubey',
      title: 'Professional Kathak Dancer',
      experienceYears: 12,
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
      introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    description:
      'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',
    descriptionFull:
      'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance. Participants can perform any recognized Indian classical dance style including Kathak, Bharatanatyam, Odissi, Kuchipudi, Manipuri, or Mohiniyattam. Solo performances only. Video duration must be between 2 and 5 minutes.',
    judgingParameters: [
      'Rhythm (Taal) & Footwork precision (Tatkar)',
      'Expressions (Abhinaya) & Eye movements',
      'Posture (Anga Shuddhi) & Stage grace',
      'Choreography & Musicality',
      'Costume & Overall Presentation',
    ],
    rulesAndEligibility: [
      'Open to all age groups across India and internationally.',
      'Performance must be an authentic Indian classical dance form.',
      'Only original, unedited single-take video recordings are accepted.',
      'Video duration should be strictly between 2 to 5 minutes.',
      'Only contributions from paid participants will be considered for judging.',
    ],
    rewards: [
      { position: 1, label: '1st Winner', amount: 550 },
      { position: 2, label: '2nd Winner', amount: 300 },
      { position: 3, label: '3rd Winner', amount: 240 },
      { position: 4, label: '4th Winner', amount: 200 },
      { position: 5, label: '5th Winner', amount: 130 },
      { position: 6, label: '6th Winner', amount: 80 },
    ],
    disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
    prizeMoneyInfoVideoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    refundPolicyUrl: 'https://feedants.com/policies/refund',
    paymentPartner: 'Razorpay',
    publishStatus: 'published',
    seriesKey: 'classical-dance-series',
  });

  // Confirmed registration for userRegistered (reproduces the exact "✓ Registered" screenshot state!)
  const reg1 = await Registration.create({
    competitionId: classicalDance._id,
    userId: userRegistered._id,
    status: 'confirmed',
    entryFeePaid: 99,
    registeredAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
  });

  const pay1 = await Payment.create({
    userId: userRegistered._id,
    competitionId: classicalDance._id,
    registrationId: reg1._id,
    amount: 99,
    currency: 'INR',
    razorpayOrderId: 'order_seed_paid_001',
    razorpayPaymentId: 'pay_seed_paid_001',
    razorpaySignature: 'sig_seed_paid_001',
    status: 'paid',
  });
  reg1.paymentId = pay1._id;
  await reg1.save();

  // Confirmed registration + video submission for creator@feedants.com
  const regCreator = await Registration.create({
    competitionId: classicalDance._id,
    userId: userSubmitted._id,
    status: 'confirmed',
    entryFeePaid: 99,
    registeredAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
  });

  const payCreator = await Payment.create({
    userId: userSubmitted._id,
    competitionId: classicalDance._id,
    registrationId: regCreator._id,
    amount: 99,
    currency: 'INR',
    razorpayOrderId: 'order_seed_creator_001',
    razorpayPaymentId: 'pay_seed_creator_001',
    razorpaySignature: 'sig_seed_creator_001',
    status: 'paid',
  });
  regCreator.paymentId = payCreator._id;
  await regCreator.save();

  await Submission.create({
    competitionId: classicalDance._id,
    userId: userSubmitted._id,
    registrationId: regCreator._id,
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    mediaType: 'video',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&q=80',
    status: 'submitted',
    isEligibleForJudging: true,
    submittedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  });

  // Referral relationship
  await Referral.create({
    referrerId: userRegistered._id,
    referredUserId: userFresh._id,
    status: 'credited',
    rewardAmount: 20,
    creditedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
  });

  // ----------------------------------------------------
  // 3. Seed Previous Winners (matching Design_Reference.png cards)
  // ----------------------------------------------------
  logger.info('Seeding previous winners...');
  await PreviousWinner.insertMany([
    {
      competitionId: classicalDance._id,
      name: 'Riya Shah',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      position: 1,
      edition: 'Season 3',
    },
    {
      competitionId: classicalDance._id,
      name: 'Aarav Mehta',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      position: 1,
      edition: 'Season 2',
    },
    {
      competitionId: classicalDance._id,
      name: 'Neha Verma',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      position: 2,
      edition: 'Season 3',
    },
    {
      competitionId: classicalDance._id,
      name: 'Ishita Chouhan',
      photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      position: 3,
      edition: 'Season 3',
    },
  ]);

  // ----------------------------------------------------
  // 4. Seed Testimonials (10+ verified participant reviews)
  // ----------------------------------------------------
  logger.info('Seeding testimonials...');
  await Testimonial.insertMany([
    {
      name: 'Priya Nair',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      rating: 5,
      comment:
        'Winning 2nd place boosted my confidence immensely. The judging feedback from Manju Dubey was so detailed and encouraging!',
      competitionId: classicalDance._id,
    },
    {
      name: 'Rohan Sen',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
      rating: 5,
      comment:
        'Seamless registration and instant prize money crediting. Feedants is giving authentic classical artists the national recognition they deserve.',
      competitionId: classicalDance._id,
    },
    {
      name: 'Ananya Roy',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
      rating: 5,
      comment:
        'The verification process was transparent, and getting a verifiable winner certificate helped me secure dance academy enrollments.',
      competitionId: classicalDance._id,
    },
    {
      name: 'Vikramaditya Rao',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      rating: 5,
      comment:
        'As an Odissi performer, having dedicated judging criteria for posture and Anga Shuddhi was incredible.',
      competitionId: classicalDance._id,
    },
    {
      name: 'Meera Nambiar',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      rating: 5,
      comment:
        'I participated from Kerala and received prize money via UPI within 24 hours of results announcement. Highly recommend!',
      competitionId: classicalDance._id,
    },
    {
      name: 'Kunal Deshmukh',
      photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
      rating: 4,
      comment:
        'Great platform for classical vocalists and dancers. The live timer and deadline transparency made the whole journey stress-free.',
      competitionId: null,
    },
  ]);

  // ----------------------------------------------------
  // 5. Competitions Representing Key Lifecycle States
  // ----------------------------------------------------
  logger.info('Seeding varied lifecycle competitions...');

  // State A: Vocal Competition (Different Category: Music)
  await Competition.create({
    title: 'Feedants Hindustani Classical Vocal',
    slug: 'feedants-hindustani-classical-vocal',
    category: 'Music',
    tags: ['Music', 'Vocal', 'Multi-Win'],
    isMultiWin: true,
    winnersGetCertificate: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
    prizePool: 2500,
    entryFee: 149,
    currency: 'INR',
    totalSpots: 30,
    bookedSpots: 12,
    dates: {
      registrationStart: regStart,
      registrationEnd: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      submissionStart: subStart,
      submissionEnd: subEnd,
      resultDate: resDate,
    },
    judge: {
      name: 'Pandit Ravi Shankaran',
      title: 'Hindustani Classical Vocalist',
      experienceYears: 20,
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    },
    description: 'Showcase your vocal prowess with Ragas and traditional Bandish in this national level vocal challenge.',
    descriptionFull: 'Open to all classical vocalists. Solo singing with Tanpura accompaniment only. Record an unedited single take rendition of any classical Raga with Alaap and Bandish.',
    judgingParameters: ['Sur (Pitch accuracy)', 'Taal & Layakari', 'Alaap improvisation', 'Voice texture & Range'],
    rulesAndEligibility: ['Solo vocal only', 'Tanpura accompaniment mandatory', 'Duration 3-6 mins'],
    rewards: [
      { position: 1, label: '1st Winner', amount: 1000 },
      { position: 2, label: '2nd Winner', amount: 700 },
      { position: 3, label: '3rd Winner', amount: 500 },
      { position: 4, label: '4th Winner', amount: 300 },
    ],
    disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
    publishStatus: 'published',
  });

  // State B: Full Competition (bookedSpots === totalSpots) -> Proves "Registration Full"
  await Competition.create({
    title: 'Feedants Contemporary Fusion Solo',
    slug: 'feedants-contemporary-fusion-solo',
    category: 'Dance',
    tags: ['Contemporary', 'Full'],
    isMultiWin: false,
    winnersGetCertificate: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80',
    prizePool: 1000,
    entryFee: 79,
    currency: 'INR',
    totalSpots: 15,
    bookedSpots: 15, // FULL CAPACITY!
    dates: {
      registrationStart: regStart,
      registrationEnd: regEnd,
      submissionStart: subStart,
      submissionEnd: subEnd,
      resultDate: resDate,
    },
    judge: {
      name: 'Karan Mehra',
      title: 'Contemporary Choreographer',
      experienceYears: 8,
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    },
    description: 'An intense contemporary dance battle where creativity meets physical expression.',
    judgingParameters: ['Fluidity', 'Originality', 'Floor work technique'],
    rulesAndEligibility: ['Open to all performers', 'No props allowed'],
    rewards: [{ position: 1, label: '1st Winner', amount: 1000 }],
    disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
    publishStatus: 'published',
  });

  // State C: Concluded Competition (resultDate in past) -> Proves "View Results"
  await Competition.create({
    title: 'Feedants Folk Dance Extravaganza',
    slug: 'feedants-folk-dance-extravaganza',
    category: 'Dance',
    tags: ['Folk', 'Concluded'],
    isMultiWin: true,
    winnersGetCertificate: true,
    coverImageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    prizePool: 2000,
    entryFee: 99,
    currency: 'INR',
    totalSpots: 25,
    bookedSpots: 25,
    dates: {
      registrationStart: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      registrationEnd: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      submissionStart: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      submissionEnd: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      resultDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // RESULTS DECLARED!
    },
    judge: {
      name: 'Sunita Rao',
      title: 'Folk Dance Scholar',
      experienceYears: 18,
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
    description: 'Celebrating authentic regional folk dances of India.',
    judgingParameters: ['Authenticity', 'Energy', 'Costume & Props'],
    rulesAndEligibility: ['Traditional folk dance forms only'],
    rewards: [
      { position: 1, label: '1st Winner', amount: 1000 },
      { position: 2, label: '2nd Winner', amount: 600 },
      { position: 3, label: '3rd Winner', amount: 400 },
    ],
    disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
    publishStatus: 'published',
  });

  // State D: Competition with exactly 3 spots left (target for concurrency stress test)
  await Competition.create({
    title: 'Feedants Kathak Masters Championship',
    slug: 'feedants-kathak-masters-championship',
    category: 'Dance',
    tags: ['Kathak', 'Masters', 'Limited'],
    isMultiWin: true,
    winnersGetCertificate: true,
    prizePool: 3000,
    entryFee: 199,
    currency: 'INR',
    totalSpots: 10,
    bookedSpots: 7, // EXACTLY 3 SPOTS LEFT!
    dates: {
      registrationStart: regStart,
      registrationEnd: regEnd,
      submissionStart: subStart,
      submissionEnd: subEnd,
      resultDate: resDate,
    },
    judge: {
      name: 'Manju Dubey',
      title: 'Professional Kathak Dancer',
      experienceYears: 12,
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    },
    description: 'Elite championship for advanced Kathak solo performers.',
    judgingParameters: ['Chakkar precision', 'Layakari mastery', 'Abhinaya depth'],
    rulesAndEligibility: ['Minimum 5 years training required'],
    rewards: [
      { position: 1, label: '1st Winner', amount: 1500 },
      { position: 2, label: '2nd Winner', amount: 900 },
      { position: 3, label: '3rd Winner', amount: 600 },
    ],
    disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
    publishStatus: 'published',
  });

  // ----------------------------------------------------
  // 6. Large Data Expansion (10+ Additional Competitions)
  // ----------------------------------------------------
  if (isLarge) {
    logger.info('Generating expanded competition catalog (10+ additional competitions across disciplines)...');

    const extraCompetitions = [
      {
        title: 'Bharatanatyam Natya Tarangam',
        slug: 'bharatanatyam-natya-tarangam',
        category: 'Dance',
        tags: ['Bharatanatyam', 'Classical', 'Solo'],
        isMultiWin: true,
        winnersGetCertificate: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80',
        prizePool: 2000,
        entryFee: 119,
        currency: 'INR',
        totalSpots: 25,
        bookedSpots: 8,
        dates: {
          registrationStart: regStart,
          registrationEnd: new Date(now.getTime() + 3 * 24 * 3600 * 1000),
          submissionStart: subStart,
          submissionEnd: subEnd,
          resultDate: resDate,
        },
        judge: {
          name: 'Dr. Padmaja Suresh',
          title: 'Senior Bharatanatyam Guru',
          experienceYears: 22,
          photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
        },
        description: 'Explore traditional Margam items: Alarippu, Jatiswaram, Varnam, and Thillana.',
        judgingParameters: ['Aramandi posture', 'Hasta mudras', 'Bhavam', 'Talam adherence'],
        rulesAndEligibility: ['Solo Bharatanatyam items only', 'Duration 3-7 mins'],
        rewards: [
          { position: 1, label: '1st Winner', amount: 1000 },
          { position: 2, label: '2nd Winner', amount: 600 },
          { position: 3, label: '3rd Winner', amount: 400 },
        ],
        disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
        publishStatus: 'published',
      },
      {
        title: 'Odissi Pallavi & Abhinaya Cup',
        slug: 'odissi-pallavi-abhinaya-cup',
        category: 'Dance',
        tags: ['Odissi', 'Classical', 'Multi-Win'],
        isMultiWin: true,
        winnersGetCertificate: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80',
        prizePool: 1800,
        entryFee: 89,
        currency: 'INR',
        totalSpots: 20,
        bookedSpots: 5,
        dates: {
          registrationStart: regStart,
          registrationEnd: new Date(now.getTime() + 5 * 24 * 3600 * 1000),
          submissionStart: subStart,
          submissionEnd: subEnd,
          resultDate: resDate,
        },
        judge: {
          name: 'Sasmita Panda',
          title: 'Odissi Danseuse & Researcher',
          experienceYears: 16,
          photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
        },
        description: 'Graceful Tribhanga postures, Chawk footwork, and soulful Gita Govinda Abhinaya.',
        judgingParameters: ['Tribhanga balance', 'Chauka precision', 'Eye & neck movement (Bhedas)'],
        rulesAndEligibility: ['Authentic Odissi costume & jewellery mandatory'],
        rewards: [
          { position: 1, label: '1st Winner', amount: 900 },
          { position: 2, label: '2nd Winner', amount: 550 },
          { position: 3, label: '3rd Winner', amount: 350 },
        ],
        disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
        publishStatus: 'published',
      },
      {
        title: 'Carnatic Krithi & Raga Ragamalika',
        slug: 'carnatic-krithi-raga-ragamalika',
        category: 'Music',
        tags: ['Carnatic', 'Vocal', 'Trinity'],
        isMultiWin: true,
        winnersGetCertificate: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
        prizePool: 2200,
        entryFee: 129,
        currency: 'INR',
        totalSpots: 25,
        bookedSpots: 14,
        dates: {
          registrationStart: regStart,
          registrationEnd: new Date(now.getTime() + 6 * 24 * 3600 * 1000),
          submissionStart: subStart,
          submissionEnd: subEnd,
          resultDate: resDate,
        },
        judge: {
          name: 'Vidwan K. Narayanaswamy',
          title: 'A-Grade Carnatic Vocalist',
          experienceYears: 25,
          photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
        },
        description: 'Perform compositions of Saint Tyagaraja, Muthuswami Dikshitar, or Syama Sastri.',
        judgingParameters: ['Shruti alignment', 'Sahitya clarity', 'Neraval & Kalpanaswaras'],
        rulesAndEligibility: ['Shruti box / Tanpura mandatory', 'Duration 4-8 mins'],
        rewards: [
          { position: 1, label: '1st Winner', amount: 1100 },
          { position: 2, label: '2nd Winner', amount: 700 },
          { position: 3, label: '3rd Winner', amount: 400 },
        ],
        disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
        publishStatus: 'published',
      },
      {
        title: 'Sitar & Sarod Instrumental Rhapsody',
        slug: 'sitar-sarod-instrumental-rhapsody',
        category: 'Music',
        tags: ['Instrumental', 'Sitar', 'Strings'],
        isMultiWin: true,
        winnersGetCertificate: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
        prizePool: 3000,
        entryFee: 159,
        currency: 'INR',
        totalSpots: 20,
        bookedSpots: 6,
        dates: {
          registrationStart: regStart,
          registrationEnd: new Date(now.getTime() + 7 * 24 * 3600 * 1000),
          submissionStart: subStart,
          submissionEnd: subEnd,
          resultDate: resDate,
        },
        judge: {
          name: 'Ustad Shaukat Khan',
          title: 'Maihar Gharana Sitar Maestro',
          experienceYears: 24,
          photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        },
        description: 'Plucked string mastery: Meend, Gamak, Jhala and Gat in Drut Teentaal.',
        judgingParameters: ['Sur precision', 'Mizrab speed & clarity', 'Raga development'],
        rulesAndEligibility: ['Sitar, Sarod, or Surbahar only', 'Tabla accompaniment allowed'],
        rewards: [
          { position: 1, label: '1st Winner', amount: 1500 },
          { position: 2, label: '2nd Winner', amount: 1000 },
          { position: 3, label: '3rd Winner', amount: 500 },
        ],
        disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
        publishStatus: 'published',
      },
      {
        title: 'Tabla Solo & Layakari Clash',
        slug: 'tabla-solo-layakari-clash',
        category: 'Music',
        tags: ['Percussion', 'Tabla', 'Rhythm'],
        isMultiWin: true,
        winnersGetCertificate: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
        prizePool: 2400,
        entryFee: 119,
        currency: 'INR',
        totalSpots: 25,
        bookedSpots: 9,
        dates: {
          registrationStart: regStart,
          registrationEnd: new Date(now.getTime() + 8 * 24 * 3600 * 1000),
          submissionStart: subStart,
          submissionEnd: subEnd,
          resultDate: resDate,
        },
        judge: {
          name: 'Pt. Anindo Bose',
          title: 'Farrukhabad Gharana Virtuoso',
          experienceYears: 19,
          photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        },
        description: 'Peshar, Qaida, Rela, Tukda, and Chakradars presented in Teentaal or Roopak.',
        judgingParameters: ['Bayan tonal quality', 'Dayan clarity', 'Tihai mathematics'],
        rulesAndEligibility: ['Solo presentation with Lehra (harmonium or electronic)'],
        rewards: [
          { position: 1, label: '1st Winner', amount: 1200 },
          { position: 2, label: '2nd Winner', amount: 750 },
          { position: 3, label: '3rd Winner', amount: 450 },
        ],
        disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
        publishStatus: 'published',
      },
      {
        title: 'Mohiniyattam Kerala Lasya',
        slug: 'mohiniyattam-kerala-lasya',
        category: 'Dance',
        tags: ['Mohiniyattam', 'Kerala', 'Classical'],
        isMultiWin: true,
        winnersGetCertificate: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80',
        prizePool: 1600,
        entryFee: 89,
        currency: 'INR',
        totalSpots: 20,
        bookedSpots: 8,
        dates: {
          registrationStart: regStart,
          registrationEnd: new Date(now.getTime() + 5 * 24 * 3600 * 1000),
          submissionStart: subStart,
          submissionEnd: subEnd,
          resultDate: resDate,
        },
        judge: {
          name: 'Kalamandalam Radhika',
          title: 'Master Mohiniyattam Danseuse',
          experienceYears: 28,
          photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
        },
        description: 'Enchanting swaying movements (Andolika) depicting feminine grace (Lasya) in pure white and gold Kasavu attire.',
        judgingParameters: ['Chari (foot movements)', 'Mudra precision', 'Lasya abhinaya'],
        rulesAndEligibility: ['Authentic Kasavu saree attire mandatory', 'Duration 3-6 mins'],
        rewards: [
          { position: 1, label: '1st Winner', amount: 800 },
          { position: 2, label: '2nd Winner', amount: 500 },
          { position: 3, label: '3rd Winner', amount: 300 },
        ],
        disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
        publishStatus: 'published',
      },
      {
        title: 'Kuchipudi Brass Plate Tarangam',
        slug: 'kuchipudi-brass-plate-tarangam',
        category: 'Dance',
        tags: ['Kuchipudi', 'Andhra', 'Tarangam'],
        isMultiWin: true,
        winnersGetCertificate: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80',
        prizePool: 2200,
        entryFee: 129,
        currency: 'INR',
        totalSpots: 20,
        bookedSpots: 6,
        dates: {
          registrationStart: regStart,
          registrationEnd: new Date(now.getTime() + 6 * 24 * 3600 * 1000),
          submissionStart: subStart,
          submissionEnd: subEnd,
          resultDate: resDate,
        },
        judge: {
          name: 'Guru Vempati Ravi',
          title: 'Kuchipudi Art Academy Director',
          experienceYears: 21,
          photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
        },
        description: 'Showcase rhythmic agility dancing on the rims of a brass plate (Tarangam) while balancing expression and tala.',
        judgingParameters: ['Plate balance & rhythm', 'Jathi execution', 'Vachika abhinaya'],
        rulesAndEligibility: ['Solo Tarangam sequence only', 'Unedited video'],
        rewards: [
          { position: 1, label: '1st Winner', amount: 1100 },
          { position: 2, label: '2nd Winner', amount: 700 },
          { position: 3, label: '3rd Winner', amount: 400 },
        ],
        disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
        publishStatus: 'published',
      },
      {
        title: 'Bansuri Krishna Dhun Solo',
        slug: 'bansuri-krishna-dhun-solo',
        category: 'Music',
        tags: ['Flute', 'Wind', 'Classical'],
        isMultiWin: true,
        winnersGetCertificate: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80',
        prizePool: 1800,
        entryFee: 99,
        currency: 'INR',
        totalSpots: 20,
        bookedSpots: 10,
        dates: {
          registrationStart: regStart,
          registrationEnd: new Date(now.getTime() + 7 * 24 * 3600 * 1000),
          submissionStart: subStart,
          submissionEnd: subEnd,
          resultDate: resDate,
        },
        judge: {
          name: 'Pt. Ronu Majumdar',
          title: 'Grammy Nominated Flautist',
          experienceYears: 30,
          photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        },
        description: 'Soothing microtonal bamboo flute expressions across evening and night classical ragas.',
        judgingParameters: ['Tone warmth (Phook)', 'Gamak execution', 'Meend flow'],
        rulesAndEligibility: ['Indian bamboo flute (Bansuri) only'],
        rewards: [
          { position: 1, label: '1st Winner', amount: 900 },
          { position: 2, label: '2nd Winner', amount: 550 },
          { position: 3, label: '3rd Winner', amount: 350 },
        ],
        disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
        publishStatus: 'published',
      },
      {
        title: 'Kathakali Mudra & Facial Expressions',
        slug: 'kathakali-mudra-facial-expressions',
        category: 'Dance',
        tags: ['Kathakali', 'Kerala', 'Theatre'],
        isMultiWin: true,
        winnersGetCertificate: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
        prizePool: 2500,
        entryFee: 149,
        currency: 'INR',
        totalSpots: 15,
        bookedSpots: 7,
        dates: {
          registrationStart: regStart,
          registrationEnd: new Date(now.getTime() + 9 * 24 * 3600 * 1000),
          submissionStart: subStart,
          submissionEnd: subEnd,
          resultDate: resDate,
        },
        judge: {
          name: 'Sadanam Balakrishnan',
          title: 'Eminent Kathakali Guru',
          experienceYears: 35,
          photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        },
        description: 'Rigorous 24 basic Mudras and dramatic Navarasas expressed through eye movements, cheek twitches, and facial theatre.',
        judgingParameters: ['Eye movement control', 'Mudra clarity', 'Navarasa authenticity'],
        rulesAndEligibility: ['Solo Kathakali demonstration', 'Traditional or rehearsal attire permitted'],
        rewards: [
          { position: 1, label: '1st Winner', amount: 1300 },
          { position: 2, label: '2nd Winner', amount: 800 },
          { position: 3, label: '3rd Winner', amount: 400 },
        ],
        disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
        publishStatus: 'published',
      },
      {
        title: 'Ghoomar & Kalbeliya Rajasthani Folk',
        slug: 'ghoomar-kalbeliya-rajasthani-folk',
        category: 'Dance',
        tags: ['Folk', 'Rajasthan', 'Traditional'],
        isMultiWin: true,
        winnersGetCertificate: true,
        coverImageUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80',
        prizePool: 1700,
        entryFee: 89,
        currency: 'INR',
        totalSpots: 30,
        bookedSpots: 12,
        dates: {
          registrationStart: regStart,
          registrationEnd: new Date(now.getTime() + 10 * 24 * 3600 * 1000),
          submissionStart: subStart,
          submissionEnd: subEnd,
          resultDate: resDate,
        },
        judge: {
          name: 'Seema Shekhawat',
          title: 'Folk Academy Chairperson',
          experienceYears: 17,
          photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
        },
        description: 'Vibrant twirling pirouettes of Ghoomar and snake-like serpentine flexibility of Kalbeliya.',
        judgingParameters: ['Pirouette balance', 'Costume & Dupatta handling', 'Folk vitality'],
        rulesAndEligibility: ['Traditional Rajasthani folk dance only'],
        rewards: [
          { position: 1, label: '1st Winner', amount: 850 },
          { position: 2, label: '2nd Winner', amount: 550 },
          { position: 3, label: '3rd Winner', amount: 300 },
        ],
        disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
        publishStatus: 'published',
      },
    ];

    const insertedComps = await Competition.insertMany(extraCompetitions);

    // Seed previous winners for additional competitions
    const extraWinners = insertedComps.flatMap((comp, idx) => [
      {
        competitionId: comp._id,
        name: `Winner ${idx + 1}A`,
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        position: 1,
        edition: 'Season 1',
      },
      {
        competitionId: comp._id,
        name: `Winner ${idx + 1}B`,
        photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        position: 2,
        edition: 'Season 1',
      },
    ]);
    await PreviousWinner.insertMany(extraWinners);

    // Seed additional rich testimonials
    await Testimonial.insertMany([
      {
        name: 'Divya Krishnan',
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
        rating: 5,
        comment: 'The multi-tiered winner rewards motivate every dedicated performer. Highly organized platform!',
      },
      {
        name: 'Arjun Das',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
        rating: 5,
        comment: 'Uploading my video directly on mobile was frictionless. Received feedback within 48 hours.',
      },
      {
        name: 'Sunita Banerjee',
        photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80',
        rating: 4,
        comment: 'Loved the timer countdown and transparent spot counters. No guessing games on when spots fill up.',
      },
    ]);
  }

  const totalComps = await Competition.countDocuments();
  const totalUsers = await User.countDocuments();

  console.log('\n======================================================');
  console.log(` ✅ DATABASE SEED COMPLETE (${totalComps} Competitions, ${totalUsers} Users)`);
  console.log('======================================================');
  console.log('DEMO ACCOUNTS (Use for 1-Tap Sign In in App):');
  console.log('1. Seeded Registered User:');
  console.log('   Email:    registered@feedants.com');
  console.log('   Password: password123');
  console.log('   Status:   Paid & Confirmed for "Feedants Classical Dance"');
  console.log('   UI:       Shows "✓ Registered" pill & "Upload Submission" button');
  console.log('------------------------------------------------------');
  console.log('2. Fresh Unregistered User:');
  console.log('   Email:    demo@feedants.com');
  console.log('   Password: password123');
  console.log('   Status:   Unregistered');
  console.log('   UI:       Shows "Register Now – ₹99" button (test checkout flow)');
  console.log('------------------------------------------------------');
  console.log(`Reference Competition ID: ${classicalDance._id.toString()}`);
  console.log(`Reference Competition Slug: ${classicalDance.slug}`);
  console.log('======================================================\n');

  return {
    referenceCompetitionId: classicalDance._id.toString(),
    referenceCompetitionSlug: classicalDance.slug,
    totalCompetitions: totalComps,
  };
}

// Standalone CLI execution
if (require.main === module) {
  const isLarge = process.argv.includes('--large');
  connectDatabase()
    .then(() => seedDatabase({ isLarge, clean: true }))
    .then(() => disconnectDatabase())
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(`Seed failed: ${err.message}`);
      process.exit(1);
    });
}
