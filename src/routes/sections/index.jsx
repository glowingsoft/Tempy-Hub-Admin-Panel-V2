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
const LandingPage = lazy(() => import('src/pages/landing'));
const InvitePage = lazy(() => import('src/pages/invite'));
const FamilyInvitePage = lazy(() => import('src/pages/family-invite'));

const Jwt = {
  SignInPage: lazy(() => import('src/pages/auth/jwt/sign-in')),
  SignUpPage: lazy(() => import('src/pages/auth/jwt/sign-up')),
};

export function Router() {
  return useRoutes([
    {
      path: '/',
      element: (
        <Suspense fallback={<SplashScreen />}>
          <LandingPage />
        </Suspense>
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

    // Accept Family Invitation Onboarding
    {
      path: 'family-invite/:token',
      element: (
        <Suspense fallback={<SplashScreen />}>
          <AuthCenteredLayout>
            <FamilyInvitePage />
          </AuthCenteredLayout>
        </Suspense>
      ),
    },
    {
      path: 'family-invite/:token/*',
      element: (
        <Suspense fallback={<SplashScreen />}>
          <AuthCenteredLayout>
            <FamilyInvitePage />
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
