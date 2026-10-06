import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

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

//appraisals
const AppraisalPage = lazy(() => import('src/pages/dashboard/active-routes/appraisals'));
const AppraisalDetailPage = lazy(() => import('src/pages/dashboard/active-routes/appraisals/detail'));

//training
const TrainingPage = lazy(() => import('src/pages/dashboard/active-routes/training'));

//client feedback
const FeedbackPage = lazy(() => import('src/pages/dashboard/active-routes/feedback'));

//fire drills
const FireDrillsPage = lazy(() => import('src/pages/dashboard/active-routes/fire-drills/line-manager'));

//residents
const ResidentListPage = lazy(() => import('src/pages/site-manager/residents/list'));
const ResidentDetailPage = lazy(() => import('src/pages/site-manager/residents/detail'));

//connect to tempy
const TempyConnectionPage = lazy(() => import('src/pages/dashboard/active-routes/tempy-connection'));

//documents
const DocumentsPage = lazy(() => import('src/pages/dashboard/active-routes/documents'));
const DocumentDetailPage = lazy(() => import('src/pages/dashboard/active-routes/documents/detail'));

//family engagement
const FamilyOverviewPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/overview'));
const FamilyModerationPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/moderation'));
const CommunityWallPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/community-wall'));
const NewslettersPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/newsletters'));
const GazettesPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/gazettes'));
const FamilyGroupsPage = lazy(() => import('src/pages/dashboard/active-routes/family-engagement/family-groups'));

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

            { path: "appraisals", element: <AppraisalPage /> },

            { path: "appraisals/:id", element: <AppraisalDetailPage /> },

            { path: "training", element: <TrainingPage /> },

            { path: "feedback", element: <FeedbackPage /> },

            { path: "fire-drills", element: <FireDrillsPage /> },

            { path: "residents", element: <ResidentListPage /> },

            { path: "residents/:id", element: <ResidentDetailPage /> },

            { path: "documents", element: <DocumentsPage /> },
            { path: "documents/:id", element: <DocumentDetailPage /> },

            { path: "tempy-connection", element: <TempyConnectionPage /> },

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
                ],
            },
        ]
    }

];
