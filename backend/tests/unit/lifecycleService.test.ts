import {
  computeCompetitionLifecycle,
  computeUserCta,
} from '../../src/services/lifecycleService';
import { IRegistration } from '../../src/models/Registration';
import { ISubmission } from '../../src/models/Submission';

describe('Lifecycle and CTA State Machine Unit Tests', () => {
  const baseCompetition = {
    dates: {
      registrationStart: new Date('2026-08-01T00:00:00Z'),
      registrationEnd: new Date('2026-08-10T18:20:00Z'),
      submissionStart: new Date('2026-08-06T04:00:00Z'), // Opens BEFORE registration ends
      submissionEnd: new Date('2026-08-30T18:25:00Z'),
      resultDate: new Date('2026-09-01T18:20:00Z'),
    },
    totalSpots: 20,
    bookedSpots: 1,
    entryFee: 99,
  };

  describe('computeCompetitionLifecycle', () => {
    it('accurately identifies overlapping open registration and open submission', () => {
      // 8 August 2026: registration is open AND submission is open
      const now = new Date('2026-08-08T12:00:00Z');
      const lifecycle = computeCompetitionLifecycle(baseCompetition, now);

      expect(lifecycle.registrationOpen).toBe(true);
      expect(lifecycle.isFull).toBe(false);
      expect(lifecycle.submissionOpen).toBe(true);
      expect(lifecycle.resultsDeclared).toBe(false);
    });

    it('marks isFull=true and registrationOpen=false when bookedSpots >= totalSpots', () => {
      const now = new Date('2026-08-05T12:00:00Z');
      const fullCompetition = { ...baseCompetition, bookedSpots: 20 };
      const lifecycle = computeCompetitionLifecycle(fullCompetition, now);

      expect(lifecycle.isFull).toBe(true);
      expect(lifecycle.registrationOpen).toBe(false);
    });

    it('marks resultsDeclared=true after resultDate', () => {
      const now = new Date('2026-09-02T00:00:00Z');
      const lifecycle = computeCompetitionLifecycle(baseCompetition, now);

      expect(lifecycle.resultsDeclared).toBe(true);
      expect(lifecycle.registrationOpen).toBe(false);
      expect(lifecycle.submissionOpen).toBe(false);
    });
  });

  describe('computeUserCta - 12 Row Decision Table', () => {
    it('Row 1 & 12: resultsDeclared returns View Results regardless of user status', () => {
      const postResultsNow = new Date('2026-09-02T00:00:00Z');
      const ctaGuest = computeUserCta(baseCompetition, null, null, postResultsNow);
      expect(ctaGuest).toEqual({
        label: 'View Results',
        action: 'VIEW_RESULTS',
        enabled: true,
      });

      const confirmedReg = { status: 'confirmed' } as IRegistration;
      const ctaConfirmed = computeUserCta(baseCompetition, confirmedReg, null, postResultsNow);
      expect(ctaConfirmed).toEqual({
        label: 'View Results',
        action: 'VIEW_RESULTS',
        enabled: true,
      });
    });

    it('Row 2: Unregistered user during open registration sees Register Now', () => {
      const now = new Date('2026-08-05T12:00:00Z');
      const cta = computeUserCta(baseCompetition, null, null, now);
      expect(cta).toEqual({
        label: 'Register Now – ₹99',
        action: 'REGISTER',
        enabled: true,
      });
    });

    it('Row 3: Unregistered user on full competition sees Registration Full (disabled)', () => {
      const now = new Date('2026-08-05T12:00:00Z');
      const fullCompetition = { ...baseCompetition, bookedSpots: 20 };
      const cta = computeUserCta(fullCompetition, null, null, now);
      expect(cta).toEqual({
        label: 'Registration Full',
        action: 'NONE',
        enabled: false,
      });
    });

    it('Row 4: Unregistered user after deadline sees Registration Closed (disabled)', () => {
      const now = new Date('2026-08-11T00:00:00Z');
      const cta = computeUserCta(baseCompetition, null, null, now);
      expect(cta).toEqual({
        label: 'Registration Closed',
        action: 'NONE',
        enabled: false,
      });
    });

    it('Row 5: Pending payment with valid hold sees Complete Payment', () => {
      const now = new Date('2026-08-05T12:00:00Z');
      const pendingReg = {
        status: 'pending_payment',
        expiresAt: new Date('2026-08-05T12:15:00Z'),
      } as IRegistration;
      const cta = computeUserCta(baseCompetition, pendingReg, null, now);
      expect(cta).toEqual({
        label: 'Complete Payment',
        subLabel: 'Payment pending',
        action: 'RESUME_PAYMENT',
        enabled: true,
      });
    });

    it('Row 6: Expired pending payment re-evaluates registration status', () => {
      const now = new Date('2026-08-05T12:20:00Z');
      const expiredReg = {
        status: 'pending_payment',
        expiresAt: new Date('2026-08-05T12:15:00Z'), // expired 5 mins ago
      } as IRegistration;
      const cta = computeUserCta(baseCompetition, expiredReg, null, now);
      // Since registration is still open and spots exist, should offer Register Now
      expect(cta).toEqual({
        label: 'Register Now – ₹99',
        action: 'REGISTER',
        enabled: true,
      });
    });

    it('Row 7: Confirmed user when submission is open and not submitted sees Upload Submission', () => {
      // 8 August: submission is open
      const now = new Date('2026-08-08T12:00:00Z');
      const confirmedReg = { status: 'confirmed' } as IRegistration;
      const cta = computeUserCta(baseCompetition, confirmedReg, null, now);
      expect(cta).toEqual({
        label: 'Upload Submission',
        subLabel: 'Registered',
        action: 'UPLOAD_SUBMISSION',
        enabled: true,
      });
    });

    it('Row 8: Confirmed user before submission window opens sees Submission Opens Soon', () => {
      const now = new Date('2026-08-03T12:00:00Z'); // before 6 Aug
      const confirmedReg = { status: 'confirmed' } as IRegistration;
      const cta = computeUserCta(baseCompetition, confirmedReg, null, now);
      expect(cta).toEqual({
        label: 'Submission Opens Soon',
        subLabel: 'Registered',
        action: 'NONE',
        enabled: false,
      });
    });

    it('Row 9: Confirmed user after submission window closed with no submission sees Submission Window Closed', () => {
      const now = new Date('2026-08-31T00:00:00Z'); // after 30 Aug, before result 1 Sept
      const confirmedReg = { status: 'confirmed' } as IRegistration;
      const cta = computeUserCta(baseCompetition, confirmedReg, null, now);
      expect(cta).toEqual({
        label: 'Submission Window Closed',
        subLabel: 'Registered',
        action: 'NONE',
        enabled: false,
      });
    });

    it('Row 10: Confirmed user with submission during submission window sees Edit Submission', () => {
      const now = new Date('2026-08-08T12:00:00Z');
      const confirmedReg = { status: 'confirmed' } as IRegistration;
      const submission = { status: 'submitted' } as ISubmission;
      const cta = computeUserCta(baseCompetition, confirmedReg, submission, now);
      expect(cta).toEqual({
        label: 'Edit Submission',
        subLabel: 'Registered',
        action: 'EDIT_SUBMISSION',
        enabled: true,
      });
    });

    it('Row 11: Confirmed user with submission after submission window closed sees Submission Uploaded (disabled)', () => {
      const now = new Date('2026-08-31T00:00:00Z');
      const confirmedReg = { status: 'confirmed' } as IRegistration;
      const submission = { status: 'submitted' } as ISubmission;
      const cta = computeUserCta(baseCompetition, confirmedReg, submission, now);
      expect(cta).toEqual({
        label: 'Submission Uploaded',
        subLabel: 'Registered',
        action: 'NONE',
        enabled: false,
      });
    });
  });
});
