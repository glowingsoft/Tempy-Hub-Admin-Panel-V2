import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { LoadingScreen } from 'src/components/loading-screen';
import { DashboardLayout } from 'src/layouts/dashboard';
import ProtectedRoute from 'src/auth/guard/custom-auth-guard';

const StaffDashboardPage = lazy(() => import('src/pages/staff/dashboard'));
const StaffAttendancePage = lazy(() => import('src/pages/staff/attendance'));
const StaffLeaveRequestsPage = lazy(() => import('src/pages/staff/leave-requests'));
const StaffShiftsPage = lazy(() => import('src/pages/staff/shifts'));
const StaffShiftClaimsPage = lazy(() => import('src/pages/staff/shift-claims'));
const StaffCompetenciesPage = lazy(() => import('src/pages/staff/competencies'));
const StaffDocumentsPage = lazy(() => import('src/pages/staff/documents'));
const StaffDocumentDetailPage = lazy(() => import('src/pages/staff/documents/detail'));
const SupervisionPage = lazy(() => import('src/pages/dashboard/active-routes/supervision'));
const SupervisionDetailPage = lazy(() => import('src/pages/dashboard/active-routes/supervision/detail'));
const AppraisalPage = lazy(() => import('src/pages/dashboard/active-routes/appraisals'));
const AppraisalDetailPage = lazy(() => import('src/pages/dashboard/active-routes/appraisals/detail'));
// rota — shared page, same as Site Manager / Line Manager.
// TODO: scope RotaView to the signed-in staff member's own shifts.
const RotaPage = lazy(() => import('src/pages/dashboard/active-routes/rota'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const CommunityWallPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/community-wall'));
const StaffPhotoUploadsPage = lazy(() => import('src/pages/staff/family-engagement/photo-uploads'));
const StaffMyResidentsPage = lazy(() => import('src/pages/staff/family-engagement/my-residents'));
const StaffMyResidentDetailPage = lazy(() => import('src/pages/staff/family-engagement/my-resident-detail'));
const GazettesPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/gazettes'));

const TrainingPage = lazy(() => import('src/pages/dashboard/active-routes/training'));

const layoutContent = (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

export const staffDashboardRoutes = [
  {
    path: 'staff',
    element: CONFIG.auth.skip ? (
      <>{layoutContent}</>
    ) : (
      <ProtectedRoute requiredPermission={[5]}>{layoutContent}</ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <StaffDashboardPage /> },
      { path: 'account', element: <UserAccountPage /> },
      { path: 'profile', element: <UserAccountPage /> },
      {
        path: 'family-engagement',
        children: [
          { path: 'my-residents', element: <StaffMyResidentsPage /> },
          { path: 'my-residents/:id', element: <StaffMyResidentDetailPage /> },
          { path: 'photo-uploads', element: <StaffPhotoUploadsPage /> },
          { path: 'community-wall', element: <CommunityWallPage /> },
          { path: 'gazettes', element: <GazettesPage /> },
        ],
      },
      { path: 'attendance', element: <StaffAttendancePage /> },
      { path: 'leave-requests', element: <StaffLeaveRequestsPage /> },
      { path: 'shifts', element: <StaffShiftsPage /> },
      { path: 'shift-claims', element: <StaffShiftClaimsPage /> },
      { path: 'competencies', element: <StaffCompetenciesPage /> },
      { path: 'supervision', element: <SupervisionPage /> },
      { path: 'supervision/:id', element: <SupervisionDetailPage /> },
      { path: 'appraisals', element: <AppraisalPage /> },
      { path: 'appraisals/:id', element: <AppraisalDetailPage /> },
      { path: 'training', element: <TrainingPage /> },
      { path: 'documents', element: <StaffDocumentsPage /> },
      { path: 'documents/:id', element: <StaffDocumentDetailPage /> },
      { path: 'rota', element: <RotaPage /> },
    ],
  },
];