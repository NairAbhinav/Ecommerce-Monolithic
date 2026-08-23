import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo) {
    // User not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
    // Role not authorized, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
