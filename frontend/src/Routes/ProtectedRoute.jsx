import React from 'react'
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({children}) {
  let user = null;
  try {
    const userData = localStorage.getItem("user");
    console.log("Protected Route - User data from localStorage:", userData);
    user = JSON.parse(userData);
  } catch (e) {
    console.error("Protected Route - Error parsing user data:", e);
    localStorage.removeItem("user");
  }

  if (!user) {
    console.log("Protected Route - No user found, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  return children;
}
