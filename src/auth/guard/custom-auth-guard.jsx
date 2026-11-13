import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

import { AuthMeProvider } from './auth-me-provider';
import { ModuleGuard } from './module-guard';
import { isPlatformAdmin } from '../permissions';

const ProtectedRoute = ({ children, requiredPermission }) => {
    const { user } = useSelector((state) => state.user);

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const hasPermission = Array.isArray(requiredPermission)
        ? requiredPermission.includes(user?.permission)
        : user?.permission === requiredPermission;

    if (!hasPermission) {
        return <Navigate to="/404" replace />;
    }

    const content = children || <Outlet />;

    if (isPlatformAdmin(user)) {
        return content;
    }

    return (
        <AuthMeProvider>
            <ModuleGuard>{content}</ModuleGuard>
        </AuthMeProvider>
    );
};

export default ProtectedRoute;
