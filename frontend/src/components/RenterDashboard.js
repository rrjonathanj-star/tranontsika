import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const RenterDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      // TODO: Implement favorites API
      setFavorites([]);
    } catch (err) {
      setError('Failed to load favorites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🔍 Renter Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.firstName}!</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <nav className="sidebar-menu">
            <div className="menu-section">
              <h3>Menu</h3>
              <a href="/search-properties" className="menu-item">🔍 Search Properties</a>
              <a href="#favorites" className="menu-item active">❤️ Saved Properties</a>
              <a href="#requests" className="menu-item">📋 Viewing Requests</a>
              <a href="#messages" className="menu-item">💬 Messages</a>
            </div>
          </nav>
        </div>

        {/* Main Area */}
        <div className="dashboard-main">
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{favorites.length}</h3>
              <p>Saved Properties</p>
            </div>
            <div className="stat-card">
              <h3>0</h3>
              <p>Viewing Requests</p>
            </div>
            <div className="stat-card">
              <h3>0</h3>
              <p>Messages</p>
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Favorites Section */}
          <div id="favorites" className="properties-section">
            <h2>❤️ Saved Properties</h2>
            
            {loading ? (
              <div className="loading">Loading saved properties...</div>
            ) : favorites.length === 0 ? (
              <div className="empty-state">
                <p>No saved properties yet</p>
                <button onClick={() => navigate('/search-properties')} className="btn-primary">
                  Search Properties
                </button>
              </div>
            ) : (
              <div className="properties-grid">
                {/* Property cards will go here */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenterDashboard;