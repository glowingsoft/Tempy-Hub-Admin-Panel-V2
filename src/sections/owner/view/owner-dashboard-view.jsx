import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { CONFIG } from 'src/config-global';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { AnalyticsActiveModules } from 'src/sections/overview/analytics/analytics-active-modules';
import { AnalyticsConversionRates } from 'src/sections/overview/analytics/analytics-conversion-rates';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';
import { AnalyticsFireDrills } from 'src/sections/overview/analytics/analytics-fire-drills';
import { AnalyticsOrderTimeline } from 'src/sections/overview/analytics/analytics-order-timeline';
import { AnalyticsResidentRisk } from 'src/sections/overview/analytics/analytics-resident-risk';
import { DashboardGlanceTable } from 'src/sections/overview/analytics/dashboard-glance-table';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { TempyConnectCard } from 'src/sections/tempy-connection/tempy-connect-card';
import { useGetOrganizationDashboardQuery } from 'src/store/Reducer/organizations-api';

import { EmptyDashboardCard } from '../empty-dashboard-card';
import { mapOwnerDashboard } from '../map-dashboard';

// ----------------------------------------------------------------------

const GLANCE_CARD_HEIGHT = 380;

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

export function OwnerDashboardView() {
  const { user } = useSelector((state) => state.user);
  const router = useRouter();
  const { organizationId } = useCurrentOrganization();

  const { data, isLoading } = useGetOrganizationDashboardQuery(organizationId, {
    skip: !organizationId,
  });

  const dashboard = useMemo(() => mapOwnerDashboard(data), [data]);
  const { summary } = dashboard;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, {user?.basicInfo?.name || 'Owner'} 👋
      </Typography>

      <TempyConnectCard usagePath={paths.owner.tempyConnection} sx={{ mb: 3 }} />

      <Grid container spacing={3} sx={{ opacity: isLoading ? 0.72 : 1 }}>
        <Grid xs={12} sm={6} md={2.4}>
          <CourseWidgetSummary
            title="Total Staff"
            total={summary.totalStaff}
            color="primary"
            icon={icon('ic-job')}
            onClick={() => router.push(paths.owner.directory.root)}
            sx={{ cursor: 'pointer', width: 1 }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={2.4}>
          <CourseWidgetSummary
            title="Total Residents"
            total={summary.totalResidents}
            color="success"
            icon={icon('ic-user')}
            onClick={() => router.push(paths.owner.residents.root)}
            sx={{ cursor: 'pointer', width: 1 }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={2.4}>
          <CourseWidgetSummary
            title="Today Visitors"
            total={summary.todayVisitors}
            color="warning"
            icon={icon('ic-calendar')}
            onClick={() => router.push(paths.owner.directory.root)}
            sx={{ cursor: 'pointer', width: 1 }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={2.4}>
          <CourseWidgetSummary
            title="Total Contractors"
            total={summary.totalContractors}
            color="info"
            icon={icon('ic-analytics')}
            onClick={() => router.push(paths.owner.directory.root)}
            sx={{ cursor: 'pointer', width: 1 }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={2.4}>
          <CourseWidgetSummary
            title="Total Professionals"
            total={summary.totalProfessionals}
            color="error"
            icon={icon('ic-users')}
            onClick={() => router.push(paths.owner.directory.root)}
            sx={{ cursor: 'pointer', width: 1 }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          {dashboard.hasAttendance ? (
            <AnalyticsWebsiteVisits
              title="Attendance"
              subheader="Present vs absent this week"
              chart={{
                categories: dashboard.attendance.categories,
                series: dashboard.attendance.series,
                options: {
                  tooltip: {
                    y: {
                      formatter: (value) => (value == null ? '—' : `${value}`),
                    },
                  },
                },
              }}
            />
          ) : (
            <EmptyDashboardCard title="Attendance" subheader="Present vs absent this week" />
          )}
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          {dashboard.hasLeave ? (
            <AnalyticsCurrentVisits
              title="Leave breakdown"
              chart={{ series: dashboard.leaveBreakdown }}
              sx={{ height: 1, width: 1 }}
            />
          ) : (
            <EmptyDashboardCard title="Leave breakdown" />
          )}
        </Grid>

        <Grid xs={12} md={6}>
          {dashboard.hasStaffByDepartment ? (
            <AnalyticsConversionRates
              title="Staff by department"
              subheader={`${dashboard.staffByDepartment.total} staff across the organization`}
              chart={{
                categories: dashboard.staffByDepartment.categories,
                series: dashboard.staffByDepartment.series,
              }}
            />
          ) : (
            <EmptyDashboardCard
              title="Staff by department"
              subheader={`${dashboard.staffByDepartment.total} staff across the organization`}
            />
          )}
        </Grid>

        <Grid xs={12} md={6}>
          {dashboard.hasWorkforce ? (
            <AnalyticsConversionRates
              title="Workforce overview"
              subheader="This month, organization-wide"
              chart={{
                categories: dashboard.workforceOverview.categories,
                series: dashboard.workforceOverview.series,
              }}
            />
          ) : (
            <EmptyDashboardCard
              title="Workforce overview"
              subheader="This month, organization-wide"
            />
          )}
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          {dashboard.hasEvacuation ? (
            <AnalyticsResidentRisk
              title="Resident evacuation risk"
              subheader="PEEP levels, org-wide"
              list={dashboard.evacuationRisk}
              sx={{ height: 1 }}
            />
          ) : (
            <EmptyDashboardCard
              title="Resident evacuation risk"
              subheader="PEEP levels, org-wide"
            />
          )}
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          {dashboard.hasModules ? (
            <AnalyticsActiveModules
              title="Active modules"
              subheader={`${dashboard.activeModules.filter((item) => item.enabled).length} of ${dashboard.activeModules.length} currently entitled`}
              modules={dashboard.activeModules}
              sx={{ height: 1 }}
            />
          ) : (
            <EmptyDashboardCard
              title="Active modules"
              subheader="Currently entitled for this organization"
            />
          )}
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AnalyticsFireDrills
            title="Fire drills"
            subheader="Org-wide, this quarter"
            completed={dashboard.fireDrills.completed}
            overdueSites={dashboard.fireDrills.overdueSites}
            sx={{ height: 1 }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          {dashboard.hasCompliance ? (
            <DashboardGlanceTable
              title="Compliance"
              subheader={`${dashboard.compliance.scoreLabel} compliant · Org-wide`}
              columns={dashboard.compliance.columns}
              rows={dashboard.compliance.rows}
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          ) : (
            <EmptyDashboardCard
              title="Compliance"
              subheader="Org-wide"
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          )}
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          {dashboard.hasTraining ? (
            <DashboardGlanceTable
              title="Staff Training"
              subheader={`${dashboard.training.scoreLabel} compliant · Org-wide`}
              columns={dashboard.training.columns}
              rows={dashboard.training.rows}
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          ) : (
            <EmptyDashboardCard
              title="Staff Training"
              subheader="Org-wide"
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          )}
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          {dashboard.hasSupervision ? (
            <DashboardGlanceTable
              title="Supervision & Appraisal"
              subheader={`${dashboard.supervision.scoreLabel} compliant · Org-wide`}
              columns={dashboard.supervision.columns}
              rows={dashboard.supervision.rows}
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          ) : (
            <EmptyDashboardCard
              title="Supervision & Appraisal"
              subheader="Org-wide"
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          )}
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          {dashboard.hasOpenShifts ? (
            <AnalyticsOrderTimeline
              title="Open shifts to claim"
              subheader="Across organization sites"
              list={dashboard.openShifts}
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          ) : (
            <EmptyDashboardCard
              title="Open shifts to claim"
              subheader="Across organization sites"
              sx={{ height: GLANCE_CARD_HEIGHT }}
            />
          )}
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
