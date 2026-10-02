import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { fCurrency } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';

import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import { useTempyConnection } from '../use-tempy-connection';
import { TempyConnectCard } from '../tempy-connect-card';
import RequestShiftDialog from '../request-shift-dialog';
import TempyRequestTableRow from '../tempy-request-table-row';

// ----------------------------------------------------------------------

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'site', label: 'Site' },
  { id: 'role', label: 'Role' },
  { id: 'startsAt', label: 'Start' },
  { id: 'endsAt', label: 'End' },
  { id: 'urgent', label: 'Urgent', align: 'center' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: 'cost', label: 'Cost' },
];

// ----------------------------------------------------------------------
// Shared "Connect to Tempy" usage & costs page — mounted for both the Line
// Manager and Owner roles (same convention as RotaView's `ownerDashboard`
// prop) so the agency-usage dashboard and request flow only exist once.
// ----------------------------------------------------------------------

export function TempyUsageView({ ownerDashboard = false }) {
  const table = useTable();
  const requestDialog = useBoolean();
  const { connected, requests, requestShift, usageSummary, costTrend } = useTempyConnection();

  const rootPath = ownerDashboard ? paths.owner.root : paths.lineManager.root;
  const usagePath = ownerDashboard ? paths.owner.tempyConnection : paths.lineManager.tempyConnection;

  const fillRate = usageSummary.shiftsRequested
    ? Math.round((usageSummary.shiftsFilled / usageSummary.shiftsRequested) * 100)
    : 0;

  const paginatedRequests = useMemo(
    () => requests.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage),
    [requests, table.page, table.rowsPerPage]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Connect to Tempy"
        links={[{ name: 'Dashboard', href: rootPath }, { name: 'Connect to Tempy' }]}
        action={
          connected ? (
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              onClick={requestDialog.onTrue}
            >
              Request shift via Tempy
            </Button>
          ) : null
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        <Grid xs={12}>
          <TempyConnectCard usagePath={usagePath} />
        </Grid>

        {connected ? (
          <>
            <Grid xs={12} sm={6} md={3}>
              <CourseWidgetSummary
                title="Spend this month"
                total={fCurrency(usageSummary.spendThisMonth, { code: 'en-GB', currency: 'GBP' })}
                color="primary"
                icon={icon('ic-banking')}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <CourseWidgetSummary
                title="Shifts requested"
                total={usageSummary.shiftsRequested}
                color="info"
                icon={icon('ic-rota')}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <CourseWidgetSummary
                title="Shifts filled"
                total={usageSummary.shiftsFilled}
                color="success"
                icon={icon('ic-check')}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <CourseWidgetSummary
                title="Fill rate"
                total={`${fillRate}%`}
                color="warning"
                icon={icon('ic-analytics')}
              />
            </Grid>

            <Grid xs={12}>
              <AnalyticsWebsiteVisits
                title="Agency spend"
                subheader="Monthly spend via Tempy"
                chart={{ categories: costTrend.categories, series: costTrend.series }}
              />
            </Grid>

            <Grid xs={12}>
              <Card>
                <Box sx={{ position: 'relative' }}>
                  <Scrollbar>
                    <Table size={table.dense ? 'small' : 'medium'}>
                      <TableHeadCustom headLabel={TABLE_HEAD} />
                      <TableBody>
                        {paginatedRequests.map((row, index) => (
                          <TempyRequestTableRow
                            key={row._id}
                            row={row}
                            serialNumber={table.page * table.rowsPerPage + index + 1}
                          />
                        ))}
                        <TableNoData notFound={!requests.length} title="No shift requests sent to Tempy yet" />
                      </TableBody>
                    </Table>
                  </Scrollbar>
                </Box>

                <TablePaginationCustom
                  page={table.page}
                  dense={table.dense}
                  count={requests.length}
                  rowsPerPage={table.rowsPerPage}
                  onPageChange={table.onChangePage}
                  onChangeDense={table.onChangeDense}
                  onRowsPerPageChange={table.onChangeRowsPerPage}
                />
              </Card>
            </Grid>
          </>
        ) : null}
      </Grid>

      <RequestShiftDialog open={requestDialog.value} onClose={requestDialog.onFalse} onSubmit={requestShift} />
    </DashboardContent>
  );
}
