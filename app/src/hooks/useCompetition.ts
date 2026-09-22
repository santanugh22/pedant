import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

export function useCompetition(id: string) {
  return useQuery({
    queryKey: ['competition', id],
    queryFn: () => api.getCompetition(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchInterval: 20000, // 20-second background polling for real-time spots consistency
  });
}

export function useCompetitions(category?: string, page = 1) {
  return useQuery({
    queryKey: ['competitions', category, page],
    queryFn: () => api.getCompetitions(category, page),
  });
}

export function useWinners(competitionId: string) {
  return useQuery({
    queryKey: ['winners', competitionId],
    queryFn: () => api.getWinners(competitionId),
    enabled: !!competitionId,
  });
}

export function useTestimonials(competitionId?: string) {
  return useQuery({
    queryKey: ['testimonials', competitionId],
    queryFn: () => api.getTestimonials(competitionId),
  });
}

export function useReferral() {
  return useQuery({
    queryKey: ['referral'],
    queryFn: () => api.getMyReferral(),
  });
}

export function useRegister(competitionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.register(competitionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competition', competitionId] });
    },
  });
}

export function useVerifyPayment(competitionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      registrationId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }) => api.verifyPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competition', competitionId] });
    },
  });
}

export function useSubmitEntry(competitionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { fileKey: string; mediaType: 'video' | 'image' }) =>
      api.createSubmission(competitionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competition', competitionId] });
    },
  });
}
