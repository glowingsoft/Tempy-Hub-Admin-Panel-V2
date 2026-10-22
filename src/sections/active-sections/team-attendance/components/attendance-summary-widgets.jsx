import Grid from '@mui/material/Unstable_Grid2';
import Skeleton from '@mui/material/Skeleton';

import { CONFIG } from 'src/config-global';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';

// ----------------------------------------------------------------------

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

export function AttendanceSummaryWidgets({ summary, loading }) {
  return (
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      <Grid xs={12} sm={4}>
        <CourseWidgetSummary
          title="On time"
          total={loading ? <Skeleton sx={{ width: 48, height: 40 }} /> : summary.onTime}
          color="success"
          icon={icon('ic-check')}
        />
      </Grid>

      <Grid xs={12} sm={4}>
        <CourseWidgetSummary
          title="Late"
          total={loading ? <Skeleton sx={{ width: 48, height: 40 }} /> : summary.late}
          color="warning"
          icon={icon('ic-clock')}
        />
      </Grid>

      <Grid xs={12} sm={4}>
        <CourseWidgetSummary
          title="Attendance rate"
          total={
            loading ? (
              <Skeleton sx={{ width: 48, height: 40 }} />
            ) : summary.attendanceRate === null ? (
              '—'
            ) : (
              `${summary.attendanceRate}%`
            )
          }
          color="info"
          icon={icon('ic-analytics')}
        />
      </Grid>
    </Grid>
  );
}
