import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { DataUsageMixedChart } from 'src/sections/data-usage/data-usage-mixed-chart';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { useGetPlatformDashboardQuery } from 'src/store/Reducer/platform-dashboard-api';

import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { OrganizationalOverview } from '../organizational-overview';
import { RevenueByOrganization } from '../revenue-by-organization';
import { TopOrganizations } from '../top-organizations';

// ----------------------------------------------------------------------

const PREVIEW_LIMIT = 6;

const ORGANIZATIONS_HEAD = [
  { id: 'name', label: 'Organization' },
  { id: 'modules', label: 'Modules', align: 'center' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: 'actions', label: 'Actions', align: 'center' },
];

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, index) =>
  String(new Date().getFullYear() - (4 - index))
);

function formatGbp(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `£${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function OverviewAnalyticsView() {
  const router = useRouter();
  const { user } = useSelector((state) => state.user);
  const displayName = user?.basicInfo?.name || user?.name || 'Admin';

  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [organizationId, setOrganizationId] = useState('');

  const { data, isLoading } = useGetPlatformDashboardQuery({
    year,
    organizationId: organizationId || undefined,
  });

  const summary = data?.summary || {};
  const onboarding = data?.onboardingGrowth || {};
  const organizations = data?.organizations || [];
  const overview = data?.organizationOverview || {};

  const topOrganizations = useMemo(
    () => (data?.topOrganizations || []).slice(0, PREVIEW_LIMIT),
    [data?.topOrganizations]
  );

  const revenueRows = useMemo(
    () =>
      (data?.revenueByOrganization || []).map((item) => ({
        ...item,
        formatted: formatGbp(item.monthlyRevenueGbp),
      })),
    [data?.revenueByOrganization]
  );

  const selectedOrganizationId = organizationId || overview.organizationId || organizations[0]?.organizationId || '';

  const summaryCards = [
    {
      title: 'Total Organizations',
      total: summary.organizations ?? 0,
      color: 'primary',
      icon: 'ic-banking.svg',
      href: paths.dashboard.organizations.root,
    },
    {
      title: 'Total Sites',
      total: summary.sites ?? 0,
      color: 'info',
      icon: 'ic-plan.svg',
      href: paths.dashboard.organizations.root,
    },
    {
      title: 'Pending Invitations',
      total: summary.pendingInvitations ?? 0,
      color: 'warning',
      icon: 'ic-invitations.svg',
    },
    {
      title: 'Total Professionals',
      total: summary.professionals ?? 0,
      color: 'info',
      icon: 'ic-user.svg',
    },
    {
      title: 'Site & Line Managers',
      total: summary.siteAndLineManagers ?? 0,
      color: 'secondary',
      icon: 'ic-user.svg',
    },
    {
      title: 'Total Staff',
      total: summary.staff ?? 0,
      color: 'success',
      icon: 'ic-job.svg',
    },
    {
      title: 'Total Residents',
      total: summary.residents ?? 0,
      color: 'error',
      icon: 'ic-users.svg',
    },
    {
      title: 'Total Monthly Revenue',
      total: formatGbp(summary.totalMonthlyRevenueGbp),
      color: 'success',
      icon: 'ic-banking.svg',
      href: paths.dashboard.dataUsage.root,
    },
  ];

  const onboardingSubheader =
    onboarding.changePercent != null
      ? `(${Number(onboarding.changePercent) > 0 ? '+' : ''}${onboarding.changePercent}%) than last year`
      : undefined;

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hi, {displayName} 👋
      </Typography>

      <Grid container spacing={3} sx={{ opacity: isLoading ? 0.72 : 1 }}>
        {summaryCards.map((card) => (
          <Grid key={card.title} xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title={card.title}
              total={card.total}
              color={card.color}
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/${card.icon}`}
              onClick={card.href ? () => router.push(card.href) : undefined}
              sx={{ width: 1, cursor: card.href ? 'pointer' : 'default' }}
            />
          </Grid>
        ))}

        <Grid xs={12}>
          <AnalyticsWebsiteVisits
            title="Onboarding Growth"
            subheader={onboardingSubheader}
            chart={{
              categories: onboarding.months || [],
              series: [
                { name: 'Organizations', data: onboarding.organizations || [] },
                { name: 'Sites', data: onboarding.sites || [] },
              ],
              options: {
                tooltip: {
                  y: {
                    formatter: (value) => (value == null ? '—' : `${value}`),
                  },
                },
              },
            }}
            sx={{ height: 1 }}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TopOrganizations
            title="Top Organizations"
            tableData={topOrganizations}
            headLabel={ORGANIZATIONS_HEAD}
            showViewAll={Boolean(topOrganizations.length)}
            onClick={() => router.push(paths.dashboard.organizations.root)}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <OrganizationalOverview
            organizations={organizations}
            overview={overview}
            totals={summary}
            selectedOrganizationId={selectedOrganizationId}
            onOrganizationChange={setOrganizationId}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <RevenueByOrganization data={revenueRows} />
        </Grid>

        <Grid xs={12} md={6}>
          <DataUsageMixedChart
            usage={data?.dataUsage}
            year={year}
            yearOptions={YEAR_OPTIONS}
            onYearChange={setYear}
            onViewAll={() => router.push(paths.dashboard.dataUsage.root)}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
