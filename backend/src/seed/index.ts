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

async function seed() {
  logger.info('Connecting to database for seeding...');
  await connectDatabase();

  logger.info('Cleaning existing collections...');
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

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Demo Users
  logger.info('Seeding demo users...');
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

  // Calculate dynamic live dates anchored to current time
  // Registration closes in ~1 day 6 hours 28 mins to match the reference countdown!
  const now = new Date();
  const regStart = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
  const regEnd = new Date(now.getTime() + (1 * 24 * 3600 + 6 * 3600 + 28 * 60 + 32) * 1000); // in 1d 6h 28m 32s
  const subStart = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000); // 4 days ago (active now!)
  const subEnd = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // in 15 days
  const resDate = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000); // in 20 days

  // 2. Primary Reference Competition: Feedants Classical Dance
  logger.info('Seeding reference competition: Feedants Classical Dance...');
  const classicalDance = await Competition.create({
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
    bookedSpots: 1, // 1/20 booked -> Only 19 spots left!
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

  // 3. Register userRegistered for Feedants Classical Dance to replicate the screenshot
  const regDoc = await Registration.create({
    competitionId: classicalDance._id,
    userId: userRegistered._id,
    status: 'confirmed',
    entryFeePaid: 99,
    registeredAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
  });

  const paymentDoc = await Payment.create({
    userId: userRegistered._id,
    competitionId: classicalDance._id,
    registrationId: regDoc._id,
    amount: 99,
    currency: 'INR',
    razorpayOrderId: 'order_seed_paid_001',
    razorpayPaymentId: 'pay_seed_paid_001',
    razorpaySignature: 'sig_seed_paid_001',
    status: 'paid',
  });
  regDoc.paymentId = paymentDoc._id;
  await regDoc.save();

  // 4. Seed Previous Winners matching the design reference cards
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

  // 5. Seed Testimonials
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
  ]);

  // 6. Seed Second Competition: Different Category (Music)
  logger.info('Seeding second competition: Hindustani Classical Vocal...');
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
    },
    description: 'Showcase your vocal prowess with Ragas and traditional Bandish in this national level vocal challenge.',
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

  // 7. Seed Full Competition (bookedSpots === totalSpots) to prove "Registration Full" state
  logger.info('Seeding full competition for Registration Full testing...');
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
    bookedSpots: 15, // FULL!
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

  // 8. Seed Concluded Competition (resultDate in past) to prove "View Results" state
  logger.info('Seeding past competition for View Results testing...');
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
      resultDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Results declared!
    },
    judge: {
      name: 'Sunita Rao',
      title: 'Folk Dance Scholar',
      experienceYears: 18,
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
    description: 'Celebrating regional folk dances of India.',
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

  // 9. Seed Competition with 3 spots left for concurrency testing
  logger.info('Seeding competition with exactly 3 spots left for concurrency race tests...');
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
    description: 'Elite competition for advanced Kathak dancers.',
    judgingParameters: ['Chakkar precision', 'Layakari mastery', 'Abhinaya depth'],
    rulesAndEligibility: ['Minimum 5 years of training required'],
    rewards: [
      { position: 1, label: '1st Winner', amount: 1500 },
      { position: 2, label: '2nd Winner', amount: 900 },
      { position: 3, label: '3rd Winner', amount: 600 },
    ],
    disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
    publishStatus: 'published',
  });

  console.log('\n======================================================');
  console.log(' SEEDING COMPLETE! DEMO CREDENTIALS:');
  console.log('======================================================');
  console.log('1. Seeded Registered User (shows "✓ Registered" & "Upload Submission"):');
  console.log('   Email:    registered@feedants.com');
  console.log('   Password: password123');
  console.log('   Status:   Paid & Confirmed for Feedants Classical Dance');
  console.log('------------------------------------------------------');
  console.log('2. Fresh Unregistered User (for testing registration & payment):');
  console.log('   Email:    demo@feedants.com');
  console.log('   Password: password123');
  console.log('   Status:   Unregistered');
  console.log('------------------------------------------------------');
  console.log(`Reference Competition ID: ${classicalDance._id.toString()}`);
  console.log(`Reference Competition Slug: ${classicalDance.slug}`);
  console.log('======================================================\n');

  await disconnectDatabase();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error(`Seed failed: ${err.message}`);
    process.exit(1);
  });
