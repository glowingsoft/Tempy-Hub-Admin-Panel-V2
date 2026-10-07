import { lazy, Suspense } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import { MainLayout } from 'src/layouts/main';

import { SplashScreen } from 'src/components/loading-screen';

import { GuestGuard } from 'src/auth/guard';
import { AuthSplitLayout } from 'src/layouts/auth-split';
import { AuthCenteredLayout } from 'src/layouts/auth-centered';
import { adminDashboardRoutes } from './admin-dashboard';
import { authRoutes } from './auth';
import { authDemoRoutes } from './auth-demo';
import { componentsRoutes } from './components';
import { dashboardRoutes } from './dashboard';
import { mainRoutes } from './main';
import { siteManagerDashboardRoutes } from './site-manager-dashboard';
import { lineManagerDashboardRoutes } from './line-manager-dashboard';
import { ownerDashboardRoutes } from './owner-dashboard';
import { staffDashboardRoutes } from './staff-dashboard';

// ----------------------------------------------------------------------

const HomePage = lazy(() => import('src/pages/home'));
const InvitePage = lazy(() => import('src/pages/invite'));

const Jwt = {
  SignInPage: lazy(() => import('src/pages/auth/jwt/sign-in')),
  SignUpPage: lazy(() => import('src/pages/auth/jwt/sign-up')),
};

export function Router() {
  return useRoutes([
    {
      path: '/',
      /**
       * Skip home page
       * element: <Navigate to={CONFIG.auth.redirectPath} replace />,
       */
      element: (
        // <Suspense fallback={<SplashScreen />}>
        //   <MainLayout>
        //     <HomePage />
        //   </MainLayout>
        // </Suspense>
        <GuestGuard>
          <AuthSplitLayout section={{ title: 'Hi, Welcome back' }}>
            <Jwt.SignInPage />
          </AuthSplitLayout>
        </GuestGuard>
      ),
    },

    // Auth
    ...authRoutes,
    ...authDemoRoutes,

    // Accept Invitation Onboarding
    {
      path: 'invite/:token',
      element: (
        <Suspense fallback={<SplashScreen />}>
          <AuthCenteredLayout>
            <InvitePage />
          </AuthCenteredLayout>
        </Suspense>
      ),
    },
    {
      path: 'invite/:token/*',
      element: (
        <Suspense fallback={<SplashScreen />}>
          <AuthCenteredLayout>
            <InvitePage />
          </AuthCenteredLayout>
        </Suspense>
      ),
    },

    // Dashboard
    ...dashboardRoutes,

    // Admin Dashboard
    ...adminDashboardRoutes,

    //site manager
    ...siteManagerDashboardRoutes,

    //line manager
    ...lineManagerDashboardRoutes,

    //organization owner
    ...ownerDashboardRoutes,
    ...staffDashboardRoutes,

    // Main
    ...mainRoutes,

    // Components
    ...componentsRoutes,

    // No match
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
