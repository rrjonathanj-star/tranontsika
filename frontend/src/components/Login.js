import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginAPI } from '../services/api';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginAPI({ email, password });
      login(response.accessToken, response.refreshToken, response.user);

      // Redirect based on role
      const roleRoutes = {
        owner: '/owner-dashboard',
        broker: '/broker-dashboard',
        renter: '/search-properties',
      };

      navigate(roleRoutes[response.user.role] || '/');
    } catch (err) {
      if (err.message === 'Please verify your email before logging in') {
        setError('Please verify your email before logging in. Check your inbox for the verification link.');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>🏠 Login to Tranontsika</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <a href="/forgot-password" style={{ color: '#e74c3c' }}>Forgot your password?</a>
        </p>

        <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '0.9rem' }}>
          Don't have an account? <a href="/signup">Sign up here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;