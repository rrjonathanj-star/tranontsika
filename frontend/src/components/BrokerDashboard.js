import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const BrokerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await api.get('/properties/my-properties');
      setProperties(response.data.properties || []);
    } catch (err) {
      setError('Failed to load properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`/properties/${propertyId}`);
        setProperties(properties.filter(p => p.id !== propertyId));
      } catch (err) {
        setError('Failed to delete property');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  let filteredProperties = filterType === 'all' 
    ? properties 
    : properties.filter(p => p.status === filterType);

  // Sort properties
  if (sortBy === 'price-low') {
    filteredProperties = [...filteredProperties].sort((a, b) => a.price_per_month - b.price_per_month);
  } else if (sortBy === 'price-high') {
    filteredProperties = [...filteredProperties].sort((a, b) => b.price_per_month - a.price_per_month);
  }

  const totalValue = properties.reduce((sum, p) => sum + (p.price_per_month || 0), 0);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🤝 Broker Dashboard</h1>
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
              <a href="#properties" className="menu-item active">📋 My Listings</a>
              <button 
                onClick={() => navigate('/create-property')} 
                className="menu-item btn-link"
              >
                ➕ Add New Listing
              </button>
              <a href="#clients" className="menu-item">👥 Clients</a>
            </div>
          </nav>
        </div>

        {/* Main Area */}
        <div className="dashboard-main">
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{properties.length}</h3>
              <p>Total Listings</p>
            </div>
            <div className="stat-card">
              <h3>${(totalValue / 1000).toFixed(1)}k</h3>
              <p>Total Portfolio Value</p>
            </div>
            <div className="stat-card">
              <h3>{properties.filter(p => p.status === 'rented').length}</h3>
              <p>Currently Rented</p>
            </div>
            <div className="stat-card">
              <h3>{properties.filter(p => p.status === 'available').length}</h3>
              <p>Available for Rent</p>
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Filter & Sort */}
          <div className="filter-section">
            <div className="filter-group">
              <h3>Filter by Status:</h3>
              <div className="filter-buttons">
                <button 
                  onClick={() => setFilterType('all')}
                  className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                >
                  All ({properties.length})
                </button>
                <button 
                  onClick={() => setFilterType('available')}
                  className={`filter-btn ${filterType === 'available' ? 'active' : ''}`}
                >
                  Available
                </button>
                <button 
                  onClick={() => setFilterType('rented')}
                  className={`filter-btn ${filterType === 'rented' ? 'active' : ''}`}
                >
                  Rented
                </button>
              </div>
            </div>

            <div className="sort-group">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                <option value="recent">Most Recent</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Properties List */}
          <div id="properties" className="properties-section">
            <h2>My Listings</h2>
            
            {loading ? (
              <div className="loading">Loading listings...</div>
            ) : filteredProperties.length === 0 ? (
              <div className="empty-state">
                <p>No listings found</p>
                <button onClick={() => navigate('/create-property')} className="btn-primary">
                  Add Your First Listing
                </button>
              </div>
            ) : (
              <div className="properties-grid">
                {filteredProperties.map(property => (
                  <div key={property.id} className="property-card">
                    <div className="property-card-header">
                      <h3>{property.title}</h3>
                      <span className={`status-badge status-${property.status}`}>
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="property-card-body">
                      <p><strong>Location:</strong> {property.city}</p>
                      <p><strong>Type:</strong> <span className="badge">{property.type}</span></p>
                      <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
                      <p><strong>Price:</strong> <span className="price">${property.price_per_month}/month</span></p>
                    </div>

                    <div className="property-card-footer">
                      <button 
                        onClick={() => navigate(`/property/${property.id}`)}
                        className="btn-sm btn-info"
                      >
                        👁️ View
                      </button>
                      <button 
                        onClick={() => navigate(`/edit-property/${property.id}`)}
                        className="btn-sm btn-warning"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(property.id)}
                        className="btn-sm btn-danger"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerDashboard;