import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { getDashboardPath, isAuthenticatedUser } from '../utils/get-dashboard-path';

// ----------------------------------------------------------------------

export function GuestGuard({ children }) {
  const user = useSelector((state) => state.user?.user);

  if (isAuthenticatedUser(user)) {
    return <Navigate to={getDashboardPath(user)} replace />;
  }

  return children;
}
