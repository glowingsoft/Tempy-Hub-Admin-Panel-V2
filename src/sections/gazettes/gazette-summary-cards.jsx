import PropTypes from 'prop-types';

import Grid from '@mui/material/Unstable_Grid2';

import { CONFIG } from 'src/config-global';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';

// ----------------------------------------------------------------------

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

const CARD_SX = {
  border: (theme) => `1px solid ${theme.palette.divider}`,
  cursor: 'default',
  userSelect: 'none',
};

export function GazetteSummaryCards({ counts = {}, total = 0 }) {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid xs={12} sm={6} md={3}>
        <CourseWidgetSummary
          title="Residents in this issue"
          total={total}
          color="primary"
          icon={icon('ic-users')}
          sx={CARD_SX}
        />
      </Grid>

      <Grid xs={12} sm={6} md={3}>
        <CourseWidgetSummary
          title="Ready to print"
          total={counts.ready ?? 0}
          color="success"
          icon={icon('ic-check')}
          sx={CARD_SX}
        />
      </Grid>

      <Grid xs={12} sm={6} md={3}>
        <CourseWidgetSummary
          title="Not ready"
          total={counts.notReady ?? 0}
          color="warning"
          icon={icon('ic-file')}
          sx={CARD_SX}
        />
      </Grid>

      <Grid xs={12} sm={6} md={3}>
        <CourseWidgetSummary
          title="Printed"
          total={counts.printed ?? 0}
          color="info"
          icon={icon('ic-analytics')}
          sx={CARD_SX}
        />
      </Grid>
    </Grid>
  );
}

GazetteSummaryCards.propTypes = {
  counts: PropTypes.object,
  total: PropTypes.number,
};
