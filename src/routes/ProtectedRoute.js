import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({element,children}) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" />;
  }

  return element? element : children;
};

export default ProtectedRoute;