import api from './api';

// Verify email with token
export const verifyEmail = async (token) => {
  try {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Resend verification email
export const resendVerificationEmail = async (email) => {
  try {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};