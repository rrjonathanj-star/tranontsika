import React, { useState } from 'react';
import { resendVerificationEmail } from '../services/emailVerification';
import './Auth.css';

const VerifyEmailPrompt = ({ email }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await resendVerificationEmail(email);
      setMessage(response.message);
    } catch (err) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>📧 Email Verification Required</h2>
        <p>We've sent a verification link to <strong>{email}</strong></p>
        <p>Please check your email and click the verification link to complete your registration.</p>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>Didn't receive the email?</p>
          <button
            onClick={handleResend}
            disabled={loading}
            style={{
              background: '#667eea',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPrompt;