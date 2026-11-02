import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import LoadingButton from '@mui/lab/LoadingButton';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useDebounce } from 'src/hooks/use-debounce';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Iconify } from 'src/components/iconify';
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
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import {
  useGetVisitorAccountInvitationsQuery,
  useCreateVisitorAccountInvitationMutation,
  useResendVisitorAccountInvitationMutation,
  useRevokeVisitorAccountInvitationMutation,
} from 'src/store/Reducer/visitor-api';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'accepted', label: 'Accepted', color: 'success' },
  { value: 'revoked', label: 'Revoked', color: 'error' },
  { value: 'expired', label: 'Expired', color: 'error' },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'warning' },
  accepted: { label: 'Accepted', color: 'success' },
  active: { label: 'Active', color: 'success' },
  revoked: { label: 'Revoked', color: 'error' },
  cancelled: { label: 'Cancelled', color: 'error' },
  expired: { label: 'Expired', color: 'error' },
};

const mapBranchOption = (item) => ({
  value: item._id || item.id,
  label: item.name || '',
});

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 50 },
  { id: 'email', label: 'Email' },
  { id: 'site', label: 'Site' },
  { id: 'type', label: 'Type' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: 'linkedPerson', label: 'Linked person' },
  { id: 'actions', label: 'Actions', align: 'center' },
];

function getStatusLabel(status) {
  if (!status) return 'Pending';
  const s = String(status).toLowerCase();
  return STATUS_CONFIG[s]?.label || status;
}

function getStatusColor(status) {
  if (!status) return 'warning';
  const s = String(status).toLowerCase();
  return STATUS_CONFIG[s]?.color || 'default';
}

// ----------------------------------------------------------------------

export function AppAccountsView({
  siteOptions = [],
  openModal: externalOpenModal,
  branchId: propBranchId,
}) {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const { organizationId } = useCurrentOrganization();
  const internalOpenModal = useBoolean();
  const openModal = externalOpenModal || internalOpenModal;

  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const confirmResend = useBoolean();
  const confirmRevoke = useBoolean();

  const [resendAccountInvite, { isLoading: isResending }] =
    useResendVisitorAccountInvitationMutation();
  const [revokeAccountInvite, { isLoading: isRevoking }] =
    useRevokeVisitorAccountInvitationMutation();

  const handleOpenResend = useCallback(
    (row) => {
      setSelectedInvitation(row);
      confirmResend.onTrue();
    },
    [confirmResend]
  );

  const handleCloseResend = useCallback(() => {
    confirmResend.onFalse();
    setSelectedInvitation(null);
  }, [confirmResend]);

  const handleOpenRevoke = useCallback(
    (row) => {
      setSelectedInvitation(row);
      confirmRevoke.onTrue();
    },
    [confirmRevoke]
  );

  const handleCloseRevoke = useCallback(() => {
    confirmRevoke.onFalse();
    setSelectedInvitation(null);
  }, [confirmRevoke]);

  const handleResendConfirm = useCallback(async () => {
    if (!selectedInvitation) return;
    const invitationId = selectedInvitation._id || selectedInvitation.id;
    try {
      const res = await resendAccountInvite({
        organizationId: selectedInvitation.organizationId || organizationId,
        invitationId,
      }).unwrap();
      toast.success(res?.message || 'Invitation resent successfully');
      handleCloseResend();
    } catch (err) {
      // Error handled by baseQuery
    }
  }, [selectedInvitation, resendAccountInvite, organizationId, handleCloseResend]);

  const handleRevokeConfirm = useCallback(async () => {
    if (!selectedInvitation) return;
    const invitationId = selectedInvitation._id || selectedInvitation.id;
    try {
      const res = await revokeAccountInvite({
        organizationId: selectedInvitation.organizationId || organizationId,
        invitationId,
      }).unwrap();
      toast.success(res?.message || 'Invitation revoked successfully');
      handleCloseRevoke();
    } catch (err) {
      // Error handled by baseQuery
    }
  }, [selectedInvitation, revokeAccountInvite, organizationId, handleCloseRevoke]);

  const filters = useSetState({
    search: '',
    branchId: 'all',
    status: 'all',
  });

  const effectiveBranchId = propBranchId !== undefined ? propBranchId : filters.state.branchId;
  const keyword = useDebounce(filters.state.search, 500);

  // RTK Query for App Accounts (Visitor Account Invitations)
  const {
    data: accountInvitationsResponse,
    isLoading,
    isFetching,
  } = useGetVisitorAccountInvitationsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      keyword: keyword.trim(),
      branchId: effectiveBranchId && effectiveBranchId !== 'all' ? effectiveBranchId : undefined,
      ...(filters.state.status && filters.state.status !== 'all'
        ? { status: filters.state.status }
        : {}),
    },
    { skip: !organizationId }
  );

  const accountList = useMemo(
    () => accountInvitationsResponse?.data ?? [],
    [accountInvitationsResponse?.data]
  );
  const accountMeta = useMemo(
    () => accountInvitationsResponse?.meta ?? {},
    [accountInvitationsResponse?.meta]
  );
  const statusCounts = accountMeta?.counts || {};

  const displayedList = useMemo(() => {
    if (!filters.state.status || filters.state.status === 'all') {
      return accountList;
    }
    return accountList.filter((row) => {
      const s = String(row.status || '').toLowerCase();
      if (filters.state.status === 'pending') return s === 'pending' || s.includes('password');
      if (filters.state.status === 'accepted') return s === 'accepted' || s === 'active';
      if (filters.state.status === 'revoked') return s === 'revoked' || s === 'cancelled';
      if (filters.state.status === 'expired') return s === 'expired';
      return row.status === filters.state.status;
    });
  }, [accountList, filters.state.status]);

  const totalRecords =
    filters.state.status === 'all'
      ? accountMeta?.totalRecords ?? accountMeta?.total ?? accountList.length
      : statusCounts[filters.state.status] ?? accountMeta?.totalRecords ?? displayedList.length;

  const branchMap = useMemo(() => {
    const map = {};
    siteOptions.forEach((opt) => {
      if (opt?.value) {
        map[opt.value] = opt.label;
      }
    });
    return map;
  }, [siteOptions]);

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
        placeholder: 'Search Name ...',
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
    (statusValue) => {
      if (statusValue === 'all') {
        const totalFromCounts = Object.values(statusCounts).reduce(
          (sum, count) => sum + (Number(count) || 0),
          0
        );
        return totalFromCounts || accountMeta?.totalRecords || accountMeta?.total || accountList.length;
      }

      if (statusCounts[statusValue] !== undefined) {
        return statusCounts[statusValue];
      }

      return accountList.filter((item) => {
        const s = String(item.status || '').toLowerCase();
        if (statusValue === 'pending') return s === 'pending' || s.includes('password');
        if (statusValue === 'accepted') return s === 'accepted' || s === 'active';
        if (statusValue === 'revoked') return s === 'revoked' || s === 'cancelled';
        if (statusValue === 'expired') return s === 'expired';
        return item.status === statusValue;
      }).length;
    },
    [statusCounts, accountMeta, accountList]
  );

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
          <TableContainer>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
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
                        const email = row.email || row.visitorEmail || '—';
                        const siteName =
                          row.branch?.name ||
                          row.site ||
                          branchMap[row.branchId] ||
                          row.branchName ||
                          '—';
                        const personType = row.personType || row.type || row.badgeType || 'Contractor';
                        const status = row.status || (row.acceptedAt ? 'accepted' : 'pending');
                        const linkedPerson =
                          row.person?.name ||
                          row.name ||
                          row.linkedPerson ||
                          row.visitorName ||
                          (email !== '—' ? `Existing ${email}` : '—');

                        return (
                          <TableRow hover key={rowId || index}>
                            <TableCell>{table.page * table.rowsPerPage + index + 1}</TableCell>

                            <TableCell sx={{ fontWeight: 600 }}>{email}</TableCell>

                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              {siteName}
                            </TableCell>

                            <TableCell
                              sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}
                            >
                              {personType}
                            </TableCell>

                            <TableCell align="center">
                              <Label variant="soft" color={getStatusColor(status)}>
                                {getStatusLabel(status)}
                              </Label>
                            </TableCell>

                            <TableCell
                              sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}
                            >
                              {linkedPerson}
                            </TableCell>

                            <TableCell align="center">
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="center"
                                spacing={0.5}
                              >
                                <Tooltip
                                  title={
                                    status === 'revoked'
                                      ? 'Cannot resend a revoked invitation'
                                      : status === 'accepted' || status === 'active'
                                      ? 'Account has already been accepted'
                                      : 'Resend invitation'
                                  }
                                  placement="top"
                                  arrow
                                >
                                  <span>
                                    <IconButton
                                      color="primary"
                                      onClick={() => handleOpenResend(row)}
                                      disabled={
                                        isResending ||
                                        status === 'revoked' ||
                                        status === 'accepted' ||
                                        status === 'active'
                                      }
                                      sx={{ width: 32, height: 32 }}
                                    >
                                      <Iconify icon="solar:restart-bold" />
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                <Tooltip
                                  title={
                                    status === 'revoked'
                                      ? 'Invitation already revoked'
                                      : status === 'expired'
                                      ? 'Invitation expired'
                                      : 'Revoke invitation'
                                  }
                                  placement="top"
                                  arrow
                                >
                                  <span>
                                    <IconButton
                                      color="error"
                                      onClick={() => handleOpenRevoke(row)}
                                      disabled={
                                        isRevoking ||
                                        status === 'revoked' ||
                                        status === 'expired'
                                      }
                                      sx={{ width: 32, height: 32 }}
                                    >
                                      <Iconify icon="solar:close-circle-bold" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
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
          </TableContainer>
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

      {/* Resend Confirmation Dialog */}
      <ConfirmDialog
        open={confirmResend.value}
        onClose={handleCloseResend}
        title="Resend Invitation"
        content={
          <>
            Are you sure you want to resend the account invitation to{' '}
            <strong>{selectedInvitation?.email || selectedInvitation?.name || 'this user'}</strong>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="primary"
            loading={isResending}
            onClick={handleResendConfirm}
          >
            Resend
          </LoadingButton>
        }
      />

      {/* Revoke Confirmation Dialog */}
      <ConfirmDialog
        open={confirmRevoke.value}
        onClose={handleCloseRevoke}
        title="Revoke Invitation"
        content={
          <>
            Are you sure you want to revoke the account invitation for{' '}
            <strong>{selectedInvitation?.email || selectedInvitation?.name || 'this user'}</strong>?
            They will no longer be able to use this invitation to set up their account.
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            loading={isRevoking}
            onClick={handleRevokeConfirm}
          >
            Revoke
          </LoadingButton>
        }
      />

      <InviteToAppDialog
        open={openModal.value}
        onClose={openModal.onFalse}
        organizationId={organizationId}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function InviteToAppDialog({ open, onClose, organizationId }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [type, setType] = useState('contractor');

  const [createAccountInvite, { isLoading: isSubmitting }] =
    useCreateVisitorAccountInvitationMutation();

  const handleClose = () => {
    setName('');
    setEmail('');
    setSelectedBranch(null);
    setType('contractor');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter name');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter email address');
      return;
    }
    if (!selectedBranch?.value) {
      toast.error('Please select a site');
      return;
    }

    try {
      const body = {
        organizationId,
        branchId: selectedBranch.value,
        name: name.trim(),
        visitorName: name.trim(),
        email: email.trim(),
        visitorEmail: email.trim(),
        type,
        badgeType: type,
      };

      const res = await createAccountInvite(body).unwrap();
      if (res?.message) {
        toast.success(res.message);
      } else {
        toast.success('App invitation sent successfully');
      }
      handleClose();
    } catch (err) {
      // Error toast handled by baseQuery
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Invite to app</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              name="name"
              label="Name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              inputProps={{ autoComplete: 'off' }}
            />

            <TextField
              name="email"
              label="Email"
              type="email"
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              fullWidth
            >
              <MenuItem value="contractor">Contractor</MenuItem>
              <MenuItem value="visitor">Visitor</MenuItem>
            </TextField>
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
            loading={isSubmitting}
          >
            Send invite
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
