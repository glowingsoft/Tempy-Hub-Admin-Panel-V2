// pending-approval-table.jsx

import { useCallback, useMemo, useState } from 'react';

import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { TableHeadCustom, TablePaginationCustom, useTable } from 'src/components/table';

import { ApprovalModal } from '../approval-modal';
import { _pendingApprovals } from '../mocks/data';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Avatar, Button, Link, Stack } from '@mui/material';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { PENDING_APPROVAL_OPTIONS } from 'src/_mock';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { useSetState } from 'src/hooks/use-set-state';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { UserTableFiltersResult } from 'src/sections/user/user-table-filters-result';
import PendingApprovalTableRow from '../pending-approval-table-row';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: '5%' },
  { id: 'employee', label: 'Employee', width: '24%' },
  { id: 'type', label: 'Request Type', align: 'center', width: '16%' },
  { id: 'requested', label: 'Requested Change', width: '18%' },
  // { id: 'reason', label: 'Reason' },
  { id: 'submittedOn', label: 'Submitted On', align: 'center', width: '13%' },
  { id: 'status', label: 'Status', align: 'center', width: '9%' },
  { id: 'actions', label: 'Actions', align: 'center', width: '15%' },
];


const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...PENDING_APPROVAL_OPTIONS];

const FILTER_FIELDS = [
  createFilterField.status({
    options: STATUS_OPTIONS,
    showCounts: true,
  }),

  createFilterField.search({
    placeholder: 'Search ...',
  })
];

// ----------------------------------------------------------------------

function PendingApprovalListView() {

  const table = useTable();

  const approvalModal = useBoolean();

  const rejectModal = useBoolean();

  const filters = useSetState({ name: '', status: 'all' });

  const [selectedRequest, setSelectedRequest] = useState(null);

  const meta = {};

  const handleOpenModal = (row) => setSelectedRequest(row);

  const handleCloseModal = () => setSelectedRequest(null);

  const handleApprove = (row, comment) => {
    onApprove?.(row, comment);
    handleCloseModal();
  };

  const handleReject = (row, comment) => {
    onReject?.(row, comment);
    handleCloseModal();
  };

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((f) => f.type === 'status'),
    []
  );

  // Get toolbar filter fields (exclude status as it's in tabs)
  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((f) => f.type !== 'status'),
    []
  );

  const getStatusCount = useCallback((status) => {
    const statusCounts = meta?.usersCount || {};
    if (status === 'all') {
      return statusCounts.total || 0;
    }


    return statusCounts[status] || 0;
  },
    [meta]
  );


  const canReset = !!filters.state.name || filters.state.status !== 'all';


  const handleFilterChange = () => {

  }

  const handleSearchChange = () => {

  }


  return (

    <DashboardContent>
      <CustomBreadcrumbs
        heading="Pending Approvals List"
        links={[
          { name: 'Dashboard', href: paths.siteManager.root },
          { name: 'Directory', href: paths.siteManager.directory.root },
          { name: 'Pending Approvals List' },
        ]}
        action={
          <Button variant="outlined" startIcon={<Iconify icon="solar:export-bold" />} onClick={() => { }}>
            Export to CSV
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />
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

        {canReset && (
          <UserTableFiltersResult
            filters={filters}
            totalResults={meta?.totalRecords || 0}
            onResetPage={table.onResetPage}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}
        <TableContainer sx={{ overflowX: 'hidden' }}>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHeadCustom headLabel={TABLE_HEAD} />

            <TableBody>
              {_pendingApprovals.map((row) => (
                <PendingApprovalTableRow
                  key={row.id}
                  row={row}
                  onOpenModal={handleOpenModal}
                  onApproval={approvalModal.onTrue}
                  onReject={rejectModal.onTrue}
                />
              ))}
            </TableBody>
          </Table>

          <TablePaginationCustom
            page={table.page}
            count={_pendingApprovals.length}
            dense={table.dense}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            onChangeDense={table.onChangeDense}
          />
        </TableContainer>

        <ConfirmDialog
          open={approvalModal.value}
          onClose={approvalModal.onFalse}
          title="Approve Request"
          content="Are you sure you want to approve this request?"
          action={
            <Button variant="contained" color="success" onClick={approvalModal.onFalse}>
              Approve
            </Button>
          }
        />
        <ConfirmDialog
          open={rejectModal.value}
          onClose={rejectModal.onFalse}
          title="Reject Request"
          content="Are you sure you want to reject this request?"
          action={
            <Button variant="contained" color="error" onClick={rejectModal.onFalse}>
              Reject
            </Button>
          }
        />

      </Card>
    </DashboardContent>
  );
}

export default PendingApprovalListView;

PendingApprovalListView.propTypes = {
  records: PropTypes.array,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
};