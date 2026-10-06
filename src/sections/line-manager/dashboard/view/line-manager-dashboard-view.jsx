import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { fDate } from 'src/utils/format-time';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { mockAttendanceResponse } from 'src/sections/active-sections/team-attendance/mocks/data';
import { getAttendanceSummary } from 'src/sections/active-sections/team-attendance/utils';

import { LineManagerQuickActions } from '../components/line-manager-quick-actions';

// ----------------------------------------------------------------------

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

// Same records the Team Attendance page reads — this dashboard only
// summarizes them, so the two screens can never disagree.
function useAttendanceSummary() {
  return useMemo(() => {
    const records = mockAttendanceResponse.data;

    const { total, onTime, late, attendanceRate } = getAttendanceSummary(records);

    const byDate = [...new Set(records.map((row) => row.workDate))].sort();

    const trend = {
      categories: byDate.map((date) => fDate(date, 'DD MMM')),
      series: [
        {
          name: 'On time',
          data: byDate.map(
            (date) =>
              records.filter((row) => row.workDate === date && row.punctualityStatus === 'onTime').length
          ),
        },
        {
          name: 'Late',
          data: byDate.map(
            (date) =>
              records.filter((row) => row.workDate === date && row.punctualityStatus === 'late').length
          ),
        },
      ],
    };

    return { total, onTime, late, attendanceRate, trend };
  }, []);
}

export function LineManagerDashboardView() {
  const router = useRouter();
  const { user } = useSelector((state) => state.user);

  const { total, onTime, late, attendanceRate, trend } = useAttendanceSummary();

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, {user?.basicInfo?.name || 'Manager'} 👋
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Shifts logged"
            total={total}
            color="primary"
            icon={icon('ic-rota')}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="On time"
            total={onTime}
            color="success"
            icon={icon('ic-check')}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Late"
            total={late}
            color="warning"
            icon={icon('ic-clock')}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Attendance rate"
            total={attendanceRate === null ? '—' : `${attendanceRate}%`}
            color="info"
            icon={icon('ic-analytics')}
          />
        </Grid>
      </Grid>

      {/* Family Engagement Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="family uploads waiting"
            total={6}
            color="warning"
            icon={icon('ic-file')}
            onClick={() => router.push(paths.lineManager.familyEngagement.moderation)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="wall posts this week"
            total={3}
            color="primary"
            icon={icon('ic-blog')}
            onClick={() => router.push(paths.lineManager.familyEngagement.communityWall)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="messages sent"
            total={2}
            color="info"
            icon={icon('ic-chat')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12}>
          <AnalyticsWebsiteVisits
            title="Team attendance"
            subheader="On time vs late, by shift date"
            chart={{
              categories: trend.categories,
              series: trend.series,
              options: {
                tooltip: { y: { formatter: (value) => `${value} staff` } },
              },
            }}
          />
        </Grid>
      </Grid>

      <LineManagerQuickActions />
    </DashboardContent>
  );
}
