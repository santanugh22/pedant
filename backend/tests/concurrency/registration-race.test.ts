import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../../src/config/db';
import { Competition } from '../../src/models/Competition';
import { User } from '../../src/models/User';
import { Registration } from '../../src/models/Registration';
import { Payment } from '../../src/models/Payment';
import { RegistrationService } from '../../src/services/registrationService';

describe('Concurrency & Data Consistency: Registration Race Condition', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it('never overbooks a competition under concurrent registration attempts (20 users competing for 3 spots)', async () => {
    // 1. Setup competition with exactly 3 spots left
    const now = new Date();
    const competition = await Competition.create({
      title: 'Concurrency Stress Test Competition',
      slug: `concurrency-test-${Date.now()}`,
      category: 'Dance',
      tags: ['Test'],
      prizePool: 1000,
      entryFee: 99,
      totalSpots: 10,
      bookedSpots: 7, // Exactly 3 spots remaining!
      dates: {
        registrationStart: new Date(now.getTime() - 24 * 3600 * 1000),
        registrationEnd: new Date(now.getTime() + 24 * 3600 * 1000),
        submissionStart: new Date(now.getTime() - 12 * 3600 * 1000),
        submissionEnd: new Date(now.getTime() + 48 * 3600 * 1000),
        resultDate: new Date(now.getTime() + 72 * 3600 * 1000),
      },
      judge: {
        name: 'Judge Test',
        title: 'Judge Title',
        experienceYears: 10,
        photoUrl: 'https://example.com/photo.jpg',
      },
      description: 'Test description',
      rewards: [{ position: 1, label: '1st', amount: 500 }],
      disclaimer: 'Disclaimer',
      paymentPartner: 'Razorpay',
      publishStatus: 'published',
    });

    // 2. Create 20 distinct users
    const passwordHash = await bcrypt.hash('password123', 6);
    const userDocs = [];
    for (let i = 0; i < 20; i++) {
      userDocs.push({
        name: `Stress User ${i}`,
        email: `stress_${Date.now()}_${i}@feedants.test`,
        passwordHash,
        referralCode: `STRESS${i}${Date.now().toString().slice(-4)}`,
        walletBalance: 0,
      });
    }
    const seededUsers = await User.insertMany(userDocs);

    // 3. Fire 20 simultaneous registrations using Promise.allSettled
    const results = await Promise.allSettled(
      seededUsers.map((user) =>
        RegistrationService.registerForCompetition(competition._id.toString(), user._id.toString())
      )
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r) => r.status === 'rejected');

    console.log('\n================ CONCURRENCY TEST RESULTS ================');
    console.log(`Concurrent registration requests fired: 20`);
    console.log(`Total spots initially available:        3`);
    console.log(`Registrations succeeded:                 ${succeeded.length}`);
    console.log(`Registrations rejected:                  ${failed.length}`);
    if (failed.length > 0) {
      console.log('First failure reason:', (failed[0] as PromiseRejectedResult).reason);
    }
    console.log('==========================================================\n');

    // 4. Assertions
    expect(succeeded.length).toBe(3);
    expect(failed.length).toBe(17);

    // Verify error codes of all rejected promises
    failed.forEach((f) => {
      const err = (f as PromiseRejectedResult).reason;
      expect(['SPOTS_FULL_OR_CLOSED', 'SPOTS_FULL']).toContain(err.code);
    });

    // Verify that the competition document's bookedSpots strictly equals totalSpots (never 11 or higher)
    const finalComp = await Competition.findById(competition._id);
    expect(finalComp).not.toBeNull();
    expect(finalComp!.bookedSpots).toBe(finalComp!.totalSpots);
    expect(finalComp!.bookedSpots).toBe(10);

    // Verify that exactly 3 pending_payment registrations were created in the database
    const totalRegsCreated = await Registration.countDocuments({ competitionId: competition._id });
    expect(totalRegsCreated).toBe(3);
  });
});
