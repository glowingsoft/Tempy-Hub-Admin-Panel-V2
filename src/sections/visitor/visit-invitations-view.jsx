import { useState, useCallback, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LoadingButton from '@mui/lab/LoadingButton';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import { useCanManage } from 'src/auth/hooks';
import { ModuleSlug } from 'src/auth/permissions';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { fDateTime } from 'src/utils/format-time';
import { getListStatusTabCount } from 'src/utils/table-utils';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import {
  useGetVisitorInvitationsQuery,
  useCreateVisitorInvitationMutation,
  useResendVisitorInvitationMutation,
} from 'src/store/Reducer/visitor-api';

// ----------------------------------------------------------------------

const INVITATION_STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'checkedIn', label: 'Checked in', color: 'success' },
  { value: 'expired', label: 'Expired', color: 'error' },
  { value: 'cancelled', label: 'Cancelled', color: 'default' },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'warning' },
  checkedIn: { label: 'Checked In', color: 'success' },
  checkedin: { label: 'Checked In', color: 'success' },
  expired: { label: 'Expired', color: 'error' },
  cancelled: { label: 'Cancelled', color: 'default' },
  awaitingGuest: { label: 'Awaiting Guest', color: 'warning' },
  accepted: { label: 'Accepted', color: 'success' },
  declined: { label: 'Declined', color: 'error' },
};

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 60 },
  { id: 'visitor', label: 'Visitor', minWidth: 220 },
  { id: 'site', label: 'Site', minWidth: 160 },
  { id: 'window', label: 'Window', minWidth: 180 },
  { id: 'code', label: 'Code', width: 120, align: 'center' },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
  { id: 'actions', label: 'Actions', width: 100, align: 'center' },
];

const mapBranchOption = (item) => ({
  value: item._id || item.id,
  label: item.name || '',
});

const formatWindow = (arrivalAt, visitingUntil, fallback) => {
  if (arrivalAt && visitingUntil) {
    const start = fDateTime(arrivalAt, 'D MMM, HH:mm');
    const end = fDateTime(visitingUntil, 'HH:mm');
    return `${start}–${end}`;
  }
  if (arrivalAt) {
    return fDateTime(arrivalAt, 'D MMM, HH:mm');
  }
  return fallback || '—';
};

// ----------------------------------------------------------------------

export function VisitInvitationsView({
  siteOptions = [],
  openModal: externalOpenModal,
  branchId: propBranchId,
}) {
  const canManageVisitors = useCanManage(ModuleSlug.FIRE_DRILL_EVACUATION);
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const { organizationId } = useCurrentOrganization();
  const internalOpenModal = useBoolean();
  const openModal = externalOpenModal || internalOpenModal;

  const filters = useSetState({
    search: '',
    branchId: 'all',
    status: 'all',
  });

  const effectiveBranchId = propBranchId !== undefined ? propBranchId : filters.state.branchId;

  const keyword = useDebounce(filters.state.search, 500);
  const trimmedKeyword = keyword.trim();

  // API query
  const { data, isLoading, isFetching } = useGetVisitorInvitationsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
      ...(effectiveBranchId && effectiveBranchId !== 'all'
        ? { branchId: effectiveBranchId }
        : {}),
      ...(filters.state.status && filters.state.status !== 'all'
        ? { status: filters.state.status }
        : {}),
    },
    { skip: !organizationId }
  );

  const [resendInvitation, { isLoading: isResending }] = useResendVisitorInvitationMutation();

  const apiInvitations = data?.data || [];
  const meta = data?.meta || {};
  const statusCounts = meta.counts || {};
  const totalRecords = meta.totalRecords ?? apiInvitations.length;

  // Branch map for quick lookup by ID
  const branchMap = useMemo(() => {
    const map = {};
    siteOptions.forEach((opt) => {
      map[opt.value] = opt.label;
    });
    return map;
  }, [siteOptions]);

  const branchFilterOptions = useMemo(
    () => [{ value: 'all', label: 'All Sites' }, ...siteOptions],
    [siteOptions]
  );

  const statusFilterField = useMemo(
    () =>
      createFilterField.status({
        key: 'status',
        options: INVITATION_STATUS_OPTIONS,
        showCounts: true,
      }),
    []
  );

  const toolbarFilterFields = useMemo(
    () => [
      createFilterField.search({
        placeholder: 'Search email ...',
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

  const getStatusCount = useCallback(
    (status) => getListStatusTabCount(statusCounts, status, totalRecords),
    [statusCounts, totalRecords]
  );

  const handleResend = useCallback(
    async (row) => {
      const invitationId = row._id || row.id;
      if (!invitationId) return;

      try {
        const res = await resendInvitation({
          invitationId,
          organizationId: organizationId || row.organizationId,
        }).unwrap();
        if (res?.message) {
          toast.success(res.message);
        }
      } catch (err) {
        // Handled by baseQuery api error toast
      }
    },
    [resendInvitation, organizationId]
  );

  const notFound = !isLoading && !isFetching && apiInvitations.length === 0;

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
                    {apiInvitations.map((row, index) => {
                      const visitorName = row.visitorName || row.name || '—';
                      const visitorEmail = row.visitorEmail || row.email || '—';
                      const siteName =
                        row.branch?.name ||
                        branchMap[row.branchId] ||
                        row.branchName ||
                        row.site ||
                        (typeof row.branchId === 'object' ? row.branchId?.name : null) ||
                        '—';
                      const windowText = formatWindow(row.arrivalAt, row.visitingUntil, row.window);
                      const codeText = row.inviteCode || row.code || row.passcode || '—';
                      const statusKey = row.status || 'pending';
                      const isPending = String(statusKey).trim().toLowerCase() === 'pending';
                      const statusInfo = STATUS_CONFIG[statusKey] || {
                        label: statusKey,
                        color: 'default',
                      };

                      return (
                        <TableRow hover key={row._id || row.id || index}>
                          <TableCell>{table.page * table.rowsPerPage + index + 1}</TableCell>

                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                alt={visitorName}
                                sx={{ width: 36, height: 36, fontSize: 16 }}
                              >
                                {visitorName?.charAt(0)}
                              </Avatar>
                              <Stack
                                sx={{
                                  typography: 'body2',
                                  flex: '1 1 auto',
                                  alignItems: 'flex-start',
                                }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {visitorName}
                                </Typography>
                                <Box sx={{ color: 'text.secondary', typography: 'caption' }}>
                                  {visitorEmail}
                                </Box>
                              </Stack>
                            </Stack>
                          </TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{siteName}</TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{windowText}</TableCell>

                          <TableCell align="center">
                            <Box
                              sx={{
                                display: 'inline-block',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: 'background.neutral',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: 13,
                                letterSpacing: 1,
                              }}
                            >
                              {codeText}
                            </Box>
                          </TableCell>

                          <TableCell align="center">
                            <Label variant="soft" color={statusInfo.color}>
                              {statusInfo.label}
                            </Label>
                          </TableCell>

                          <TableCell align="center">
                            {canManageVisitors && isPending && (
                              <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                                <Tooltip title="Resend code" placement="top" arrow>
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleResend(row)}
                                    disabled={isResending}
                                    sx={{ width: 32, height: 32 }}
                                  >
                                    <Iconify icon="solar:restart-bold" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            )}
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

      <NewVisitInvitationDialog
        open={openModal.value}
        onClose={openModal.onFalse}
        organizationId={organizationId}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function NewVisitInvitationDialog({ open, onClose, organizationId }) {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [badgeType, setBadgeType] = useState('visitor');
  const [arrivalAt, setArrivalAt] = useState(dayjs());
  const [visitingUntil, setVisitingUntil] = useState(dayjs().add(9, 'hour'));
  const [hostName, setHostName] = useState('Reception');

  const [createVisitorInvitation, { isLoading: isCreating }] = useCreateVisitorInvitationMutation();

  const resetForm = useCallback(() => {
    const now = dayjs();
    setVisitorName('');
    setVisitorEmail('');
    setSelectedBranch(null);
    setBadgeType('visitor');
    setArrivalAt(now);
    setVisitingUntil(now.add(9, 'hour'));
    setHostName('Reception');
  }, []);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleArrivalChange = (newVal) => {
    setArrivalAt(newVal);
    if (newVal && visitingUntil && dayjs(visitingUntil).isBefore(newVal)) {
      setVisitingUntil(dayjs(newVal).add(2, 'hour'));
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBranch?.value) {
      toast.error('Please select a site');
      return;
    }
    if (!visitorName.trim()) {
      toast.error('Visitor name is required');
      return;
    }
    if (!visitorEmail.trim()) {
      toast.error('Visitor email is required');
      return;
    }
    if (arrivalAt && dayjs(arrivalAt).isBefore(dayjs().startOf('day'))) {
      toast.error('Arrival date cannot be before today');
      return;
    }
    if (arrivalAt && visitingUntil && dayjs(visitingUntil).isBefore(dayjs(arrivalAt))) {
      toast.error('Visiting until date cannot be earlier than arrival');
      return;
    }

    try {
      const body = {
        organizationId,
        branchId: selectedBranch.value,
        visitorName: visitorName.trim(),
        visitorEmail: visitorEmail.trim(),
        hostName: hostName.trim() || 'Reception',
        badgeType,
        arrivalAt: arrivalAt ? dayjs(arrivalAt).toISOString() : undefined,
        visitingUntil: visitingUntil ? dayjs(visitingUntil).toISOString() : undefined,
      };

      const res = await createVisitorInvitation(body).unwrap();
      if (res?.message) {
        toast.success(res.message);
      }
      handleClose();
    } catch (err) {
      // Handled by baseQuery api error toast
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>New visit invitation</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              name="visitorName"
              label="Visitor Name"
              placeholder="e.g. John Doe"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              fullWidth
              required
              inputProps={{ autoComplete: 'off' }}
            />

            <TextField
              name="visitorEmail"
              label="Visitor Email"
              type="email"
              placeholder="e.g. visitor@example.com"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.target.value)}
              fullWidth
              required
              inputProps={{ autoComplete: 'off' }}
            />

            <InfiniteAutocomplete
              label="Site"
              placeholder="Search and select site..."
              value={selectedBranch}
              onChange={(newValue) => setSelectedBranch(newValue)}
              useQuery={useGetBranchesQuery}
              queryArgs={{ organizationId }}
              mapOption={mapBranchOption}
              enabled={open && Boolean(organizationId)}
              fullWidth
            />

            <TextField
              select
              label="Badge / Type"
              value={badgeType}
              onChange={(e) => setBadgeType(e.target.value)}
              fullWidth
            >
              <MenuItem value="visitor">Visitor</MenuItem>
              <MenuItem value="contractor">Contractor</MenuItem>
            </TextField>

            <MobileDateTimePicker
              label="Arrival"
              value={arrivalAt}
              minDate={dayjs().startOf('day')}
              onChange={handleArrivalChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />

            <MobileDateTimePicker
              label="Visiting until"
              value={visitingUntil}
              minDateTime={arrivalAt || dayjs().startOf('day')}
              onChange={(newVal) => setVisitingUntil(newVal)}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />

            <TextField
              name="hostName"
              label="Host Name"
              placeholder="e.g. Reception"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isCreating}
          >
            Send code
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
