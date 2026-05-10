import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../services/emailVerification';
import './Auth.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get('token');

        if (!token) {
          setError('Verification token is missing');
          setLoading(false);
          return;
        }

        const response = await verifyEmail(token);
        setMessage(response.message);
        setLoading(false);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setError(err.message || 'Email verification failed');
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>Verifying your email...</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        {error ? (
          <>
            <h2 style={{ color: '#e74c3c' }}>❌ Verification Failed</h2>
            <p style={{ color: '#e74c3c' }}>{error}</p>
            <button onClick={() => navigate('/login')} className="submit-btn">
              Back to Login
            </button>
          </>
        ) : (
          <>
            <h2 style={{ color: '#27ae60' }}>✅ Email Verified!</h2>
            <p>{message}</p>
            <p>Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;