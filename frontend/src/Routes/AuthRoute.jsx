import React from 'react'
import { Navigate } from 'react-router-dom';

export default function AuthRoute({children}) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    localStorage.removeItem("user");
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
