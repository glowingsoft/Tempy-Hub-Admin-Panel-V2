import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { CONFIG } from 'src/config-global';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { DashboardWidgetSkeleton } from 'src/sections/owner/dashboard-widget-skeleton';
import { EmptyDashboardCard } from 'src/sections/owner/empty-dashboard-card';
import { useGetOrganizationLineDashboardQuery } from 'src/store/Reducer/organizations-api';
import { fDate } from 'src/utils/format-time';

import { LineManagerQuickActions } from '../components/line-manager-quick-actions';

// ----------------------------------------------------------------------

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

export function LineManagerDashboardView() {
  const router = useRouter();
  const { user } = useSelector((state) => state.user);
  const { organizationId } = useCurrentOrganization();

  const { data, isLoading, isFetching } = useGetOrganizationLineDashboardQuery(organizationId, {
    skip: !organizationId,
  });
  const loading = !organizationId || isLoading || (isFetching && !data);

  const summary = data?.summary || {};
  const teamAttendance = data?.teamAttendance || [];

  const trend = useMemo(
    () => ({
      categories: teamAttendance.map((item) => fDate(item.date, 'DD MMM')),
      series: [
        { name: 'On time', data: teamAttendance.map((item) => item.onTime) },
        { name: 'Late', data: teamAttendance.map((item) => item.late) },
      ],
    }),
    [teamAttendance]
  );

  const hasAttendance = teamAttendance.some(
    (item) => item.onTime != null || item.late != null
  );

  const attendanceRate =
    summary.attendanceRate == null ? '—' : `${summary.attendanceRate}%`;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, {user?.basicInfo?.name || 'Manager'} 👋
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Shifts logged"
            total={summary.shiftsLogged ?? 0}
            color="primary"
            icon={icon('ic-rota')}
            loading={loading}
            sx={{ width: 1 }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="On time"
            total={summary.onTime ?? 0}
            color="success"
            icon={icon('ic-check')}
            loading={loading}
            sx={{ width: 1 }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Late"
            total={summary.late ?? 0}
            color="warning"
            icon={icon('ic-clock')}
            loading={loading}
            sx={{ width: 1 }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Attendance rate"
            total={attendanceRate}
            color="info"
            icon={icon('ic-analytics')}
            loading={loading}
            sx={{ width: 1 }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Family uploads waiting"
            total={summary.familyUploadsWaiting ?? 0}
            color="warning"
            icon={icon('ic-file')}
            loading={loading}
            onClick={loading ? undefined : () => router.push(paths.lineManager.familyEngagement.moderation)}
            sx={{ cursor: loading ? 'default' : 'pointer', width: 1 }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Wall posts this week"
            total={summary.wallPostsThisWeek ?? 0}
            color="primary"
            icon={icon('ic-blog')}
            loading={loading}
            onClick={loading ? undefined : () => router.push(paths.lineManager.familyEngagement.communityWall)}
            sx={{ cursor: loading ? 'default' : 'pointer', width: 1 }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Messages sent"
            total={summary.messagesSent ?? 0}
            color="info"
            icon={icon('ic-chat')}
            loading={loading}
            onClick={loading ? undefined : () => router.push(paths.lineManager.messages)}
            sx={{ cursor: loading ? 'default' : 'pointer', width: 1 }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12}>
          {loading ? (
            <DashboardWidgetSkeleton titleWidth={150} subheaderWidth={220} variant="chart" />
          ) : hasAttendance ? (
            <AnalyticsWebsiteVisits
              title="Team attendance"
              subheader="On time vs late, by shift date"
              chart={{
                categories: trend.categories,
                series: trend.series,
                options: {
                  tooltip: { y: { formatter: (value) => `${value ?? 0} staff` } },
                },
              }}
            />
          ) : (
            <EmptyDashboardCard
              title="Team attendance"
              subheader="On time vs late, by shift date"
            />
          )}
        </Grid>
      </Grid>

      <LineManagerQuickActions />
    </DashboardContent>
  );
}
