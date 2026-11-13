import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LoadingButton from '@mui/lab/LoadingButton';

import { useCanManage } from 'src/auth/hooks';
import { ModuleSlug } from 'src/auth/permissions';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useDebounce } from 'src/hooks/use-debounce';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableBodySkeleton,
  useTable,
} from 'src/components/table';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { fDateTime } from 'src/utils/format-time';
import { getListStatusTabCount } from 'src/utils/table-utils';

import {
  useGetVisitSessionsQuery,
  useApproveVisitSessionMutation,
  useDenyVisitSessionMutation,
} from 'src/store/Reducer/visitor-api';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'awaitingApproval', label: 'Awaiting approval', color: 'warning' },
  { value: 'onSite', label: 'On site', color: 'success' },
  { value: 'checkedOut', label: 'Checked out', color: 'default' },
  { value: 'denied', label: 'Denied', color: 'error' },
];

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 60 },
  { id: 'person', label: 'Person', minWidth: 220 },
  { id: 'type', label: 'Type', minWidth: 160 },
  { id: 'method', label: 'Method', minWidth: 160 },
  { id: 'arrived', label: 'Arrived', minWidth: 180 },
  { id: 'status', label: 'Status', width: 140, align: 'center' },
  { id: 'actions', label: 'Actions', width: 100, align: 'center' },
];

// Helper to test if a status indicates awaiting approval
function isAwaitingApproval(status) {
  if (!status) return false;
  const s = String(status).toLowerCase().replace(/[-_]/g, '');
  return s === 'awaitingapproval' || s === 'pendingapproval' || s === 'pending';
}

function getStatusColor(status) {
  if (isAwaitingApproval(status)) return 'warning';
  const s = String(status).toLowerCase().replace(/[-_]/g, '');
  if (s === 'onsite' || s === 'checkedin' || s === 'active') return 'success';
  if (s === 'denied' || s === 'rejected') return 'error';
  return 'default';
}

function getStatusLabel(status) {
  if (isAwaitingApproval(status)) return 'Awaiting approval';
  const s = String(status).toLowerCase().replace(/[-_]/g, '');
  if (s === 'onsite' || s === 'checkedin' || s === 'active') return 'On site';
  if (s === 'denied' || s === 'rejected') return 'Denied';
  if (s === 'checkedout' || s === 'completed') return 'Checked out';
  return status || '—';
}

function formatMethod(method) {
  if (!method) return 'Walk-in';
  const str = String(method).trim();
  const lower = str.toLowerCase();
  if (lower === 'walkin' || lower === 'walk-in' || lower === 'walk_in') {
    return 'Walk-in';
  }
  if (lower === 'prebooked' || lower === 'pre-booked' || lower === 'pre_booked') {
    return 'Pre-booked';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ----------------------------------------------------------------------

export function VisitSessionsView() {
  const canManageVisitors = useCanManage(ModuleSlug.FIRE_DRILL_EVACUATION);
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const { organizationId } = useCurrentOrganization();
  const [selectedSession, setSelectedSession] = useState(null);
  const confirmApprove = useBoolean();
  const confirmDeny = useBoolean();

  const filters = useSetState({
    search: '',
    status: 'all',
  });

  const keyword = useDebounce(filters.state.search, 500);

  // RTK Query for Visit Sessions
  const {
    data: visitSessionsResponse,
    isLoading,
    isFetching,
  } = useGetVisitSessionsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      keyword: keyword.trim(),
      ...(filters.state.status && filters.state.status !== 'all'
        ? { status: filters.state.status }
        : {}),
    },
    { skip: !organizationId }
  );

  const [approveVisitSession, { isLoading: isApproving }] = useApproveVisitSessionMutation();
  const [denyVisitSession, { isLoading: isDenying }] = useDenyVisitSessionMutation();

  const sessionList = useMemo(
    () => visitSessionsResponse?.data ?? [],
    [visitSessionsResponse?.data]
  );
  const sessionMeta = useMemo(
    () => visitSessionsResponse?.meta ?? {},
    [visitSessionsResponse?.meta]
  );
  const statusCounts = sessionMeta?.counts || {};

  // Filter list (handles both server-filtered responses and client fallback)
  const displayedList = useMemo(() => {
    if (!filters.state.status || filters.state.status === 'all') {
      return sessionList;
    }
    return sessionList.filter((row) => {
      if (filters.state.status === 'awaitingApproval') return isAwaitingApproval(row.status);
      const s = String(row.status || '').toLowerCase().replace(/[-_]/g, '');
      if (filters.state.status === 'onSite') return s === 'onsite' || s === 'checkedin' || s === 'active';
      if (filters.state.status === 'denied') return s === 'denied' || s === 'rejected';
      if (filters.state.status === 'checkedOut') return s === 'checkedout' || s === 'completed';
      return row.status === filters.state.status;
    });
  }, [sessionList, filters.state.status]);

  const totalRecords =
    filters.state.status === 'all'
      ? sessionMeta?.totalRecords ?? sessionMeta?.total ?? sessionList.length
      : statusCounts[filters.state.status] ?? sessionMeta?.totalRecords ?? displayedList.length;

  const statusFilterField = useMemo(
    () =>
      createFilterField.status({
        key: 'status',
        options: STATUS_OPTIONS,
        showCounts: true,
      }),
    []
  );

  const toolbarFilterFields = useMemo(
    () => [
      createFilterField.search({
        placeholder: 'Search person ...',
      }),
    ],
    []
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      table.onResetPage();
      filters.setState({ [key]: value });
    },
    [filters, table]
  );

  const handleSearchChange = useCallback(
    (event) => {
      table.onResetPage();
      filters.setState({ search: event.target.value });
    },
    [filters, table]
  );

  // Status counts from backend meta.counts with fallback to local count
  const getStatusCount = useCallback(
    (statusValue) => {
      if (statusValue === 'all') {
        return getListStatusTabCount(
          statusCounts,
          'all',
          sessionMeta?.totalRecords || sessionMeta?.total || sessionList.length
        );
      }

      if (statusCounts[statusValue] !== undefined) {
        return statusCounts[statusValue];
      }

      return sessionList.filter((item) => {
        if (statusValue === 'awaitingApproval') return isAwaitingApproval(item.status);
        const s = String(item.status || '').toLowerCase().replace(/[-_]/g, '');
        if (statusValue === 'onSite') return s === 'onsite' || s === 'checkedin' || s === 'active';
        if (statusValue === 'denied') return s === 'denied' || s === 'rejected';
        if (statusValue === 'checkedOut') return s === 'checkedout' || s === 'completed';
        return item.status === statusValue;
      }).length;
    },
    [statusCounts, sessionMeta, sessionList]
  );

  const handleOpenApprove = (row) => {
    setSelectedSession(row);
    confirmApprove.onTrue();
  };

  const handleOpenDeny = (row) => {
    setSelectedSession(row);
    confirmDeny.onTrue();
  };

  const handleCloseApprove = () => {
    confirmApprove.onFalse();
    setSelectedSession(null);
  };

  const handleCloseDeny = () => {
    confirmDeny.onFalse();
    setSelectedSession(null);
  };

  const handleApproveConfirm = async () => {
    if (!selectedSession) return;
    const sessionId = selectedSession._id || selectedSession.id;
    try {
      await approveVisitSession({
        visitSessionId: sessionId,
        organizationId: selectedSession.organizationId || organizationId,
      }).unwrap();
      toast.success('Visit session approved successfully');
      handleCloseApprove();
    } catch (error) {
      // Error toast handled by base query
    }
  };

  const handleDenyConfirm = async () => {
    if (!selectedSession) return;
    const sessionId = selectedSession._id || selectedSession.id;
    try {
      await denyVisitSession({
        visitSessionId: sessionId,
        organizationId: selectedSession.organizationId || organizationId,
      }).unwrap();
      toast.success('Visit session denied');
      handleCloseDeny();
    } catch (error) {
      // Error toast handled by base query
    }
  };

  const notFound = !isLoading && !isFetching && displayedList.length === 0;

  return (
    <>
      <Card>
        <StatusTabsFilterWrapper
          filterField={statusFilterField}
          value={filters.state.status}
          onChange={handleFilterChange}
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
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {isLoading || isFetching ? (
                  <TableBodySkeleton
                    rowCount={table.rowsPerPage}
                    cellCount={TABLE_HEAD.length}
                    dense={table.dense}
                  />
                ) : (
                  <>
                    {displayedList.map((row, index) => {
                      const rowId = row._id || row.id;
                      const person = typeof row.person === 'object' && row.person !== null ? row.person : null;
                      const personName =
                        person?.name ||
                        row.visitorName ||
                        (typeof row.person === 'string' ? row.person : null) ||
                        row.name ||
                        row.externalPerson?.name ||
                        person?.email ||
                        row.visitorEmail ||
                        'Unknown';
                      const personEmail = person?.email || row.externalPerson?.email || row.visitorEmail || '';
                      const personAvatar = person?.photoUrl || row.externalPerson?.photoUrl || row.avatarUrl || '';
                      const personType = row.personType || person?.type || row.badgeType || row.type || row.visitorType || 'Visitor';
                      const visitMethod =
                        row.method ||
                        (row.isWalkIn ? 'Walk-in' : '') ||
                        (row.inviteCode ? 'Pre-booked' : 'Walk-in');
                      const arrivedAt =
                        row.checkInAt || row.enteredAt || row.arrivalAt || row.createdAt;
                      const awaiting = isAwaitingApproval(row.status);

                      return (
                        <TableRow key={rowId || index} hover>
                          <TableCell sx={{ width: 60 }}>
                            {table.page * table.rowsPerPage + index + 1}
                          </TableCell>

                          <TableCell sx={{ minWidth: 220 }}>
                            <Stack spacing={2} direction="row" alignItems="center">
                              <Avatar
                                alt={personName}
                                src={personAvatar}
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: 'primary.lighter',
                                  color: 'primary.darker',
                                  fontWeight: 700,
                                  fontSize: 16,
                                }}
                              >
                                {personName.charAt(0).toUpperCase()}
                              </Avatar>
                              <Stack
                                sx={{
                                  typography: 'body2',
                                  flex: '1 1 auto',
                                  alignItems: 'flex-start',
                                }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {personName}
                                </Typography>
                                {personEmail && (
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {personEmail}
                                  </Typography>
                                )}
                              </Stack>
                            </Stack>
                          </TableCell>

                          <TableCell sx={{ minWidth: 160, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                            {personType}
                          </TableCell>

                          <TableCell sx={{ minWidth: 160, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                            {formatMethod(visitMethod)}
                          </TableCell>

                          <TableCell sx={{ minWidth: 180, whiteSpace: 'nowrap' }}>
                            {arrivedAt ? fDateTime(arrivedAt) : '—'}
                          </TableCell>

                          <TableCell align="center" sx={{ width: 140 }}>
                            <Label variant="soft" color={getStatusColor(row.status)}>
                              {getStatusLabel(row.status)}
                            </Label>
                          </TableCell>

                          <TableCell align="center" sx={{ width: 100 }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="center"
                              spacing={0.5}
                            >
                              {canManageVisitors && awaiting ? (
                                <>
                                  <Tooltip title="Approve" placement="top" arrow>
                                    <IconButton
                                      color="success"
                                      onClick={() => handleOpenApprove(row)}
                                      sx={{ width: 32, height: 32 }}
                                    >
                                      <Iconify icon="solar:check-circle-bold" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Deny" placement="top" arrow>
                                    <IconButton
                                      color="error"
                                      onClick={() => handleOpenDeny(row)}
                                      sx={{ width: 32, height: 32 }}
                                    >
                                      <Iconify icon="solar:close-circle-bold" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : (
                                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                  —
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    <TableNoData notFound={notFound} />
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
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {/* Approve Confirm Dialog */}
      <ConfirmDialog
        open={confirmApprove.value}
        onClose={handleCloseApprove}
        title="Approve Walk-in Visit"
        content={
          <>
            Are you sure you want to approve the walk-in visit for{' '}
            <strong>
              {selectedSession?.person?.name ||
                selectedSession?.visitorName ||
                (typeof selectedSession?.person === 'string' ? selectedSession?.person : null) ||
                selectedSession?.name ||
                'this visitor'}
            </strong>
            ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="primary"
            loading={isApproving}
            onClick={handleApproveConfirm}
          >
            Approve
          </LoadingButton>
        }
      />

      {/* Deny Confirm Dialog */}
      <ConfirmDialog
        open={confirmDeny.value}
        onClose={handleCloseDeny}
        title="Deny Walk-in Visit"
        content={
          <>
            Are you sure you want to deny the walk-in visit for{' '}
            <strong>
              {selectedSession?.person?.name ||
                selectedSession?.visitorName ||
                (typeof selectedSession?.person === 'string' ? selectedSession?.person : null) ||
                selectedSession?.name ||
                'this visitor'}
            </strong>
            ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            loading={isDenying}
            onClick={handleDenyConfirm}
          >
            Deny
          </LoadingButton>
        }
      />
    </>
  );
}
