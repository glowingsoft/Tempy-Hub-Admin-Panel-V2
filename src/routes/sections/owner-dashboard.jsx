import { lazy, Suspense } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import ProtectedRoute from 'src/auth/guard/custom-auth-guard';

// ----------------------------------------------------------------------

const OwnerDashboardPage = lazy(() => import('src/pages/owner-dashboard'));
const DepartmentListPage = lazy(() => import('src/pages/owner-dashboard/departments/list'));
const DepartmentDetailPage = lazy(() => import('src/pages/owner-dashboard/departments/detail'));
const JobTitleListPage = lazy(() => import('src/pages/owner-dashboard/job-titles/list'));
const BranchListPage = lazy(() => import('src/pages/owner-dashboard/branches/list'));
const BranchDetailPage = lazy(() => import('src/pages/owner-dashboard/branches/detail'));
const BranchCreatePage = lazy(() => import('src/pages/owner-dashboard/branches/new'));
const BranchEditPage = lazy(() => import('src/pages/owner-dashboard/branches/edit'));
const InvitationListPage = lazy(() => import('src/pages/owner-dashboard/memberships/invitations/list'));
const InvitationDetailPage = lazy(() => import('src/pages/owner-dashboard/memberships/invitations/detail'));
const InvitationCreatePage = lazy(() => import('src/pages/owner-dashboard/memberships/invitations/new'));
const InvitationEditPage = lazy(() => import('src/pages/owner-dashboard/memberships/invitations/edit'));
const MemberListPage = lazy(() => import('src/pages/owner-dashboard/memberships/members/list'));
const MemberDetailPage = lazy(() => import('src/pages/owner-dashboard/memberships/members/detail'));
const MemberEditPage = lazy(() => import('src/pages/owner-dashboard/memberships/members/edit'));
const StaffProfileListPage = lazy(() => import('src/pages/owner-dashboard/staff-profiles/list'));
const StaffProfileDetailPage = lazy(() => import('src/pages/owner-dashboard/staff-profiles/detail'));
const StaffProfileCreatePage = lazy(() => import('src/pages/owner-dashboard/staff-profiles/new'));
const StaffProfileEditPage = lazy(() => import('src/pages/owner-dashboard/staff-profiles/edit'));
const ShiftListPage = lazy(() => import('src/pages/owner-dashboard/rota/shifts/list.jsx'));
const ShiftDetailPage = lazy(() => import('src/pages/owner-dashboard/rota/shifts/detail.jsx'));
const ShiftCreatePage = lazy(() => import('src/pages/owner-dashboard/rota/shifts/new.jsx'));
const ShiftEditPage = lazy(() => import('src/pages/owner-dashboard/rota/shifts/edit.jsx'));
const ShiftClaimListPage = lazy(() => import('src/pages/owner-dashboard/rota/shift-claims/list.jsx'));
const ShiftClaimDetailPage = lazy(() => import('src/pages/owner-dashboard/rota/shift-claims/detail.jsx'));
const LeaveRequestListPage = lazy(() => import('src/pages/owner-dashboard/leave-requests/list'));
const LeaveRequestDetailPage = lazy(() => import('src/pages/owner-dashboard/leave-requests/detail'));
const AttendanceListPage = lazy(() => import('src/pages/owner-dashboard/attendance/list'));
const SupervisionPage = lazy(() => import('src/pages/owner-dashboard/supervision'));
const SupervisionDetailPage = lazy(() => import('src/pages/dashboard/active-routes/supervision/detail'));
const SupervisionSignOffPage = lazy(() => import('src/pages/dashboard/active-routes/supervision/sign-off'));
const AppraisalPage = lazy(() => import('src/pages/dashboard/active-routes/appraisals'));
const AppraisalDetailPage = lazy(() => import('src/pages/dashboard/active-routes/appraisals/detail'));
const AppraisalSignOffPage = lazy(() => import('src/pages/dashboard/active-routes/appraisals/sign-off'));
const TeamCompliancePage = lazy(() => import('src/pages/dashboard/active-routes/team-compliance'));
const TeamComplianceDetailPage = lazy(() => import('src/pages/dashboard/active-routes/team-compliance/detail'));
const TrainingPage = lazy(() => import('src/pages/dashboard/active-routes/training'));
const RequirementsPage = lazy(() => import('src/pages/dashboard/active-routes/requirements'));
const RotaPage = lazy(() => import('src/pages/dashboard/active-routes/rota'));
const KioskListPage = lazy(() => import('src/pages/dashboard/active-routes/kiosk'));
const KioskDetailPage = lazy(() => import('src/pages/dashboard/active-routes/kiosk/detail'));
//documents
const DocumentsPage = lazy(() => import('src/pages/dashboard/active-routes/documents'));
const DocumentDetailPage = lazy(() => import('src/pages/dashboard/active-routes/documents/detail'));
const DocumentAcknowledgementsPage = lazy(() => import('src/pages/dashboard/active-routes/documents/acknowledgements'));
const DocumentCategoriesPage = lazy(() => import('src/pages/dashboard/active-routes/documents/categories'));
//reports
const ReportsPage = lazy(() => import('src/pages/dashboard/active-routes/reports'));
const PeepFloorPlanPage = lazy(() => import('src/pages/dashboard/active-routes/floor-plan'));
const PeepAddPinPage = lazy(() => import('src/pages/owner-dashboard/peep-and-floor-plan/add-pin.jsx'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserDetailPage = lazy(() => import('src/pages/dashboard/user/detail'));
const ResidentListPage = lazy(() => import('src/pages/owner-dashboard/residents/list'));
const ResidentDetailPage = lazy(() => import('src/pages/owner-dashboard/residents/detail'));
const MessagesPage = lazy(() => import('src/pages/dashboard/messages'));
const StatsPage = lazy(() => import('src/pages/owner-dashboard/statistics'));
const StaffDashboardSettingsPage = lazy(() => import('src/pages/owner-dashboard/staff-dashboard-settings.jsx'));
const ConfigurationPage = lazy(() => import('src/pages/owner-dashboard/configuration.jsx'));
const OwnerSettingsPage = lazy(() => import('src/pages/owner-dashboard/settings.jsx'));
const PeepRecordsListPage = lazy(() => import('src/pages/owner-dashboard/peep-records/list.jsx'));
const PeepRecordCreatePage = lazy(() => import('src/pages/owner-dashboard/peep-records/new.jsx'));
const PeepRecordDetailPage = lazy(() => import('src/pages/owner-dashboard/peep-records/detail.jsx'));
const PeepRecordEditPage = lazy(() => import('src/pages/owner-dashboard/peep-records/edit.jsx'));
const FloorPlanListPage = lazy(() => import('src/pages/owner-dashboard/floor-plans/list.jsx'));
const OrgRollupPage = lazy(() => import('src/pages/owner-dashboard/org-rollup.jsx'));
const SiteDetailPage = lazy(() => import('src/pages/owner-dashboard/peep-and-floor-plan/site-detail.jsx'));
const TempyConnectionPage = lazy(() => import('src/pages/dashboard/active-routes/tempy-connection'));
const DataUsagePage = lazy(() => import('src/pages/dashboard/active-routes/data-usage'));
const DataUsageDetailPage = lazy(() => import('src/pages/dashboard/active-routes/data-usage/detail'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const FireDrillsPage = lazy(() => import('src/pages/owner-dashboard/fire-drills'));

// family engagement
const FamilyOverviewPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/overview'));
const FamilyModerationPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/moderation'));
const CommunityWallPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/community-wall'));
const NewslettersPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/newsletters'));
const NewsletterEditPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/newsletters-edit'));
const GazettesPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/gazettes'));
const FamilyGroupsPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/family-groups'));
const FamilySettingsPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/settings'));
const FamilyInvitationListPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/invitations/list'));
const FamilyInvitationDetailPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/invitations/detail'));
const FamilyInvitationCreatePage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/invitations/new'));
const FamilyInvitationEditPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/invitations/edit'));
const FamilyMemberListPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/members/list'));
const FamilyMemberDetailPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/members/detail'));
const FamilyMemberEditPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/members/edit'));


// Compatibility redirect helpers for legacy bookmark / link stability
function LegacySiteRedirect({ target }) {
  const { siteId } = useParams();
  return <Navigate to={`/owner-dashboard/peep-and-floor-plan/site/${siteId}/${target}`} replace />;
}

function LegacyPeepRecordEditRedirect() {
  const { id } = useParams();
  return <Navigate to={`/owner-dashboard/peep-and-floor-plan/peep-records/${id}/edit`} replace />;
}

// ----------------------------------------------------------------------

const layoutContent = (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

// Organization Owner permission level (4) — kept separate from admin (1),
// site manager (2) and line manager (3).
export const ownerDashboardRoutes = [
  {
    path: 'owner-dashboard',
    element: CONFIG.auth.skip ? (
      <>{layoutContent}</>
    ) : (
      <ProtectedRoute requiredPermission={[4]}>{layoutContent}</ProtectedRoute>
    ),
    children: [
      { element: <OwnerDashboardPage />, index: true },
      {
        path: 'departments',
        children: [
          { index: true, element: <DepartmentListPage /> },
          { path: ':id', element: <DepartmentDetailPage /> },
        ],
      },
      {
        path: 'job-titles',
        children: [
          { index: true, element: <JobTitleListPage /> },
          { path: ':id', element: <Navigate to="/owner-dashboard/job-titles" replace /> },
        ],
      },
      {
        // Branch -> Site (frontend route only; API paths unchanged).
        path: 'sites',
        children: [
          { index: true, element: <BranchListPage /> },
          { path: 'new', element: <BranchCreatePage /> },
          { path: ':id', element: <BranchDetailPage /> },
          { path: ':id/edit', element: <BranchEditPage /> },
        ],
      },
      {
        path: 'staff-profiles',
        children: [
          { index: true, element: <StaffProfileListPage /> },
          { path: 'new', element: <StaffProfileCreatePage /> },
          { path: ':id', element: <StaffProfileDetailPage /> },
          { path: ':id/edit', element: <StaffProfileEditPage /> },
        ],
      },
      {
        path: 'memberships',
        children: [
          { index: true, element: <Navigate to="invitations" replace /> },
          {
            path: 'invitations',
            children: [
              { index: true, element: <InvitationListPage /> },
              { path: 'new', element: <InvitationCreatePage /> },
              { path: ':id', element: <InvitationDetailPage /> },
              { path: ':id/edit', element: <InvitationEditPage /> },
            ],
          },
          {
            path: 'members',
            children: [
              { index: true, element: <MemberListPage /> },
              { path: ':id', element: <MemberDetailPage /> },
              { path: ':id/edit', element: <MemberEditPage /> },
            ],
          },
        ],
      },
      {
        path: 'shifts',
        children: [
          { index: true, element: <ShiftListPage /> },
          { path: ':id', element: <ShiftDetailPage /> },
          { path: 'new', element: <ShiftCreatePage /> },
          { path: ':id/edit', element: <ShiftEditPage /> },
        ],
      },
      {
        path: 'shift-claims',
        children: [
          { index: true, element: <ShiftClaimListPage /> },
          { path: ':id', element: <ShiftClaimDetailPage /> },
        ],
      },
      {
        path: 'kiosk',
        children: [
          { index: true, element: <KioskListPage ownerDashboard /> },
          { path: ':id', element: <KioskDetailPage ownerDashboard /> },
        ],
      },
      {
        path: 'peep-and-floor-plan',
        children: [
          { index: true, element: <OrgRollupPage /> },
          { path: 'site/:siteId', element: <SiteDetailPage /> },
          { path: 'site/:siteId/map', element: <PeepFloorPlanPage ownerDashboard /> },
          { path: 'site/:siteId/map/add-pin', element: <PeepAddPinPage /> },
          { path: 'site/:siteId/add-pin', element: <PeepAddPinPage /> },
          { path: 'site/:siteId/peep-records', element: <PeepRecordsListPage /> },
          { path: 'site/:siteId/floor-plans', element: <FloorPlanListPage /> },
          { path: 'peep-records', element: <PeepRecordsListPage /> },
          { path: 'peep-records/new', element: <PeepRecordCreatePage /> },
          { path: 'peep-records/:id', element: <PeepRecordDetailPage /> },
          { path: 'peep-records/:id/edit', element: <PeepRecordEditPage /> },
          { path: 'floor-plans', element: <FloorPlanListPage /> },
        ],
      },
      {
        path: 'peep-records',
        children: [
          { index: true, element: <Navigate to="/owner-dashboard/peep-and-floor-plan/peep-records" replace /> },
          { path: 'site/:siteId', element: <LegacySiteRedirect target="peep-records" /> },
          { path: 'new', element: <Navigate to="/owner-dashboard/peep-and-floor-plan/peep-records/new" replace /> },
          { path: ':id/edit', element: <LegacyPeepRecordEditRedirect /> },
        ],
      },
      {
        path: 'floor-plans',
        children: [
          { index: true, element: <Navigate to="/owner-dashboard/peep-and-floor-plan/floor-plans" replace /> },
          { path: 'site/:siteId', element: <LegacySiteRedirect target="floor-plans" /> },
        ],
      },
      { path: 'org-rollup', element: <Navigate to="/owner-dashboard/peep-and-floor-plan" replace /> },
      { path: "documents", element: <DocumentsPage ownerDashboard /> },
      { path: "documents/categories", element: <DocumentCategoriesPage ownerDashboard /> },
      { path: "documents/:id", element: <DocumentDetailPage ownerDashboard /> },
      { path: "reports", element: <ReportsPage ownerDashboard /> },
      { path: "messages", element: <MessagesPage /> },
      { path: "documents/:id/acknowledgements", element: <DocumentAcknowledgementsPage /> },
      {
        path: 'directory',
        children: [
          { index: true, element: <UserListPage /> },
          { path: 'visitor-invitation', element: <UserListPage /> },
          { path: 'visit-sessions', element: <UserListPage /> },
          { path: 'app-accounts', element: <UserListPage /> },
          { path: ":id", element: <UserDetailPage /> }
        ]
      },
      {
        path: 'residents',
        children: [
          { index: true, element: <ResidentListPage /> },
          { path: ':id', element: <ResidentDetailPage /> },
        ],
      },
      { path: "statistics", element: <StatsPage /> },
      { path: "staff-dashboard-settings", element: <StaffDashboardSettingsPage /> },
      { path: "configuration", element: <ConfigurationPage /> },
      { path: "settings", element: <OwnerSettingsPage /> },
      { path: "fire-drills", element: <FireDrillsPage /> },
      {
        path: 'rota-management',
        children: [{ index: true, element: <RotaPage ownerDashboard /> }]
      },
      {
        path: 'leave-requests',
        children: [
          { index: true, element: <LeaveRequestListPage /> },
          { path: ':id', element: <LeaveRequestDetailPage /> },
        ],
      },
      { path: 'attendance', element: <AttendanceListPage /> },
      {
        path: 'supervision',
        children: [
          { index: true, element: <SupervisionPage /> },
          { path: ':id', element: <SupervisionDetailPage /> },
          { path: ':id/sign-off', element: <SupervisionSignOffPage /> },
        ],
      },
      {
        path: 'appraisals',
        children: [
          { index: true, element: <AppraisalPage /> },
          { path: ':id', element: <AppraisalDetailPage /> },
          { path: ':id/sign-off', element: <AppraisalSignOffPage /> },
        ],
      },
      {
        path: 'team-compliance',
        children: [
          { index: true, element: <TeamCompliancePage /> },
          { path: ':id', element: <TeamComplianceDetailPage /> },
        ],
      },
      { path: 'training', element: <TrainingPage /> },
      { path: 'requirements', element: <RequirementsPage /> },
      { path: 'tempy-connection', element: <TempyConnectionPage ownerDashboard /> },
      {
        path: 'billing-and-usage',
        children: [
          { index: true, element: <DataUsagePage /> },
          { path: ':id', element: <DataUsageDetailPage /> },
          { path: ':id/sites/:branchId', element: <DataUsageDetailPage /> },
        ],
      },
      {
        path: 'data-usage',
        children: [
          { index: true, element: <DataUsagePage /> },
          { path: ':id', element: <DataUsageDetailPage /> },
          { path: ':id/sites/:branchId', element: <DataUsageDetailPage /> },
        ],
      },
      {
        path: 'family-engagement',
        children: [
          { element: <FamilyOverviewPage />, index: true },
          { path: 'overview', element: <FamilyOverviewPage /> },
          { path: 'moderation', element: <FamilyModerationPage /> },
          { path: 'community-wall', element: <CommunityWallPage /> },
          {
            path: 'newsletters',
            children: [
              { index: true, element: <NewslettersPage /> },
              { path: ':id/edit', element: <NewsletterEditPage /> },
            ],
          },
          { path: 'gazettes', element: <GazettesPage /> },
          { path: 'family-groups', element: <FamilyGroupsPage /> },
          { path: 'settings', element: <FamilySettingsPage /> },
          {
            path: 'memberships',
            children: [
              { element: <Navigate to="invitations" replace />, index: true },
              {
                path: 'invitations',
                children: [
                  { element: <FamilyInvitationListPage />, index: true },
                  { path: 'new', element: <FamilyInvitationCreatePage /> },
                  { path: ':id', element: <FamilyInvitationDetailPage /> },
                  { path: ':id/edit', element: <FamilyInvitationEditPage /> },
                ],
              },
              {
                path: 'members',
                children: [
                  { element: <FamilyMemberListPage />, index: true },
                  { path: ':id', element: <FamilyMemberDetailPage /> },
                  { path: ':id/edit', element: <FamilyMemberEditPage /> },
                ],
              },
            ],
          },
        ],
      },
      { path: 'account', element: <UserAccountPage /> },
      { path: 'profile', element: <UserAccountPage /> },
    ],
  },
];