import request from 'supertest';
import app from '../../src/app';
import { connectDatabase, disconnectDatabase } from '../../src/config/db';
import { Competition } from '../../src/models/Competition';
import { User } from '../../src/models/User';
import { Registration } from '../../src/models/Registration';
import { Payment } from '../../src/models/Payment';

describe('Feedants API End-to-End Integration Tests', () => {
  let userToken: string;
  let userId: string;
  let competitionId: string;
  let registrationId: string;
  let orderId: string;

  beforeAll(async () => {
    await connectDatabase();

    // Clean test state
    await User.deleteMany({});
    await Competition.deleteMany({});
    await Registration.deleteMany({});
    await Payment.deleteMany({});

    // Create a live test competition
    const now = new Date();
    const comp = await Competition.create({
      title: 'Integration Test Classical Dance',
      slug: 'integration-test-classical-dance',
      category: 'Dance',
      tags: ['Dance', 'Multi-Win'],
      isMultiWin: true,
      winnersGetCertificate: true,
      prizePool: 1500,
      entryFee: 99,
      totalSpots: 20,
      bookedSpots: 0,
      dates: {
        registrationStart: new Date(now.getTime() - 24 * 3600 * 1000),
        registrationEnd: new Date(now.getTime() + 24 * 3600 * 1000),
        submissionStart: new Date(now.getTime() - 12 * 3600 * 1000),
        submissionEnd: new Date(now.getTime() + 48 * 3600 * 1000),
        resultDate: new Date(now.getTime() + 72 * 3600 * 1000),
      },
      judge: {
        name: 'Manju Dubey',
        title: 'Professional Kathak Dancer',
        experienceYears: 12,
        photoUrl: 'https://example.com/manju.jpg',
      },
      description: 'Test description for classical dance.',
      rewards: [
        { position: 1, label: '1st Winner', amount: 550 },
        { position: 2, label: '2nd Winner', amount: 300 },
      ],
      disclaimer: 'Disclaimer: Only contributions from paid participants will be considered for judging.',
      paymentPartner: 'Razorpay',
      publishStatus: 'published',
    });
    competitionId = comp._id.toString();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('GET /health', () => {
    it('returns healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
    });
  });

  describe('Auth Endpoints', () => {
    it('registers a new user successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          name: 'Integration User',
          email: 'integration@feedants.test',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('integration@feedants.test');
      expect(res.body.data.accessToken).toBeDefined();

      userToken = res.body.data.accessToken;
      userId = res.body.data.user.id;
    });

    it('logs in the user and fetches profile via /auth/me', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'integration@feedants.test',
          password: 'password123',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);

      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.data.id).toBe(userId);
    });
  });

  describe('Competition Read Endpoints', () => {
    it('lists competitions publicly', async () => {
      const res = await request(app).get('/api/v1/competitions');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('fetches competition details with unauthenticated guest context (omitted userContext)', async () => {
      const res = await request(app).get(`/api/v1/competitions/${competitionId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Integration Test Classical Dance');
      expect(res.body.data.spotsLeft).toBe(20);
      expect(res.body.data.userContext).toBeUndefined();
    });

    it('fetches competition details with authenticated context (unregistered CTA)', async () => {
      const res = await request(app)
        .get(`/api/v1/competitions/${competitionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.userContext).toBeDefined();
      expect(res.body.data.userContext.isAuthenticated).toBe(true);
      expect(res.body.data.userContext.registrationStatus).toBeNull();
      expect(res.body.data.userContext.ctaButton.action).toBe('REGISTER');
      expect(res.body.data.userContext.ctaButton.label).toBe('Register Now – ₹99');
    });
  });

  describe('Registration & Payment Lifecycle Flow', () => {
    it('reserves a spot and creates a pending registration', async () => {
      const res = await request(app)
        .post(`/api/v1/competitions/${competitionId}/register`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.registrationId).toBeDefined();
      expect(res.body.data.razorpayOrderId).toBeDefined();

      registrationId = res.body.data.registrationId;
      orderId = res.body.data.razorpayOrderId;

      // Verify competition spotsLeft decreased to 19
      const compRes = await request(app).get(`/api/v1/competitions/${competitionId}`);
      expect(compRes.body.data.bookedSpots).toBe(1);
      expect(compRes.body.data.spotsLeft).toBe(19);
    });

    it('verifies payment and confirms registration', async () => {
      const res = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          registrationId,
          razorpayOrderId: orderId,
          razorpayPaymentId: 'pay_test_12345',
          razorpaySignature: 'test_mock_signature',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userContext.registrationStatus).toBe('confirmed');
      expect(res.body.data.userContext.ctaButton.label).toBe('Upload Submission');
      expect(res.body.data.userContext.ctaButton.subLabel).toBe('Registered');
      expect(res.body.data.userContext.ctaButton.action).toBe('UPLOAD_SUBMISSION');
    });
  });

  describe('Submissions Flow', () => {
    let uploadTarget: any;

    it('generates presigned/local upload target for confirmed user', async () => {
      const res = await request(app)
        .post(`/api/v1/competitions/${competitionId}/submissions/presign`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fileName: 'my_dance_performance.mp4',
          fileType: 'video/mp4',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.fileKey).toBeDefined();
      expect(res.body.data.uploadUrl).toBeDefined();

      uploadTarget = res.body.data;
    });

    it('records entry submission and marks isEligibleForJudging=true for paid participant', async () => {
      const res = await request(app)
        .post(`/api/v1/competitions/${competitionId}/submissions`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          fileKey: uploadTarget.fileKey,
          mediaType: 'video',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isEligibleForJudging).toBe(true);
      expect(res.body.data.status).toBe('submitted');

      // Check updated CTA status
      const compRes = await request(app)
        .get(`/api/v1/competitions/${competitionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(compRes.body.data.userContext.hasSubmitted).toBe(true);
      expect(compRes.body.data.userContext.ctaButton.label).toBe('Edit Submission');
    });
  });

  describe('Referral System', () => {
    it('retrieves user referral code and link', async () => {
      const res = await request(app)
        .get('/api/v1/referrals/me/referral')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.referralCode).toBeDefined();
      expect(res.body.data.referralLink).toContain(res.body.data.referralCode);
    });
  });
});
