import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { logIn, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>; // Render loading indicator while loading
    }

    if (!logIn) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
