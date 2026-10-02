// attendance-summary.jsx

import PropTypes from 'prop-types';

import Grid from '@mui/material/Grid';
import { CONFIG } from 'src/config-global';
import { CourseWidgetSummary } from '../overview/course/course-widget-summary';

// ----------------------------------------------------------------------

const SUMMARY_ITEMS = [
  {
    key: 'shiftsWorked',
    label: 'Shifts Worked',
    icon:`${CONFIG.site.basePath}/assets/icons/navbar/ic-job.svg`,
    color:"success"
  },
  {
    key: 'hoursLogged',
    label: 'Hours Logged',
    icon:`${CONFIG.site.basePath}/assets/icons/navbar/ic-job.svg`,
    color:"success"
  },
  {
    key: 'lateArrivals',
    label: 'Late Arrivals',
    icon:`${CONFIG.site.basePath}/assets/icons/navbar/ic-job.svg`,
    color:"error"
  },
];



// ----------------------------------------------------------------------

export function AttendanceSummary({ summary }) {
  return (
    <Grid container spacing={2}>
      {SUMMARY_ITEMS.map((item) => (
        <Grid item key={item.key} xs={12} md={4}>
         
          <CourseWidgetSummary
            title={item.label}
            total={summary[item.key]}
            icon={item.icon}
            color={item.color}
            />
        </Grid>
      ))}
    </Grid>
  );
}

AttendanceSummary.propTypes = {
  summary: PropTypes.object,
};