import { useCallback, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Card,
  Grid,
  Stack,
  Table,
  TableBody,
  Skeleton,
  InputAdornment,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';

import { toast } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';

import { DataUsageSummaryCard } from 'src/sections/data-usage/data-usage-summary-card';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { CONFIG } from 'src/config-global';

import { KioskTableRow } from '../kiosk-table-row';
import QuickAddKioskModal from '../quick-add-kiosk-modal';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetKiosksQuery, useToggleKioskLockMutation } from 'src/store/Reducer/kiosks-api';

const ALL_BRANCHES_VALUE = 'all';

const mapBranchOption = (item) => ({
  value: item._id,
  label: item.name,
});

const EXTRA_BRANCH_OPTIONS = [{ value: ALL_BRANCHES_VALUE, label: 'All sites' }];

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
    color: 'error',
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
];

// ----------------------------------------------------------------------

export function KioskListView({ ownerDashboard = false }) {
  const router = useRouter();
  const table = useTable({ defaultDense: true });
  const { organizationId, isOwner, user } = useCurrentOrganization();

  const isFullOwner = ownerDashboard || isOwner;

  const userBranchId =
    user?.branchId?._id ||
    user?.branchId ||
    (typeof user?.branch === 'object' ? user?.branch?._id : user?.branch) ||
    undefined;

  const [selectedBranch, setSelectedBranch] = useState(EXTRA_BRANCH_OPTIONS[0]);

  const filters = useSetState({
    search: '',
    status: 'all',
  });

  const [currentKiosk, setCurrentKiosk] = useState(null);
  const [kioskToLock, setKioskToLock] = useState(null);
  const openModal = useBoolean();
  const lockConfirm = useBoolean();
  const keyword = useDebounce(filters.state.search, 500);

  // Status mapping: 'online' -> presence 'online', 'offline' -> presence 'offline'
  const queryPresence =
    filters.state.status === 'online'
      ? 'online'
      : filters.state.status === 'offline'
        ? 'offline'
        : undefined;

  const activeBranchId = isFullOwner
    ? selectedBranch?.value && selectedBranch.value !== ALL_BRANCHES_VALUE
      ? selectedBranch.value
      : undefined
    : userBranchId;

  const handleBranchChange = useCallback(
    (option) => {
      table.onResetPage();
      setSelectedBranch(option || EXTRA_BRANCH_OPTIONS[0]);
    },
    [table]
  );

  const {
    data: kiosksResponse,
    isLoading,
    isFetching,
  } = useGetKiosksQuery(
    {
      organizationId,
      branchId: activeBranchId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      keyword: keyword || undefined,
      presence: queryPresence,
    },
    { skip: !organizationId }
  );

  const meta = kiosksResponse?.meta || {};
  const apiKiosks = Array.isArray(kiosksResponse?.data) ? kiosksResponse.data : [];
  const totalRecords = meta.totalRecords || meta.total || apiKiosks.length;
  const isSummaryCardsLoading = Boolean(organizationId && !kiosksResponse && (isLoading || isFetching));

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

  const tableData = useMemo(
    () =>
      apiKiosks.map((kiosk) => ({
        id: kiosk._id || kiosk.id,
        _id: kiosk._id || kiosk.id,
        name: kiosk.locationLabel || kiosk.receptionIdentifier || kiosk.deviceId || kiosk.name || 'Kiosk',
        locationLabel: kiosk.locationLabel,
        receptionIdentifier: kiosk.receptionIdentifier,
        deviceId: kiosk.deviceId,
        kioskCode: kiosk.deviceId || kiosk.kioskCode,
        site: kiosk.branch?.name || kiosk.site?.name || kiosk.site || '—',
        branch: kiosk.branch || (typeof kiosk.site === 'object' ? kiosk.site : { name: kiosk.site }),
        deviceType: kiosk.deviceType || kiosk.device?.type || '—',
        device: {
          name: kiosk.deviceId || kiosk.device?.name || '—',
          type: kiosk.deviceType || kiosk.device?.type || '—',
        },
        kioskMode: kiosk.kioskMode,
        isLocked: Boolean(kiosk.isLocked || kiosk.isLock || kiosk.locked),
        status: kiosk.presence || kiosk.status || 'offline',
        presence: kiosk.presence || kiosk.status || 'offline',
        setupStatus: kiosk.setupStatus || 'registered',
        lastSeen: kiosk.lastHeartbeatAt || kiosk.lastCheckInAt || kiosk.updatedAt || '—',
        raw: kiosk,
      })),
    [apiKiosks]
  );

  // ----------------------------------------------------------------------
  // Statistics directly from API meta
  // ----------------------------------------------------------------------

  const kioskStats = useMemo(() => ({
    total: meta.total ?? meta.totalRecords ?? 0,
    online: meta.online ?? 0,
    offline: meta.offline ?? 0,
    registered: meta.registered ?? 0,
  }), [meta]);

  // ----------------------------------------------------------------------
  // Status counts for StatusTabsFilterWrapper (All, Online, Offline)
  // ----------------------------------------------------------------------

  const getStatusCount = useCallback(
    (status) => {
      if (status === 'all') return meta.total ?? meta.totalRecords ?? 0;
      if (status === 'online') return meta.online ?? 0;
      if (status === 'offline') return meta.offline ?? 0;
      return 0;
    },
    [meta]
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
      const resolvedValue =
        value && typeof value === 'object' && 'target' in value
          ? value.target.value
          : value;
      filters.setState({
        [key]: resolvedValue,
      });
    },
    [filters, table]
  );

  const handleSearchChange = useCallback(
    (eventOrValue) => {
      table.onResetPage();
      const text =
        eventOrValue && typeof eventOrValue === 'object' && 'target' in eventOrValue
          ? eventOrValue.target.value
          : typeof eventOrValue === 'string'
            ? eventOrValue
            : '';
      filters.setState({
        search: text,
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
      setCurrentKiosk(kiosk?.raw || kiosk);
      openModal.onTrue();
    },
    [openModal]
  );

  const handleViewKiosk = useCallback(
    (kiosk) => {
      const targetId = kiosk.id || kiosk._id || kiosk.deviceId;
      const href = ownerDashboard
        ? paths.owner.kioskDetail(targetId)
        : paths.siteManager.kioskDetail(targetId);
      router.push(href);
    },
    [ownerDashboard, router]
  );

  const [toggleKioskLock, { isLoading: isTogglingLock }] = useToggleKioskLockMutation();

  const handleKioskSettings = useCallback((kiosk) => {
    console.log('Open kiosk settings:', kiosk);
  }, []);

  const handleLockKiosk = useCallback((kiosk) => {
    setKioskToLock(kiosk);
    lockConfirm.onTrue();
  }, [lockConfirm]);

  const handleConfirmLockToggle = useCallback(async () => {
    if (!kioskToLock) return;
    const kioskId = kioskToLock.id || kioskToLock._id || kioskToLock.deviceId;
    const isCurrentlyLocked = Boolean(
      kioskToLock.isLocked ||
      kioskToLock.isLock ||
      kioskToLock.locked ||
      kioskToLock.raw?.isLocked ||
      kioskToLock.raw?.isLock ||
      kioskToLock.raw?.locked
    );

    if (!kioskId) return;
    try {
      await toggleKioskLock({ kioskId, organizationId }).unwrap();
      toast.success(
        isCurrentlyLocked
          ? 'Kiosk device unlocked successfully'
          : 'Kiosk device locked successfully'
      );
      lockConfirm.onFalse();
      setKioskToLock(null);
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || error?.message || 'Failed to toggle kiosk lock');
    }
  }, [kioskToLock, organizationId, toggleKioskLock, lockConfirm]);

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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            {isFullOwner && (
              <InfiniteAutocomplete
                value={selectedBranch}
                onChange={handleBranchChange}
                useQuery={useGetBranchesQuery}
                queryArgs={{ organizationId }}
                mapOption={mapBranchOption}
                extraOptions={EXTRA_BRANCH_OPTIONS}
                label="Site"
                placeholder="Search site..."
                disabled={!organizationId}
                size="small"
                sx={{ minWidth: { xs: 1, sm: 260 } }}
                textFieldProps={{
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify
                          icon="solar:buildings-2-bold-duotone"
                          width={20}
                          sx={{ color: 'text.disabled' }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleRegisterKiosk}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Register Device
            </Button>
          </Stack>
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
          {isSummaryCardsLoading ? (
            <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
          ) : (
            <DataUsageSummaryCard
              title="Total Kiosks"
              total={kioskStats.total}
              color="primary"
              icon="solar:monitor-bold-duotone"
            />
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {isSummaryCardsLoading ? (
            <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
          ) : (
            <DataUsageSummaryCard
              title="Online"
              total={kioskStats.online}
              color="success"
              icon="solar:check-circle-bold-duotone"
            />
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {isSummaryCardsLoading ? (
            <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
          ) : (
            <DataUsageSummaryCard
              title="Offline"
              total={kioskStats.offline}
              color="error"
              icon="solar:close-circle-bold-duotone"
            />
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {isSummaryCardsLoading ? (
            <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
          ) : (
            <DataUsageSummaryCard
              title="Registered"
              total={kioskStats.registered}
              color="info"
              icon="solar:devices-bold-duotone"
            />
          )}
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

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table
              size={table.dense ? 'small' : 'medium'}
              sx={{ minWidth: 960 }}
            >
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                numSelected={table.selected.length}
              />

              <TableBody>
                {isLoading || isFetching ? (
                  [...Array(table.rowsPerPage || 5)].map((_, rowIndex) => (
                    <TableRow key={`kiosk-skeleton-row-${rowIndex}`}>
                      {/* Sr# */}
                      <TableCell sx={{ width: 60, py: table.dense ? 0.8 : 1.5 }}>
                        <Skeleton variant="rounded" width={24} height={18} />
                      </TableCell>

                      {/* Kiosk */}
                      <TableCell sx={{ minWidth: 220, py: table.dense ? 0.8 : 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Stack spacing={0.5} sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="70%" height={16} />
                            <Skeleton variant="text" width="45%" height={12} />
                          </Stack>
                        </Stack>
                      </TableCell>

                      {/* Device */}
                      <TableCell sx={{ minWidth: 170, py: table.dense ? 0.8 : 1.5 }}>
                        <Skeleton variant="text" width="60%" height={16} />
                      </TableCell>

                      {/* Site */}
                      <TableCell sx={{ minWidth: 220, py: table.dense ? 0.8 : 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Skeleton variant="circular" width={18} height={18} />
                          <Skeleton variant="text" width="65%" height={16} />
                        </Stack>
                      </TableCell>

                      {/* Setup */}
                      <TableCell align="center" sx={{ minWidth: 140, py: table.dense ? 0.8 : 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1 }} />
                        </Box>
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center" sx={{ width: 120, py: table.dense ? 0.8 : 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Skeleton variant="rounded" width={65} height={24} sx={{ borderRadius: 1 }} />
                        </Box>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center" sx={{ width: 100, py: table.dense ? 0.8 : 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Skeleton variant="rounded" width={70} height={24} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <>
                    {tableData.map((row, index) => (
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
                        onLockRow={() =>
                          handleLockKiosk(row)
                        }
                        onSettings={() =>
                          handleKioskSettings(row)
                        }
                        onLock={() =>
                          handleLockKiosk(row)
                        }
                      />
                    ))}

                    <TableNoData notFound={!tableData.length} />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={totalRecords}
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
        ownerDashboard={ownerDashboard}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Lock / Unlock Confirmation Dialog */}
      {/* ------------------------------------------------------------------ */}
      {kioskToLock && (
        <ConfirmDialog
          open={lockConfirm.value}
          onClose={() => {
            lockConfirm.onFalse();
            setKioskToLock(null);
          }}
          title={
            Boolean(
              kioskToLock.isLocked ||
              kioskToLock.isLock ||
              kioskToLock.locked ||
              kioskToLock.raw?.isLocked ||
              kioskToLock.raw?.isLock ||
              kioskToLock.raw?.locked
            )
              ? 'Unlock Kiosk Device'
              : 'Lock Kiosk Device'
          }
          content={
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to{' '}
              {Boolean(
                kioskToLock.isLocked ||
                kioskToLock.isLock ||
                kioskToLock.locked ||
                kioskToLock.raw?.isLocked ||
                kioskToLock.raw?.isLock ||
                kioskToLock.raw?.locked
              )
                ? 'unlock'
                : 'lock'}{' '}
              kiosk terminal (
              <strong>
                {kioskToLock.locationLabel ||
                  kioskToLock.name ||
                  kioskToLock.deviceId ||
                  'Kiosk'}
              </strong>
              )?
            </Typography>
          }
          action={
            <LoadingButton
              variant="contained"
              color={
                Boolean(
                  kioskToLock.isLocked ||
                  kioskToLock.isLock ||
                  kioskToLock.locked ||
                  kioskToLock.raw?.isLocked ||
                  kioskToLock.raw?.isLock ||
                  kioskToLock.raw?.locked
                )
                  ? 'primary'
                  : 'warning'
              }
              loading={isTogglingLock}
              onClick={handleConfirmLockToggle}
            >
              {Boolean(
                kioskToLock.isLocked ||
                kioskToLock.isLock ||
                kioskToLock.locked ||
                kioskToLock.raw?.isLocked ||
                kioskToLock.raw?.isLock ||
                kioskToLock.raw?.locked
              )
                ? 'Unlock Device'
                : 'Lock Device'}
            </LoadingButton>
          }
        />
      )}
    </DashboardContent>
  );
}