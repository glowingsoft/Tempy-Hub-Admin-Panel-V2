import { useSelector } from 'react-redux';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { TempyConnectCard } from 'src/sections/tempy-connection/tempy-connect-card';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { AnalyticsFireDrills } from 'src/sections/overview/analytics/analytics-fire-drills';
import { AnalyticsResidentRisk } from 'src/sections/overview/analytics/analytics-resident-risk';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';
import { AnalyticsActiveModules } from 'src/sections/overview/analytics/analytics-active-modules';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { AnalyticsTasks } from 'src/sections/overview/analytics/analytics-tasks';
import { AnalyticsConversionRates } from 'src/sections/overview/analytics/analytics-conversion-rates';
import { AnalyticsOrderTimeline } from 'src/sections/overview/analytics/analytics-order-timeline';

import {
  ownerTraining,
  ownerCompliance,
  attendanceTrend,
  leaveBreakdown,
  ownerOpenShifts,
  ownerSupervision,
  fireDrillsSnapshot,
  staffByDepartment,
  workforceOverview,
  residentEvacuationRisk,
  ownerDashboardSummary,
  activeModulesSnapshot,
} from '../mocks/data';

// ----------------------------------------------------------------------

const GLANCE_CARD_HEIGHT = 380;

// ----------------------------------------------------------------------

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

export function OwnerDashboardView() {
  const { user } = useSelector((state) => state.user);
  const router = useRouter();

  const summary = ownerDashboardSummary;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, {user?.basicInfo?.name || 'Owner'} 👋
      </Typography>

      <TempyConnectCard usagePath={paths.owner.tempyConnection} sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={2.4}>
          <CourseWidgetSummary
            title="Total Staff"
            total={summary.totalStaff}
            color="primary"
            icon={icon('ic-job')}
            onClick={() => router.push(paths.owner.directory.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={2.4}>
          <CourseWidgetSummary
            title="Total Residents"
            total={summary.totalResidents}
            color="success"
            icon={icon('ic-user')}
            onClick={() => router.push(paths.owner.residents.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        {/* <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="On Leave Today"
            total={summary.onLeaveToday}
            color="warning"
            icon={icon('ic-calendar')}
          />
        </Grid> */}

        <Grid xs={12} sm={6} md={2.4}>
          <CourseWidgetSummary
            title="Today Visitors"
            total={summary.todayVisitors}
            color="warning"
            icon={icon('ic-calendar')}
            onClick={() => router.push(paths.owner.directory.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={2.4}>
          <CourseWidgetSummary
            title="Total Contractors"
            total={summary.totalContractors}
            color="info"
            icon={icon('ic-analytics')}
            onClick={() => router.push(paths.owner.directory.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={2.4}>
          <CourseWidgetSummary
            title="Total Professionals"
            total={summary.totalProfessionals}
            color="error"
            icon={icon('ic-users')}
            onClick={() => router.push(paths.owner.directory.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisits
            title="Attendance"
            subheader="Present vs absent this week"
            chart={{
              categories: attendanceTrend.categories,
              series: attendanceTrend.series,
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentVisits
            title="Leave breakdown"
            chart={{ series: leaveBreakdown }}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <AnalyticsConversionRates
            title="Staff by department"
            subheader={`${summary.totalStaff} staff across the organization`}
            chart={{
              categories: staffByDepartment.categories,
              series: staffByDepartment.series,
            }}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <AnalyticsConversionRates
            title="Workforce overview"
            subheader="This month, organization-wide"
            chart={{
              categories: workforceOverview.categories,
              series: workforceOverview.series,
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AnalyticsResidentRisk
            title="Resident evacuation risk"
            subheader="PEEP levels, org-wide"
            list={residentEvacuationRisk}
            sx={{ height: 1 }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AnalyticsActiveModules
            title="Active modules"
            subheader="Currently entitled for this organization"
            modules={activeModulesSnapshot}
            sx={{ height: 1 }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AnalyticsFireDrills
            title="Fire drills"
            subheader="Org-wide, this quarter"
            completed={fireDrillsSnapshot.completed}
            overdueSites={fireDrillsSnapshot.overdueSites}
            sx={{ height: 1 }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsTasks
            title="Compliance"
            subheader={`${ownerCompliance.score}% compliant · Org-wide`}
            list={ownerCompliance.list}
            sx={{ height: GLANCE_CARD_HEIGHT }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsTasks
            title="Staff Training"
            subheader={`${ownerTraining.score}% compliant · Org-wide`}
            list={ownerTraining.list}
            sx={{ height: GLANCE_CARD_HEIGHT }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsTasks
            title="Supervision & Appraisal"
            subheader={`${ownerSupervision.score}% compliant · Org-wide`}
            list={ownerSupervision.list}
            sx={{ height: GLANCE_CARD_HEIGHT }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsOrderTimeline
            title="Open shifts to claim"
            subheader="Across organization sites"
            list={ownerOpenShifts}
            sx={{ height: GLANCE_CARD_HEIGHT }}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
