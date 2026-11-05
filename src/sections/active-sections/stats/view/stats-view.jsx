import { useCallback, useMemo, useState } from 'react';

import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CONFIG } from 'src/config-global';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { ALL_BRANCHES_VALUE, OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';
import { AppCurrentDownload } from 'src/sections/overview/app/app-current-download';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { EcommerceYearlySales } from 'src/sections/overview/e-commerce/ecommerce-yearly-sales';
import { useGetStatisticsQuery } from 'src/store/Reducer/statistics-api';

import { WorkforceMovement } from '../workforce-movement';
import {
  PERIOD_OPTIONS,
  PERIOD_TO_API,
  ROLE_CHART_COLORS,
  formatRoleLabel,
  getYearOptions,
  mapWorkforceMovement,
} from '../utils';

// ----------------------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function StatsView({ ownerDashboard = false }) {
  const router = useRouter();
  const { organizationId } = useCurrentOrganization();
  const { branchId, onBranchChange } = useOwnerBranchFilter();

  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => getYearOptions(currentYear), [currentYear]);
  const [year, setYear] = useState(String(currentYear));
  const [period, setPeriod] = useState(PERIOD_OPTIONS[1]);

  const selectedBranchId =
    ownerDashboard && branchId && branchId !== ALL_BRANCHES_VALUE ? branchId : undefined;

  const { data, isLoading } = useGetStatisticsQuery(
    {
      year,
      period: PERIOD_TO_API[period],
      branchId: selectedBranchId,
      headerOrganizationId: organizationId,
    },
    { skip: !organizationId }
  );

  const summary = data?.summary || {};
  const directoryRoot = ownerDashboard
    ? paths.owner.directory.root
    : paths.siteManager.directory.root;

  const handleOpenDirectory = useCallback(() => {
    router.push(directoryRoot);
  }, [directoryRoot, router]);

  const roleSeries = useMemo(() => {
    const roles = data?.employeesByRole?.roles ?? [];
    if (!roles.length) {
      return [{ label: 'No employees', value: 0 }];
    }
    return roles.map((item) => ({
      label: formatRoleLabel(item.role),
      value: item.count ?? 0,
    }));
  }, [data?.employeesByRole]);

  const overTimeChart = useMemo(() => {
    const payload = data?.employeesOverTime || {};
    const seriesYear = String(payload.year || year);
    const months = payload.months?.length ? payload.months : MONTHS;
    const roles = payload.series?.length
      ? payload.series
      : [{ role: 'Employees', data: months.map(() => 0) }];

    return {
      colors: ROLE_CHART_COLORS,
      categories: months,
      series: [
        {
          name: seriesYear,
          data: roles.map((item) => ({
            name: formatRoleLabel(item.role),
            data: item.data ?? months.map(() => 0),
          })),
        },
      ],
    };
  }, [data?.employeesOverTime, year]);

  const workforceData = useMemo(
    () => mapWorkforceMovement(data?.workforceMovement),
    [data?.workforceMovement]
  );

  const summaryCards = [
    { title: 'Visitors', total: summary.visitors ?? 0 },
    { title: 'Residents', total: summary.residents ?? 0 },
    { title: 'Contractor', total: summary.contractors ?? 0 },
    { title: 'Staff', total: summary.staff ?? 0 },
    { title: 'Professionals', total: summary.professionals ?? 0 },
  ];

  const periodSelect = (
    <TextField
      select
      size="small"
      label="Period"
      value={period}
      onChange={(event) => setPeriod(event.target.value)}
      sx={{ minWidth: { xs: 1, sm: 160 } }}
    >
      {PERIOD_OPTIONS.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );

  const yearSelect = (
    <TextField
      select
      size="small"
      label="Year"
      value={year}
      onChange={(event) => setYear(event.target.value)}
      sx={{ minWidth: { xs: 1, sm: 120 } }}
    >
      {yearOptions.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Statistics"
        links={[
          {
            name: 'Dashboard',
            href: ownerDashboard ? paths.owner.root : paths.siteManager.root,
          },
          { name: 'Statistics' },
        ]}
        action={
          ownerDashboard ? (
            <OwnerBranchFilterActions value={branchId} onChange={onBranchChange}>
              {periodSelect}
              {yearSelect}
            </OwnerBranchFilterActions>
          ) : (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              {periodSelect}
              {yearSelect}
            </Stack>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3} sx={{ opacity: isLoading ? 0.72 : 1 }}>
        {summaryCards.map((card) => (
          <Grid key={card.title} xs={12} sm={6} md={2.4}>
            <CourseWidgetSummary
              title={card.title}
              total={card.total}
              color="primary"
              icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
              onClick={handleOpenDirectory}
              sx={{ cursor: 'pointer', width: 1 }}
            />
          </Grid>
        ))}

        <Grid xs={12} md={4}>
          <AppCurrentDownload
            title="Employees by Role"
            subheader="Employee distribution across roles"
            chart={{
              colors: ROLE_CHART_COLORS,
              series: roleSeries,
            }}
            sx={{ width: 1, height: 1 }}
          />
        </Grid>

        <Grid xs={12} md={8}>
          <EcommerceYearlySales
            title="Employees over time"
            height={540}
            hideSeriesSelect
            selectedSeries={year}
            chart={overTimeChart}
            sx={{ width: 1, height: 1 }}
          />
        </Grid>

        <Grid xs={12}>
          <WorkforceMovement
            ownerDashboard={ownerDashboard}
            period={period}
            data={workforceData}
            sx={{ width: 1 }}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
