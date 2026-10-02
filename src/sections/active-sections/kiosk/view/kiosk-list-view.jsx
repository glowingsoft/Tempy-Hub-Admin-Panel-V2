import { useCallback, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Card,
  Grid,
  Stack,
  Table,
  TableBody,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';

import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';

import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { CONFIG } from 'src/config-global';

import { KioskTableRow } from '../kiosk-table-row';
import QuickAddKioskModal from '../quick-add-kiosk-modal';

import { OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';

import { mockKiosks } from '../mocks/data';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  {
    value: 'all',
    label: 'All',
    color: 'default',
  },
  {
    value: 'online',
    label: 'Online',
    color: 'success',
  },
  {
    value: 'offline',
    label: 'Offline',
    color: 'warning',
  },
  {
    value: 'locked',
    label: 'Locked',
    color: 'error',
  },
  {
    value: 'pending_setup',
    label: 'Pending Setup',
    color: 'info',
  },
];

const DEVICE_OPTIONS = [
  {
    value: 'all',
    label: 'All Devices',
  },
  {
    value: 'ipad',
    label: 'iPad',
  },
  {
    value: 'android',
    label: 'Android',
  },
  {
    value: 'windows',
    label: 'Windows',
  },
];

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  {
    id: 'sr#',
    label: 'Sr#',
    width: 60,
  },
  {
    id: 'kiosk',
    label: 'Kiosk',
    minWidth: 220,
  },
  {
    id: 'device',
    label: 'Device',
    minWidth: 170,
  },
  {
    id: 'site',
    label: 'Site',
    minWidth: 220,
  },
  {
    id: 'setup',
    label: 'Setup',
    minWidth: 140,
    align: 'center'
  },

  {
    id: 'status',
    label: 'Status',
    width: 120,
    align: 'center',
  },
  // {
  //   id: 'lastSeen',
  //   label: 'Last Seen',
  //   minWidth: 140,
  // },
  // {
  //   id: 'activity',
  //   label: 'Activity',
  //   width: 100,
  //   align: 'center'
  // },
  {
    id: 'actions',
    label: 'Actions',
    width: 100,
    align: 'center',
  },
];

// ----------------------------------------------------------------------

const FILTER_FIELDS = [
  createFilterField.status({
    options: STATUS_OPTIONS,
    showCounts: true,
  }),

  createFilterField.search({
    placeholder: 'Search kiosk or device...',
  }),

  createFilterField.select({
    key: 'device',
    label: 'Device',
    options: DEVICE_OPTIONS,
    defaultValue: 'all',
  }),
];

// ----------------------------------------------------------------------

export function KioskListView({ ownerDashboard = false }) {
  const router = useRouter();
  const { branchId, onBranchChange } = useOwnerBranchFilter();
  const table = useTable();

  const filters = useSetState({
    name: '',
    status: 'all',
    device: 'all',
  });

  const [currentKiosk, setCurrentKiosk] = useState(null);

  const openModal = useBoolean();

  const keyword = useDebounce(filters.state.name, 500);

  const isLoading = false;
  const isFetching = false;

  // ----------------------------------------------------------------------

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );

  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((field) => field.type !== 'status'),
    []
  );

  // ----------------------------------------------------------------------
  // Data
  // ----------------------------------------------------------------------

  const apiKiosks = mockKiosks || [];

  const tableData = useMemo(
    () =>
      apiKiosks.map((kiosk) => ({
        id: kiosk._id,

        name: kiosk.name,

        kioskCode: kiosk.kioskCode,

        site: kiosk.site || 'Current Site',

        device: {
          name: kiosk.device?.name || '—',
          type: kiosk.device?.type || '—',
        },

        status: kiosk.status || 'offline',

        setupStatus: kiosk.setupStatus || 'registered',

        lastSeen: kiosk.lastSeen || kiosk.lastActive || '—',

        settings: {
          checkInMethods:
            kiosk.settings?.checkInMethods || [
              'qr',
              'name_pin',
              'express',
            ],

          allowCheckIn:
            kiosk.settings?.allowCheckIn ?? true,

          allowCheckOut:
            kiosk.settings?.allowCheckOut ?? true,

          enableBreaks:
            kiosk.settings?.enableBreaks ?? false,

          phoneCheckIn:
            kiosk.settings?.phoneCheckIn ?? false,

          screenTimeout:
            kiosk.settings?.screenTimeout ?? 60,

          receptionIdentifier:
            kiosk.settings?.receptionIdentifier || '',

          adminPinConfigured:
            kiosk.settings?.adminPinConfigured ?? false,
        },
      })),
    [apiKiosks]
  );

  // ----------------------------------------------------------------------
  // Statistics
  // ----------------------------------------------------------------------

  const kioskStats = useMemo(() => {
    return {
      total: tableData.length,

      online: tableData.filter(
        (kiosk) => kiosk.status === 'online'
      ).length,

      offline: tableData.filter(
        (kiosk) => kiosk.status === 'offline'
      ).length,

      pendingSetup: tableData.filter(
        (kiosk) => kiosk.setupStatus === 'pending_setup'
      ).length,
    };
  }, [tableData]);

  // ----------------------------------------------------------------------
  // Status counts
  // ----------------------------------------------------------------------

  const getStatusCount = useCallback(
    (status) => {
      if (status === 'all') {
        return tableData.length;
      }

      if (status === 'pending_setup') {
        return tableData.filter(
          (kiosk) => kiosk.setupStatus === 'pending_setup'
        ).length;
      }

      return tableData.filter(
        (kiosk) => kiosk.status === status
      ).length;
    },
    [tableData]
  );

  // ----------------------------------------------------------------------
  // Filters
  // ----------------------------------------------------------------------

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();

      filters.setState({
        status: newValue,
      });
    },
    [filters, table]
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      table.onResetPage();

      filters.setState({
        [key]: value,
      });
    },
    [filters, table]
  );

  const handleSearchChange = useCallback(
    (value) => {
      table.onResetPage();

      filters.setState({
        name: value,
      });
    },
    [filters, table]
  );

  // ----------------------------------------------------------------------
  // Actions
  // ----------------------------------------------------------------------

  const handleRegisterKiosk = useCallback(() => {
    setCurrentKiosk(null);
    openModal.onTrue();
  }, [openModal]);

  const handleEditKiosk = useCallback(
    (kiosk) => {
      setCurrentKiosk(kiosk);
      openModal.onTrue();
    },
    [openModal]
  );

  const handleViewKiosk = useCallback(
    (kiosk) => {
      const targetId = kiosk.id || kiosk._id || kiosk.kioskCode;
      const href = ownerDashboard
        ? paths.owner.kioskDetail(targetId)
        : paths.siteManager.kioskDetail(targetId);
      router.push(href);
    },
    [ownerDashboard, router]
  );

  const handleKioskSettings = useCallback((kiosk) => {
    console.log('Open kiosk settings:', kiosk);
  }, []);

  const handleLockKiosk = useCallback((kiosk) => {
    console.log('Lock / unlock kiosk:', kiosk);
  }, []);

  // ----------------------------------------------------------------------

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Kiosks"
        links={[
          {
            name: 'Dashboard',
            href: ownerDashboard ? paths.owner.root : paths.siteManager.root,
          },
          {
            name: 'Kiosks',
          },
          {
            name: 'List',
          },
        ]}
        action={
          ownerDashboard ? (
            <OwnerBranchFilterActions value={branchId} onChange={onBranchChange}>
              <Button
                variant="contained"
                onClick={handleRegisterKiosk}
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Register Kiosk
              </Button>
            </OwnerBranchFilterActions>
          ) : (
            <Button
              variant="contained"
              onClick={handleRegisterKiosk}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Register Kiosk
            </Button>
          )
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Statistics */}
      {/* ------------------------------------------------------------------ */}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Total Kiosks"
            total={kioskStats.total}
            color="primary"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-course.svg`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Online"
            total={kioskStats.online}
            color="success"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-course.svg`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Offline"
            total={kioskStats.offline}
            color="warning"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-course.svg`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Pending Setup"
            total={kioskStats.pendingSetup}
            color="info"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-course.svg`}
          />
        </Grid>
      </Grid>

      {/* ------------------------------------------------------------------ */}
      {/* Kiosk Table */}
      {/* ------------------------------------------------------------------ */}

      <Card>
        <StatusTabsFilterWrapper
          filterField={statusFilterField}
          value={filters.state.status}
          onChange={handleFilterStatus}
          getCount={getStatusCount}
        />

        <FlexibleTableToolbar
          filterFields={toolbarFilterFields}
          filterValues={filters.state}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        <Box sx={{ position: 'relative', overflowX: 'hidden' }}>
          <Table
            size={table.dense ? 'small' : 'medium'}
            sx={{ width: 1, tableLayout: 'fixed' }}
          >
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              numSelected={table.selected.length}
            />

            <TableBody>
              {isLoading || isFetching ? (
                <TableNoData notFound={false} />
              ) : tableData.length > 0 ? (
                tableData.map((row, index) => (
                  <KioskTableRow
                    key={row.id}
                    row={row}
                    serialNumber={
                      index +
                      1 +
                      table.page *
                      table.rowsPerPage
                    }
                    selected={table.selected.includes(
                      row.id
                    )}
                    onEditRow={() =>
                      handleEditKiosk(row)
                    }
                    onViewRow={() =>
                      handleViewKiosk(row)
                    }
                    onSettings={() =>
                      handleKioskSettings(row)
                    }
                    onLock={() =>
                      handleLockKiosk(row)
                    }
                  />
                ))
              ) : (
                <TableNoData notFound />
              )}
            </TableBody>
          </Table>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={tableData.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={
            table.onChangeRowsPerPage
          }
        />
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Register / Edit */}
      {/* ------------------------------------------------------------------ */}

      <QuickAddKioskModal
        open={openModal.value}
        onClose={openModal.onFalse}
        currentKiosk={currentKiosk}
      />
    </DashboardContent>
  );
}