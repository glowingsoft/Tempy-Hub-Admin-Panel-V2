import { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

// import { AuthGuard } from 'src/auth/guard';
import ProtectedRoute from 'src/auth/guard/custom-auth-guard';

// ----------------------------------------------------------------------

// Overview
const IndexPage = lazy(() => import('src/pages/dashboard'));
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const OverviewBankingPage = lazy(() => import('src/pages/dashboard/active-routes/banking'));
const OverviewBookingPage = lazy(() => import('src/pages/dashboard/booking'));
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'));
const OverviewCoursePage = lazy(() => import('src/pages/dashboard/course'));
// Product
const ProductDetailsPage = lazy(() => import('src/pages/dashboard/product/details'));
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit'));
// Order
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));
// Invoice
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details'));
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'));
// User
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
const UserDetailPage = lazy(() => import('src/pages/dashboard/user/detail'));
const ResidentListPage = lazy(() => import('src/pages/site-manager/residents/list'));
const ResidentDetailPage = lazy(() => import('src/pages/site-manager/residents/detail'));
const MessagesPage = lazy(() => import('src/pages/dashboard/messages'));
// Blog
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'));
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'));
// Job
const JobDetailsPage = lazy(() => import('src/pages/dashboard/job/details'));
const JobListPage = lazy(() => import('src/pages/dashboard/job/list'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/job/new'));
const JobEditPage = lazy(() => import('src/pages/dashboard/job/edit'));
// Tour
const TourDetailsPage = lazy(() => import('src/pages/dashboard/tour/details'));
const TourListPage = lazy(() => import('src/pages/dashboard/tour/list'));
const TourCreatePage = lazy(() => import('src/pages/dashboard/tour/new'));
const TourEditPage = lazy(() => import('src/pages/dashboard/tour/edit'));
// File manager
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
// App
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const MailPage = lazy(() => import('src/pages/dashboard/mail'));
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
// Test render page by role
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// Blank page
const ParamsPage = lazy(() => import('src/pages/dashboard/params'));
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));

//invitations
const InvitationsPage = lazy(() => import('src/pages/dashboard/active-routes/invitations/list'));
const InvitationPage = lazy(() => import('src/pages/dashboard/active-routes/invitations/new'));

//stats
const StatsPage = lazy(() => import('src/pages/dashboard/active-routes/stats'));

//kiosk
const KioskListPage = lazy(() => import('src/pages/dashboard/active-routes/kiosk'));
const KioskDetailPage = lazy(() => import('src/pages/dashboard/active-routes/kiosk/detail'));

//visitor feedback
const VisitorFeedbackPage = lazy(() => import('src/pages/dashboard/active-routes/visitor-feedback'));

//fire drills
const FireDrillsPage = lazy(() => import('src/pages/dashboard/active-routes/fire-drills'));

//documents
const DocumentsPage = lazy(() => import('src/pages/dashboard/active-routes/documents'));
const DocumentDetailPage = lazy(() => import('src/pages/dashboard/active-routes/documents/detail'));
const DocumentAcknowledgementsPage = lazy(() => import('src/pages/dashboard/active-routes/documents/acknowledgements'));

//supervision, appraisals, competencies, training
const SupervisionPage = lazy(() => import('src/pages/site-manager/supervision'));
const SupervisionDetailPage = lazy(() => import('src/pages/dashboard/active-routes/supervision/detail'));
const AppraisalPage = lazy(() => import('src/pages/dashboard/active-routes/appraisals'));
const AppraisalDetailPage = lazy(() => import('src/pages/dashboard/active-routes/appraisals/detail'));
const TeamCompliancePage = lazy(() => import('src/pages/dashboard/active-routes/team-compliance'));
const TrainingPage = lazy(() => import('src/pages/dashboard/active-routes/training'));

//reports

const ReportsPage = lazy(() => import('src/pages/dashboard/active-routes/reports'));

//peep and floor plan
const PeepFloorPlanPage = lazy(() => import('src/pages/dashboard/active-routes/floor-plan'));
const OrgRollupPage = lazy(() => import('src/pages/site-manager/peep-and-floor-plan'));
const SiteDetailPage = lazy(() => import('src/pages/site-manager/peep-and-floor-plan/site-detail.jsx'));
const PeepAddPinPage = lazy(() => import('src/pages/site-manager/peep-and-floor-plan/add-pin.jsx'));
const PeepRecordsListPage = lazy(() => import('src/pages/site-manager/peep-and-floor-plan/peep-records/list.jsx'));
const PeepRecordCreatePage = lazy(() => import('src/pages/site-manager/peep-and-floor-plan/peep-records/new.jsx'));
const PeepRecordDetailPage = lazy(() => import('src/pages/site-manager/peep-and-floor-plan/peep-records/detail.jsx'));
const PeepRecordEditPage = lazy(() => import('src/pages/site-manager/peep-and-floor-plan/peep-records/edit.jsx'));
const FloorPlanListPage = lazy(() => import('src/pages/site-manager/peep-and-floor-plan/floor-plans/list.jsx'));

const ConfigurationPage = lazy(() => import('src/pages/dashboard/active-routes/configuration'));

//pending approval 
const PendingApprovalPage = lazy(() => import('src/pages/dashboard/active-routes/pending-approval'));

//roles 
const RolesPage = lazy(() => import('src/pages/dashboard/active-routes/role'));

//rota
const RotaPage = lazy(() => import('src/pages/dashboard/active-routes/rota'));

//family engagement
const FamilyOverviewPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/overview'));
const FamilyModerationPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/moderation'));
const CommunityWallPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/community-wall'));
const NewslettersPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/newsletters'));
const GazettesPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/gazettes'));
const FamilyGroupsPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/family-groups'));
const FamilyInvitationListPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/invitations/list'));
const FamilyInvitationDetailPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/invitations/detail'));
const FamilyInvitationCreatePage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/invitations/new'));
const FamilyInvitationEditPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/invitations/edit'));
const FamilyMemberListPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/members/list'));
const FamilyMemberDetailPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/members/detail'));
const FamilyMemberEditPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/members/edit'));

// ----------------------------------------------------------------------

const layoutContent = (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);


export const siteManagerDashboardRoutes = [
  {
    path: 'site-manager',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <ProtectedRoute requiredPermission={[2]}>{layoutContent}</ProtectedRoute>,
    children: [
      { element: <IndexPage />, index: true },
      {
        path: 'directory',
        children: [
          { index: true, element: <UserListPage /> },
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
      {
        path: "statistics", element: <StatsPage />
      },
      {
        path: "messages", element: <MessagesPage />
      },
      {
        path: "reports", element: <ReportsPage />
      },
      {
        path: "rota", element: <RotaPage />
      },
      {
        path: "invitations",
        children: [
          { index: true, element: <InvitationsPage /> },
          { path: "new", element: <InvitationPage /> }
        ]
      },
      {
        path: "invitaions",
        children: [
          { index: true, element: <InvitationsPage /> },
          { path: "new", element: <InvitationPage /> }
        ]
      },
      {
        path: 'kiosk',
        children: [
          { index: true, element: <KioskListPage /> },
          { path: ':id', element: <KioskDetailPage /> },
        ],
      },
      {
        path: 'feedback', element: <VisitorFeedbackPage />
      },
      {
        path: 'fire-drills', element: <FireDrillsPage />
      },
      {
        path: 'peep-and-Floor-plan',
        children: [
          { index: true, element: <OrgRollupPage /> },
          { path: 'site/:siteId', element: <SiteDetailPage /> },
          { path: 'site/:siteId/map', element: <PeepFloorPlanPage siteManagerDashboard /> },
          { path: 'site/:siteId/map/add-pin', element: <PeepAddPinPage /> },
          { path: 'site/:siteId/peep-records', element: <PeepRecordsListPage /> },
          { path: 'site/:siteId/floor-plans', element: <FloorPlanListPage /> },
          { path: 'peep-records', element: <PeepRecordsListPage /> },
          { path: 'peep-records/new', element: <PeepRecordCreatePage /> },
          { path: 'peep-records/:id', element: <PeepRecordDetailPage /> },
          { path: 'peep-records/:id/edit', element: <PeepRecordEditPage /> },
          { path: 'floor-plans', element: <FloorPlanListPage /> },
        ],
      },
      { path: "documents", element: <DocumentsPage /> },
      { path: "documents/:id", element: <DocumentDetailPage /> },
      { path: "documents/:id/acknowledgements", element: <DocumentAcknowledgementsPage /> },
      {
        path: "supervision",
        children: [
          { index: true, element: <SupervisionPage /> },
          { path: ":id", element: <SupervisionDetailPage /> },
        ],
      },
      {
        path: "appraisals",
        children: [
          { index: true, element: <AppraisalPage /> },
          { path: ":id", element: <AppraisalDetailPage /> },
        ],
      },
      {
        path: "team-compliance", element: <TeamCompliancePage />
      },
      {
        path: "training", element: <TrainingPage />
      },
      {
        path: "configuration", element: <ConfigurationPage />
      },
      {
        path: "approvals", element: <PendingApprovalPage />
      },
      {
        path: "roles", element: <RolesPage />
      },
      {
        path: 'family-engagement',
        children: [
          { element: <FamilyOverviewPage />, index: true },
          { path: 'overview', element: <FamilyOverviewPage /> },
          { path: 'moderation', element: <FamilyModerationPage /> },
          { path: 'community-wall', element: <CommunityWallPage /> },
        ],
      },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      { path: 'banking', element: <OverviewBankingPage /> },
      { path: 'booking', element: <OverviewBookingPage /> },
      { path: 'file', element: <OverviewFilePage /> },
      { path: 'account', element: <UserAccountPage /> },
      { path: 'profile', element: <UserAccountPage /> },
      {
        path: 'user',
        children: [
          { element: <UserProfilePage />, index: true },
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'cards', element: <UserCardsPage /> },
          { path: 'list', element: <UserListPage /> },
          { path: 'new', element: <UserCreatePage /> },
          { path: ':id/edit', element: <UserEditPage /> },
          { path: 'account', element: <UserAccountPage /> },
        ],
      },
      {
        path: 'product',
        children: [
          { element: <ProductListPage />, index: true },
          { path: 'list', element: <ProductListPage /> },
          { path: ':id', element: <ProductDetailsPage /> },
          { path: 'new', element: <ProductCreatePage /> },
          { path: ':id/edit', element: <ProductEditPage /> },
        ],
      },
      {
        path: 'order',
        children: [
          { element: <OrderListPage />, index: true },
          { path: 'list', element: <OrderListPage /> },
          { path: ':id', element: <OrderDetailsPage /> },
        ],
      },
      {
        path: 'invoice',
        children: [
          { element: <InvoiceListPage />, index: true },
          { path: 'list', element: <InvoiceListPage /> },
          { path: ':id', element: <InvoiceDetailsPage /> },
          { path: ':id/edit', element: <InvoiceEditPage /> },
          { path: 'new', element: <InvoiceCreatePage /> },
        ],
      },
      {
        path: 'post',
        children: [
          { element: <BlogPostsPage />, index: true },
          { path: 'list', element: <BlogPostsPage /> },
          { path: ':title', element: <BlogPostPage /> },
          { path: ':title/edit', element: <BlogEditPostPage /> },
          { path: 'new', element: <BlogNewPostPage /> },
        ],
      },
      {
        path: 'job',
        children: [
          { element: <JobListPage />, index: true },
          { path: 'list', element: <JobListPage /> },
          { path: ':id', element: <JobDetailsPage /> },
          { path: 'new', element: <JobCreatePage /> },
          { path: ':id/edit', element: <JobEditPage /> },
        ],
      },
      {
        path: 'tour',
        children: [
          { element: <TourListPage />, index: true },
          { path: 'list', element: <TourListPage /> },
          { path: ':id', element: <TourDetailsPage /> },
          { path: 'new', element: <TourCreatePage /> },
          { path: ':id/edit', element: <TourEditPage /> },
        ],
      },
      { path: 'file-manager', element: <FileManagerPage /> },
      { path: 'mail', element: <MailPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { path: 'params', element: <ParamsPage /> },
      { path: 'blank', element: <BlankPage /> },
      {
        path: 'family-engagement',
        children: [
          { element: <FamilyOverviewPage />, index: true },
          { path: 'overview', element: <FamilyOverviewPage /> },
          { path: 'moderation', element: <FamilyModerationPage /> },
          { path: 'community-wall', element: <CommunityWallPage /> },
          { path: 'newsletters', element: <NewslettersPage /> },
          { path: 'gazettes', element: <GazettesPage /> },
          { path: 'family-groups', element: <FamilyGroupsPage /> },
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
    ],
  },
];