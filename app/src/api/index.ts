import { apiClient } from './client';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export const api = {
  // Auth
  signup: async (data: { name: string; email: string; password: string; referralCode?: string }) => {
    const res = await apiClient.post<ApiResponse<any>>('/auth/signup', data);
    return res.data.data;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<any>>('/auth/login', data);
    return res.data.data;
  },
  getMe: async () => {
    const res = await apiClient.get<ApiResponse<any>>('/auth/me');
    return res.data.data;
  },

  // Competitions
  getCompetitions: async (category?: string, page = 1, limit = 10) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/competitions', {
      params: { category, page, limit },
    });
    return res.data;
  },
  getCompetition: async (id: string) => {
    const res = await apiClient.get<ApiResponse<any>>(`/competitions/${id}`);
    return res.data.data;
  },
  getWinners: async (id: string, page = 1, limit = 10) => {
    const res = await apiClient.get<ApiResponse<any>>(`/competitions/${id}/winners`, {
      params: { page, limit },
    });
    return res.data.data;
  },
  getTestimonials: async (id?: string, page = 1, limit = 10) => {
    const res = await apiClient.get<ApiResponse<any>>(
      id ? `/competitions/${id}/testimonials` : '/competitions/all/testimonials',
      { params: { page, limit } }
    );
    return res.data.data;
  },

  // Registration & Payment
  register: async (id: string) => {
    const res = await apiClient.post<ApiResponse<any>>(`/competitions/${id}/register`);
    return res.data.data;
  },
  verifyPayment: async (data: {
    registrationId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => {
    const res = await apiClient.post<ApiResponse<any>>('/payments/verify', data);
    return res.data.data;
  },
  getRegistrationStatus: async (id: string) => {
    const res = await apiClient.get<ApiResponse<any>>(`/competitions/${id}/registration`);
    return res.data.data;
  },

  // Submissions
  presignSubmission: async (id: string, data: { fileName: string; fileType: string }) => {
    const res = await apiClient.post<ApiResponse<any>>(`/competitions/${id}/submissions/presign`, data);
    return res.data.data;
  },
  createSubmission: async (id: string, data: { fileKey: string; mediaType: 'video' | 'image' }) => {
    const res = await apiClient.post<ApiResponse<any>>(`/competitions/${id}/submissions`, data);
    return res.data.data;
  },
  getMySubmission: async (id: string) => {
    const res = await apiClient.get<ApiResponse<any>>(`/competitions/${id}/submissions/me`);
    return res.data.data;
  },
  uploadLocalFile: async (id: string, formData: FormData) => {
    const res = await apiClient.post<ApiResponse<any>>(`/competitions/${id}/submissions/upload-local`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  // Referral
  getMyReferral: async () => {
    const res = await apiClient.get<ApiResponse<any>>('/referrals/me/referral');
    return res.data.data;
  },
  redeemReferral: async (referralCode: string) => {
    const res = await apiClient.post<ApiResponse<any>>('/referrals/redeem', { referralCode });
    return res.data.data;
  },
};
