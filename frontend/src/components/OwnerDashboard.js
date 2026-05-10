import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');

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

  const filteredProperties = filterType === 'all' 
    ? properties 
    : properties.filter(p => p.status === filterType);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🏠 Owner Dashboard</h1>
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
              <a href="#properties" className="menu-item active">📋 My Properties</a>
              <button 
                onClick={() => navigate('/create-property')} 
                className="menu-item btn-link"
              >
                ➕ Add New Property
              </button>
            </div>
          </nav>
        </div>

        {/* Main Area */}
        <div className="dashboard-main">
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{properties.length}</h3>
              <p>Total Properties</p>
            </div>
            <div className="stat-card">
              <h3>{properties.filter(p => p.status === 'available').length}</h3>
              <p>Available</p>
            </div>
            <div className="stat-card">
              <h3>{properties.filter(p => p.status === 'rented').length}</h3>
              <p>Rented Out</p>
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Filter */}
          <div className="filter-section">
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

          {/* Properties List */}
          <div id="properties" className="properties-section">
            <h2>My Properties</h2>
            
            {loading ? (
              <div className="loading">Loading properties...</div>
            ) : filteredProperties.length === 0 ? (
              <div className="empty-state">
                <p>No properties found</p>
                <button onClick={() => navigate('/create-property')} className="btn-primary">
                  Create Your First Property
                </button>
              </div>
            ) : (
              <div className="properties-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Price/Month</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.map(property => (
                      <tr key={property.id}>
                        <td className="property-title">{property.title}</td>
                        <td>{property.city}</td>
                        <td><span className="badge">{property.type}</span></td>
                        <td className="price">${property.price_per_month}/mo</td>
                        <td>
                          <span className={`status-badge status-${property.status}`}>
                            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                          </span>
                        </td>
                        <td className="actions">
                          <button 
                            onClick={() => navigate(`/property/${property.id}`)}
                            className="btn-sm btn-info"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => navigate(`/edit-property/${property.id}`)}
                            className="btn-sm btn-warning"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(property.id)}
                            className="btn-sm btn-danger"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;