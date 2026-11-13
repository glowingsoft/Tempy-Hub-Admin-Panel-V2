import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useCanManage } from 'src/auth/hooks';
import { ModuleSlug } from 'src/auth/permissions';
import { paths } from 'src/routes/paths';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { fDateTime } from 'src/utils/format-time';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { SHIFT_STATUS_OPTIONS } from 'src/sections/shift/mocks/data';
import {
  useClaimStaffShiftMutation,
  useGetMyShiftsQuery,
  useGetOpenShiftsQuery,
} from 'src/store/Reducer/shifts-api';

import { StaffShiftTableRow } from './staff-shift-table-row';

// ----------------------------------------------------------------------

const FILTER_FIELDS = [createFilterField.search({ placeholder: 'Search site...' })];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  ...SHIFT_STATUS_OPTIONS.filter(({ value }) => value !== 'open'),
];

const STATUS_FILTER_FIELD = createFilterField.status({
  options: STATUS_OPTIONS,
  showCounts: true,
});

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'branch', label: 'Site', minWidth: 140 },
  { id: 'startsAt', label: 'Start Date/Time', minWidth: 170 },
  { id: 'endsAt', label: 'End Date/Time', minWidth: 170 },
  { id: 'status', label: 'Status', width: 130, align: 'center' },
];

// ----------------------------------------------------------------------

function StaffShiftClaimDialog({ open, onClose, shift, organizationId, onClaimSuccess }) {
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState(false);
  const [claimStaffShift, { isLoading }] = useClaimStaffShiftMutation();

  useEffect(() => {
    if (open) {
      setNote('');
      setNoteError(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!shift?._id) return;

    const trimmedNote = note.trim();
    if (!trimmedNote) {
      setNoteError(true);
      return;
    }

    try {
      await claimStaffShift({
        shiftId: shift._id,
        organizationId,
        note: trimmedNote,
      }).unwrap();

      toast.success('Shift claim submitted successfully!');
      onClaimSuccess(shift._id);
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Failed to submit shift claim.');
    }
  };

  if (!shift) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6">Claim Shift</Typography>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2.5}>
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: 'background.neutral',
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Site
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {shift.branch?.name || '—'} {shift.branch?.code ? `(${shift.branch.code})` : ''}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Start Date/Time
                </Typography>
                <Typography variant="body2">{fDateTime(shift.startsAt)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  End Date/Time
                </Typography>
                <Typography variant="body2">{fDateTime(shift.endsAt)}</Typography>
              </Box>
            </Stack>
          </Box>

          <TextField
            label="Claim Note"
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              if (event.target.value.trim()) setNoteError(false);
            }}
            multiline
            rows={3}
            fullWidth
            required
            error={noteError}
            helperText={noteError ? 'Claim note is required.' : undefined}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <LoadingButton variant="contained" color="primary" loading={isLoading} onClick={handleConfirm}>
          Submit Claim
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

StaffShiftClaimDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  shift: PropTypes.object,
  organizationId: PropTypes.string,
  onClaimSuccess: PropTypes.func,
};

// ----------------------------------------------------------------------

export function StaffShiftListView({ claimable = false } = {}) {
  const canManageRota = useCanManage(ModuleSlug.ROTA_SCHEDULING);
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 10 });
  const { organizationId } = useCurrentOrganization();
  const [claimedShiftIds, setClaimedShiftIds] = useState([]);
  const [claimDialog, setClaimDialog] = useState({ open: false, shift: null });
  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 500).trim();

  const myShiftsQuery = useGetMyShiftsQuery(
    { organizationId, keyword, status: filters.state.status },
    { skip: !organizationId || claimable }
  );
  const openShiftsQuery = useGetOpenShiftsQuery(
    { organizationId, keyword },
    { skip: !organizationId || !claimable }
  );
  const query = claimable ? openShiftsQuery : myShiftsQuery;
  const shifts = useMemo(() => query.data?.data ?? [], [query.data]);
  const statusCounts = query.data?.meta?.counts ?? {};
  const totalRecords = query.data?.meta?.totalRecords ?? shifts.length;

  const filteredShifts = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return shifts.filter(
      (shift) =>
        (claimable ||
          filters.state.status === 'all' ||
          shift.status === filters.state.status) &&
        (!claimable ||
          !search ||
          shift.branch?.name?.toLowerCase().includes(search) ||
          shift.branch?.code?.toLowerCase().includes(search))
    );
  }, [claimable, filters.state.status, keyword, shifts]);

  const paginatedShifts = useMemo(() => {
    const start = table.page * table.rowsPerPage;
    return filteredShifts.slice(start, start + table.rowsPerPage);
  }, [filteredShifts, table.page, table.rowsPerPage]);

  const handleSearchChange = useCallback(
    (event) => {
      table.onResetPage();
      filters.setState({ search: event.target.value });
    },
    [filters, table]
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      table.onResetPage();
      filters.setState({ [key]: value });
    },
    [filters, table]
  );

  const getStatusCount = useCallback(
    (status) => {
      if (status === 'all') return totalRecords;
      return Number(statusCounts[status]) || 0;
    },
    [statusCounts, totalRecords]
  );

  const handleOpenClaimDialog = useCallback((shift) => {
    setClaimDialog({ open: true, shift });
  }, []);

  const handleCloseClaimDialog = useCallback(() => {
    setClaimDialog({ open: false, shift: null });
  }, []);

  const handleClaimSuccess = useCallback((shiftId) => {
    setClaimedShiftIds((current) => (current.includes(shiftId) ? current : [...current, shiftId]));
  }, []);

  const tableHead =
    claimable && canManageRota
      ? [...TABLE_HEAD, { id: 'actions', label: 'Action', width: 140, align: 'center' }]
      : TABLE_HEAD;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={claimable ? 'Shift Claim' : 'My Shifts'}
        links={[
          { name: 'Dashboard', href: paths.staff.dashboard },
          { name: claimable ? 'Shift Claim' : 'My Shifts' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        {!claimable && (
          <StatusTabsFilterWrapper
            filterField={STATUS_FILTER_FIELD}
            value={filters.state.status}
            onChange={handleFilterChange}
            getCount={getStatusCount}
          />
        )}

        <FlexibleTableToolbar
          filterFields={FILTER_FIELDS}
          filterValues={filters.state}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: claimable ? 880 : 740 }}>
              <TableHeadCustom headLabel={tableHead} />

              <TableBody>
                {query.isLoading || query.isFetching ? (
                  <TableBodySkeleton
                    rowCount={table.rowsPerPage}
                    cellCount={tableHead.length}
                    dense={table.dense}
                  />
                ) : (
                  <>
                    {paginatedShifts.map((row, index) => (
                      <StaffShiftTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        claimed={claimedShiftIds.includes(row._id) || Boolean(row.filledByClaimId)}
                        showClaimAction={claimable && canManageRota}
                        onClaim={claimable ? handleOpenClaimDialog : undefined}
                      />
                    ))}

                    <TableNoData
                      notFound={!filteredShifts.length}
                      title={
                        query.isError
                          ? 'Unable to load shifts. Please try again.'
                          : claimable
                            ? 'No open shifts available to claim'
                            : 'No shifts assigned to you'
                      }
                    />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={filteredShifts.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {claimable && (
        <StaffShiftClaimDialog
          open={claimDialog.open}
          onClose={handleCloseClaimDialog}
          shift={claimDialog.shift}
          organizationId={organizationId}
          onClaimSuccess={handleClaimSuccess}
        />
      )}
    </DashboardContent>
  );
}

StaffShiftListView.propTypes = {
  claimable: PropTypes.bool,
};
