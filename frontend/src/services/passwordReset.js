import api from './api';

// Request password reset
export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/password-reset/request', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Verify reset token
export const verifyResetToken = async (token) => {
  try {
    const response = await api.post('/password-reset/verify-token', { token });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Reset password
export const resetPassword = async (token, newPassword, confirmPassword) => {
  try {
    const response = await api.post('/password-reset/reset', {
      token,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};