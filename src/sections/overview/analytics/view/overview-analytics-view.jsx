import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  _analyticTasks,
  _analyticPosts,
  _analyticTraffic,
  _analyticOrderTimeline,
} from 'src/_mock';

import { AnalyticsNews } from '../analytics-news';
import { AnalyticsTasks } from '../analytics-tasks';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsOrderTimeline } from '../analytics-order-timeline';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';
import { CourseWidgetSummary } from '../../course/course-widget-summary';
import { PeopleOnSiteNow } from '../../app/people-on-site-now';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { TopOrganizations } from '../top-organizations';
import { OrganizationalOverview } from '../organizational-overview';
import { RevenueByOrganization } from '../revenue-by-organization';
import { DataUsageMixedChart } from 'src/sections/data-usage/data-usage-mixed-chart';
import { mockOrganizationsResponse } from '../mocks/data';

// ----------------------------------------------------------------------

const ORGANIZATIONS_HEAD = [
  { id: 'name', label: 'Organization' },
  { id: 'modules', label: 'Modules', align: 'center' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: 'actions', label: 'Actions', align: 'center' },
];

export function OverviewAnalyticsView() {
  const router = useRouter();

  const organizations = mockOrganizationsResponse.data;
  const totalOrganizations = mockOrganizationsResponse.meta.totalRecords;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, Welcome back 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3} >
          <CourseWidgetSummary
            title="Total Organizations"
            total={totalOrganizations}
            color="primary"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-banking.svg`}
            // onClick={() => router.push(paths.siteManager.directory.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3} >
          <CourseWidgetSummary
            title="Total Sites"
            total={14}
            color="info"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-plan.svg`}
            // onClick={() => router.push(paths.siteManager.directory.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Pending Invitations"
            total={5}
            color="warning"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-invitations.svg`}
            // onClick={() => router.push(paths.siteManager.directory.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Total Professionals"
            total={37}
            color="info"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-user.svg`}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3} >
          <CourseWidgetSummary
            title="Site & Line Managers"
            total={28}
            color="secondary"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-user.svg`}
            // onClick={() => router.push(paths.siteManager.directory.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Total Staff"
            total={342}
            color="success"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-job.svg`}
            // onClick={() => router.push(paths.siteManager.directory.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Total Residents"
            total={196}
            color="error"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
            // onClick={() => router.push(paths.siteManager.directory.root)}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Total Monthly Revenue"
            total="£54,600"
            color="success"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-banking.svg`}
            sx={{ cursor: 'pointer' }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentVisits
            title="Sites by Region"
            chart={{
              series: [
                { label: 'North', value: 5 },
                { label: 'South', value: 4 },
                { label: 'East', value: 3 },
                { label: 'West', value: 2 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisits
            title="Onboarding Growth"
            subheader="(+43%) than last year"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'Organizations', data: [1, 1, 2, 2, 3, 4, 4, 5, 6] },
                { name: 'Sites', data: [2, 3, 4, 6, 8, 9, 11, 12, 14] },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TopOrganizations
            title="Top Organizations"
            tableData={organizations}
            headLabel={ORGANIZATIONS_HEAD}
            onClick={() => router.push(paths.dashboard.organizations.root)}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <OrganizationalOverview
            title="Organizational Overview"
            subheader="Relative footprint across the platform"
          />
        </Grid>

        <Grid xs={12} md={6}>
          <RevenueByOrganization
            title="Revenue by Organization"
            subheader="Monthly recurring revenue, current billing cycle"
          />
        </Grid>

        <Grid xs={12} md={6}>
          <DataUsageMixedChart />
        </Grid>

        {/* <Grid xs={12} md={6} lg={8}>
          <AnalyticsNews title="News" list={_analyticPosts} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsOrderTimeline title="Order timeline" list={_analyticOrderTimeline} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsTrafficBySite title="Traffic by site" list={_analyticTraffic} />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsTasks title="Tasks" list={_analyticTasks} />
        </Grid> */}
      </Grid>
    </DashboardContent>
  );
}
