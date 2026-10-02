import { useState } from 'react';
import Grid from '@mui/material/Grid';

import { DashboardContent } from 'src/layouts/dashboard';

import { CONFIG } from 'src/config-global';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { AnalyticsNews } from '../../analytics/analytics-news';
import { AnalyticsTasks } from '../../analytics/analytics-tasks';
import { AnalyticsOrderTimeline } from '../../analytics/analytics-order-timeline';
import { CourseWidgetSummary } from '../../course/course-widget-summary';
import { PeopleOnSiteNow } from '../people-on-site-now';
import { VisitorContractorActivity } from '../visitor-contractor-activity';
import {
  mockUsers,
  activityFeed,
  siteTraining,
  siteOpenShifts,
  siteCompliance,
  siteSupervision,
} from '../mocks/data';

// ----------------------------------------------------------------------

const GLANCE_CARD_HEIGHT = 380;

// ----------------------------------------------------------------------

export function OverviewAppView() {
  const router = useRouter();

  // Randomized realistic counts for the summary cards
  const [cardData] = useState(() => ({
    visitors: Math.floor(Math.random() * 10) + 8, // 8 - 17
    staff: Math.floor(Math.random() * 12) + 18, // 18 - 29
    residentsPresent: Math.floor(Math.random() * 15) + 38, // 38 - 52
    pendingApprovals: Math.floor(Math.random() * 5) + 3, // 3 - 7
    contractors: Math.floor(Math.random() * 6) + 7, // 7 - 12
    professionals: Math.floor(Math.random() * 5) + 6, // 6 - 10
    residentsOut: Math.floor(Math.random() * 4) + 3, // 3 - 6
  }));

  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        {/* First Row: 4 Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Visitors On Site"
            total={cardData.visitors}
            color="info"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-user.svg`}
            onClick={() => router.push(paths.siteManager.directory.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Staff On Site"
            total={cardData.staff}
            color="primary"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
            onClick={() => router.push(paths.siteManager.directory.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Residents Present"
            total={cardData.residentsPresent}
            color="success"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-home.svg`}
            onClick={() => router.push(paths.siteManager.residents.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Pending Approvals"
            total={cardData.pendingApprovals}
            color="warning"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-clock.svg`}
            onClick={() => router.push(paths.siteManager.pendingApproval)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        {/* Second Row: 3 Cards (same width md=3 as first row, with Professionals added) */}
        <Grid item xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Contractors on site"
            total={cardData.contractors}
            color="secondary"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-job.svg`}
            onClick={() => router.push(paths.siteManager.directory.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Professionals on site"
            total={cardData.professionals}
            color="error"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
            onClick={() => router.push(paths.siteManager.directory.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Residents out of the home"
            total={cardData.residentsOut}
            color="error"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-external.svg`}
            onClick={() => router.push(paths.siteManager.residents.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid item xs={12} md={7.5}>
          <PeopleOnSiteNow
            title="People on site now"
            tableData={mockUsers}
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

        <Grid item xs={12} md={4.5}>
          <AnalyticsNews title="Activity Feed" list={activityFeed} sx={{ height: 1 }} />
        </Grid>

        {/* Full width Visitor and contractor activity */}
        <Grid item xs={12}>
          <VisitorContractorActivity />
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <AnalyticsTasks
            title="Compliance"
            subheader={`${siteCompliance.score}% compliant · Site team`}
            list={siteCompliance.list}
            sx={{ height: GLANCE_CARD_HEIGHT }}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <AnalyticsTasks
            title="Staff Training"
            subheader={`${siteTraining.score}% compliant · Site team`}
            list={siteTraining.list}
            sx={{ height: GLANCE_CARD_HEIGHT }}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <AnalyticsTasks
            title="Supervision & Appraisal"
            subheader={`${siteSupervision.score}% compliant · Site team`}
            list={siteSupervision.list}
            sx={{ height: GLANCE_CARD_HEIGHT }}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <AnalyticsOrderTimeline
            title="Open shifts to claim"
            subheader="Site shift cover"
            list={siteOpenShifts}
            sx={{ height: GLANCE_CARD_HEIGHT }}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
