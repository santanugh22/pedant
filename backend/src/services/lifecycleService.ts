import { ICompetition } from '../models/Competition';
import { IRegistration } from '../models/Registration';
import { ISubmission } from '../models/Submission';

export interface CompetitionLifecycle {
  registrationOpen: boolean;
  isFull: boolean;
  submissionOpen: boolean;
  resultsDeclared: boolean;
}

export type CtaAction =
  | 'REGISTER'
  | 'RESUME_PAYMENT'
  | 'UPLOAD_SUBMISSION'
  | 'EDIT_SUBMISSION'
  | 'VIEW_RESULTS'
  | 'NONE';

export interface CtaButtonState {
  label: string;
  subLabel?: string;
  action: CtaAction;
  enabled: boolean;
}

export interface UserContext {
  isAuthenticated: boolean;
  registrationStatus: string | null;
  hasSubmitted: boolean;
  submissionId: string | null;
  ctaButton: CtaButtonState;
}

/**
 * Pure function to compute the independent, non-linear lifecycle states of a competition.
 * Critical: Registration and submission windows are independent and may overlap.
 */
export function computeCompetitionLifecycle(
  competition: Pick<ICompetition, 'dates' | 'totalSpots' | 'bookedSpots'>,
  now = new Date()
): CompetitionLifecycle {
  const { registrationStart, registrationEnd, submissionStart, submissionEnd, resultDate } =
    competition.dates;

  const isFull = competition.bookedSpots >= competition.totalSpots;
  const registrationOpen =
    now >= new Date(registrationStart) &&
    now < new Date(registrationEnd) &&
    !isFull;
  const submissionOpen =
    now >= new Date(submissionStart) && now < new Date(submissionEnd);
  const resultsDeclared = now >= new Date(resultDate);

  return {
    registrationOpen,
    isFull,
    submissionOpen,
    resultsDeclared,
  };
}

/**
 * Pure function to compute the sticky bottom CTA button state from user and competition states.
 * Implements the full 12-row decision table from Section 10.2 of the specification.
 */
export function computeUserCta(
  competition: Pick<ICompetition, 'dates' | 'totalSpots' | 'bookedSpots' | 'entryFee'>,
  registration: IRegistration | null | undefined,
  submission: ISubmission | null | undefined,
  now = new Date()
): CtaButtonState {
  const lifecycle = computeCompetitionLifecycle(competition, now);
  const { registrationOpen, isFull, submissionOpen, resultsDeclared } = lifecycle;

  // Row 1 & 12: Results declared always takes precedence
  if (resultsDeclared) {
    return {
      label: 'View Results',
      action: 'VIEW_RESULTS',
      enabled: true,
    };
  }

  // Check if user has an active or confirmed registration
  const status = registration ? registration.status : null;
  const isHoldExpired =
    status === 'pending_payment' &&
    registration?.expiresAt &&
    new Date(registration.expiresAt) < now;

  // Row 7-11: Confirmed paid registration
  if (status === 'confirmed') {
    const hasSubmitted = !!submission;
    if (submissionOpen && !hasSubmitted) {
      return {
        label: 'Upload Submission',
        subLabel: 'Registered',
        action: 'UPLOAD_SUBMISSION',
        enabled: true,
      };
    }
    if (!hasSubmitted && now < new Date(competition.dates.submissionStart)) {
      return {
        label: 'Submission Opens Soon',
        subLabel: 'Registered',
        action: 'NONE',
        enabled: false,
      };
    }
    if (!hasSubmitted && now >= new Date(competition.dates.submissionEnd)) {
      return {
        label: 'Submission Window Closed',
        subLabel: 'Registered',
        action: 'NONE',
        enabled: false,
      };
    }
    if (hasSubmitted && submissionOpen) {
      return {
        label: 'Edit Submission',
        subLabel: 'Registered',
        action: 'EDIT_SUBMISSION',
        enabled: true,
      };
    }
    if (hasSubmitted && !submissionOpen) {
      return {
        label: 'Submission Uploaded',
        subLabel: 'Registered',
        action: 'NONE',
        enabled: false,
      };
    }
  }

  // Row 5: Active pending payment (hold not expired)
  if (status === 'pending_payment' && !isHoldExpired) {
    return {
      label: 'Complete Payment',
      subLabel: 'Payment pending',
      action: 'RESUME_PAYMENT',
      enabled: true,
    };
  }

  // Row 2, 3, 4, 6: Unregistered, guest, or expired hold
  if (registrationOpen && !isFull) {
    return {
      label: `Register Now – ₹${competition.entryFee}`,
      action: 'REGISTER',
      enabled: true,
    };
  }

  if (isFull) {
    return {
      label: 'Registration Full',
      action: 'NONE',
      enabled: false,
    };
  }

  return {
    label: 'Registration Closed',
    action: 'NONE',
    enabled: false,
  };
}
