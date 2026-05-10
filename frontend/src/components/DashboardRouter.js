import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OwnerDashboard from './OwnerDashboard';
import BrokerDashboard from './BrokerDashboard';
import RenterDashboard from './RenterDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case 'owner':
      return <OwnerDashboard />;
    case 'broker':
      return <BrokerDashboard />;
    case 'renter':
      return <RenterDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

export default DashboardRouter;