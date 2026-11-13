import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { LoadingScreen } from 'src/components/loading-screen';
import { CONFIG } from 'src/config-global';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { EmptyDashboardCard } from 'src/sections/owner/empty-dashboard-card';
import { useGetOrganizationSiteDashboardQuery } from 'src/store/Reducer/organizations-api';

import { AnalyticsNews } from '../../analytics/analytics-news';
import { AnalyticsOrderTimeline } from '../../analytics/analytics-order-timeline';
import { DashboardGlanceTable } from '../../analytics/dashboard-glance-table';
import { CourseWidgetSummary } from '../../course/course-widget-summary';
import { mapSiteDashboard } from '../map-site-dashboard';
import { PeopleOnSiteNow } from '../people-on-site-now';
import { VisitorContractorActivity } from '../visitor-contractor-activity';

// ----------------------------------------------------------------------

const GLANCE_CARD_HEIGHT = 380;

const PERIOD_OPTIONS = ['This week', 'This month', 'This year'];

const PERIOD_TO_API = {
  'This week': 'thisWeek',
  'This month': 'thisMonth',
  'This year': 'thisYear',
};

export function OverviewAppView() {
  const router = useRouter();
  const { user } = useSelector((state) => state.user);
  const { organizationId } = useCurrentOrganization();
  const [period, setPeriod] = useState('This year');

  const { data, isLoading, isFetching } = useGetOrganizationSiteDashboardQuery(
    {
      organizationId,
      period: PERIOD_TO_API[period],
    },
    { skip: !organizationId }
  );

  const dashboard = useMemo(() => mapSiteDashboard(data), [data]);
  const { summary } = dashboard;

  const summaryCards = [
    {
      title: 'Visitors On Site',
      total: summary.visitorsOnSite,
      color: 'info',
      icon: 'ic-user.svg',
      href: paths.siteManager.directory.root,
    },
    {
      title: 'Staff On Site',
      total: summary.staffOnSite,
      color: 'primary',
      icon: 'ic-users.svg',
      href: paths.siteManager.directory.root,
    },
    {
      title: 'Residents Present',
      total: summary.residentsPresent,
      color: 'success',
      icon: 'ic-home.svg',
      href: paths.siteManager.residents.root,
    },
    {
      title: 'Pending Approvals',
      total: summary.pendingApprovals,
      color: 'warning',
      icon: 'ic-clock.svg',
      href: paths.siteManager.pendingApproval,
    },
    {
      title: 'Contractors on site',
      total: summary.contractorsOnSite,
      color: 'secondary',
      icon: 'ic-job.svg',
      href: paths.siteManager.directory.root,
    },
    {
      title: 'Professionals on site',
      total: summary.professionalsOnSite,
      color: 'error',
      icon: 'ic-users.svg',
      href: paths.siteManager.directory.root,
    },
    {
      title: 'Residents out of the home',
      total: summary.residentsOutOfHome,
      color: 'error',
      icon: 'ic-external.svg',
      href: paths.siteManager.residents.root,
    },
  ];

  if (!organizationId || isLoading || (!data && isFetching)) {
    return (
      <DashboardContent maxWidth="xl">
        <LoadingScreen sx={{ minHeight: '60vh' }} />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5, textTransform: 'capitalize' } }}>
        Hi, {user?.basicInfo?.name || 'Manager'} 👋
      </Typography>

      <Grid container spacing={3} sx={{ opacity: isLoading ? 0.72 : 1 }}>
        {summaryCards.map((card) => (
          <Grid key={card.title} xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title={card.title}
              total={card.total}
              color={card.color}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/${card.icon}`}
              onClick={() => router.push(card.href)}
              sx={{ cursor: 'pointer', width: 1 }}
            />
          </Grid>
        ))}

        <Grid xs={12} md={7.5}>
          <PeopleOnSiteNow
            title="People on site now"
            subheader={
              dashboard.peopleTotal
                ? `${dashboard.peopleTotal} currently on site`
                : undefined
            }
            tableData={dashboard.people}
            onClick={() => router.push(paths.siteManager.directory.root)}
            sx={{ height: 1 }}
            headLabel={[
              { id: 'name', label: 'Name' },
              { id: 'type', label: 'Type', align: 'center' },
              { id: 'checkIn', label: 'Check In' },
              { id: 'status', label: 'Status', align: 'center' },
              { id: 'actions', label: 'Actions', align: 'center' },
            ]}
          />
        </Grid>

        <Grid xs={12} md={4.5}>
          {dashboard.hasActivity ? (
            <AnalyticsNews title="Activity Feed" list={dashboard.activityFeed} sx={{ height: 1 }} />
          ) : (
            <EmptyDashboardCard title="Activity Feed" />
          )}
        </Grid>

        <Grid xs={12}>
          {dashboard.hasVisitorActivity ? (
            <VisitorContractorActivity
              activity={dashboard.visitorActivity}
              timeframe={period}
              onTimeframeChange={setPeriod}
              timeframeOptions={PERIOD_OPTIONS}
            />
          ) : (
            <EmptyDashboardCard title="Visitor and contractor activity" />
          )}
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          {dashboard.hasCompliance ? (
            <DashboardGlanceTable
              title="Compliance"
              subheader={`${dashboard.compliance.scoreLabel} compliant · Site team`}
              columns={dashboard.compliance.columns}
              rows={dashboard.compliance.rows}
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          ) : (
            <EmptyDashboardCard
              title="Compliance"
              subheader="Site team"
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          )}
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          {dashboard.hasTraining ? (
            <DashboardGlanceTable
              title="Staff Training"
              subheader={`${dashboard.training.scoreLabel} compliant · Site team`}
              columns={dashboard.training.columns}
              rows={dashboard.training.rows}
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          ) : (
            <EmptyDashboardCard
              title="Staff Training"
              subheader="Site team"
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          )}
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          {dashboard.hasSupervision ? (
            <DashboardGlanceTable
              title="Supervision & Appraisal"
              subheader={`${dashboard.supervision.scoreLabel} compliant · Site team`}
              columns={dashboard.supervision.columns}
              rows={dashboard.supervision.rows}
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          ) : (
            <EmptyDashboardCard
              title="Supervision & Appraisal"
              subheader="Site team"
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          )}
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          {dashboard.hasOpenShifts ? (
            <AnalyticsOrderTimeline
              title="Open shifts to claim"
              subheader="Site shift cover"
              list={dashboard.openShifts}
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          ) : (
            <EmptyDashboardCard
              title="Open shifts to claim"
              subheader="Site shift cover"
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          )}
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
