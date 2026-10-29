import { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import ProtectedRoute from 'src/auth/guard/custom-auth-guard';

// ----------------------------------------------------------------------

//dashboard
const LineManagerDashboardPage = lazy(() => import('src/pages/line-manager-dashboard'));

//leave approval
const LeaveApprovalPage = lazy(() => import('src/pages/dashboard/active-routes/leave-approval'));
const LeaveApprovalDetailPage = lazy(() => import('src/pages/dashboard/active-routes/leave-approval/detail'));

//photo approval 
const PhotoApprovalPage = lazy(() => import('src/pages/dashboard/active-routes/photo-approval'));

//rota
const RotaPage = lazy(() => import('src/pages/dashboard/active-routes/rota'));

//team compliance
const TeamCompliancePage = lazy(() => import('src/pages/dashboard/active-routes/team-compliance'));

//team attendance
const TeamAttendancePage = lazy(() => import('src/pages/dashboard/active-routes/team-attendance'));

//supervision
const SupervisionPage = lazy(() => import('src/pages/dashboard/active-routes/supervision'));
const SupervisionDetailPage = lazy(() => import('src/pages/dashboard/active-routes/supervision/detail'));
const SupervisionSignOffPage = lazy(() => import('src/pages/dashboard/active-routes/supervision/sign-off'));

//appraisals
const AppraisalPage = lazy(() => import('src/pages/dashboard/active-routes/appraisals'));
const AppraisalDetailPage = lazy(() => import('src/pages/dashboard/active-routes/appraisals/detail'));
const AppraisalSignOffPage = lazy(() => import('src/pages/dashboard/active-routes/appraisals/sign-off'));

//training
const TrainingPage = lazy(() => import('src/pages/dashboard/active-routes/training'));

//client feedback
const FeedbackPage = lazy(() => import('src/pages/dashboard/active-routes/feedback'));

//fire drills
const FireDrillsPage = lazy(() => import('src/pages/dashboard/active-routes/fire-drills/line-manager'));

//residents
const ResidentListPage = lazy(() => import('src/pages/site-manager/residents/list'));
const ResidentDetailPage = lazy(() => import('src/pages/site-manager/residents/detail'));

//messages
const MessagesPage = lazy(() => import('src/pages/dashboard/messages'));

//connect to tempy
const TempyConnectionPage = lazy(() => import('src/pages/dashboard/active-routes/tempy-connection'));

//documents
const DocumentsPage = lazy(() => import('src/pages/dashboard/active-routes/documents'));
const DocumentDetailPage = lazy(() => import('src/pages/dashboard/active-routes/documents/detail'));
const DocumentCategoriesPage = lazy(() => import('src/pages/dashboard/active-routes/documents/categories'));

//family engagement
const FamilyOverviewPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/overview'));
const FamilyModerationPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/moderation'));
const CommunityWallPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/community-wall'));
const NewslettersPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/newsletters'));
const NewsletterEditPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/newsletters-edit'));
const GazettesPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/gazettes'));
const FamilyGroupsPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/family-groups'));
const FamilyInvitationListPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/invitations/list'));
const FamilyInvitationDetailPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/invitations/detail'));
const FamilyInvitationCreatePage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/invitations/new'));
const FamilyInvitationEditPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/invitations/edit'));
const FamilyMemberListPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/members/list'));
const FamilyMemberDetailPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/members/detail'));
const FamilyMemberEditPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/memberships/members/edit'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));

// ----------------------------------------------------------------------

const layoutContent = (
    <DashboardLayout>
        <Suspense fallback={<LoadingScreen />}>
            <Outlet />
        </Suspense>
    </DashboardLayout>
);


export const lineManagerDashboardRoutes = [
    {
        path: 'line-manager',
        // element: CONFIG.auth.skip ? <>{layoutContent}</> : <>{layoutContent}</>,
        element: CONFIG.auth.skip ? <>{layoutContent}</> : <ProtectedRoute requiredPermission={[3]}>{layoutContent}</ProtectedRoute>,
        children: [
            { element: <LineManagerDashboardPage />, index: true },

            { path: 'team-rota', element: <RotaPage showTempyConnect /> },

            { path: "leave-approval", element: <LeaveApprovalPage /> },

            { path: "leave-approval/:id", element: <LeaveApprovalDetailPage /> },

            { path: "photo-approval", element: <PhotoApprovalPage /> },

            { path: "team-attendance", element: <TeamAttendancePage /> },

            { path: "team-compliance", element: <TeamCompliancePage /> },

            { path: "supervision", element: <SupervisionPage /> },

            { path: "supervision/:id", element: <SupervisionDetailPage /> },

            { path: "supervision/:id/sign-off", element: <SupervisionSignOffPage /> },

            { path: "appraisals", element: <AppraisalPage /> },

            { path: "appraisals/:id", element: <AppraisalDetailPage /> },

            { path: "appraisals/:id/sign-off", element: <AppraisalSignOffPage /> },

            { path: "training", element: <TrainingPage /> },

            { path: "feedback", element: <FeedbackPage /> },

            { path: "messages", element: <MessagesPage /> },

            { path: "fire-drills", element: <FireDrillsPage /> },

            { path: "residents", element: <ResidentListPage /> },

            { path: "residents/:id", element: <ResidentDetailPage /> },

            { path: "documents", element: <DocumentsPage /> },
            { path: "documents/categories", element: <DocumentCategoriesPage /> },
            { path: "documents/:id", element: <DocumentDetailPage /> },

            { path: "tempy-connection", element: <TempyConnectionPage /> },

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
        ]
    }

];