import { useCallback, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { CONFIG } from 'src/config-global';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Lightbox } from 'src/components/lightbox';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { UserTableFiltersResult } from 'src/sections/user/user-table-filters-result';

import { _pendingPhotoApprovals } from 'src/sections/active-sections/photo-approval/mocks/data';
import DisapprovePhotoDialog from 'src/sections/active-sections/photo-approval/disapprove-photo-dialog';
import { FamilyModerationTableRow } from '../family-moderation-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 60 },
  { id: 'photo', label: 'Photo', width: 80 },
  { id: 'resident', label: 'Resident' },
  { id: 'caption', label: 'Caption / Story' },
  { id: 'uploadedBy', label: 'Uploaded by' },
  { id: 'date', label: 'Submitted' },
  { id: 'status', label: 'Status', align: 'center', width: 120 },
  { id: 'actions', label: 'Actions', align: 'center', width: 140 },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'primary' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' },
];

const FILTER_FIELDS = [
  createFilterField.status({
    options: STATUS_OPTIONS,
    showCounts: true,
  }),
  createFilterField.search({
    placeholder: 'Search resident, caption, or uploader...',
  }),
];

// ----------------------------------------------------------------------

export function FamilyModerationView() {
  const table = useTable();
  const familyPaths = useFamilyEngagementPaths();

  const previewModal = useBoolean();
  const disapproveDialog = useBoolean();

  const [tableData, setTableData] = useState(_pendingPhotoApprovals);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [disapproveTarget, setDisapproveTarget] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  const filters = useSetState({ name: '', status: 'all' });

  // Contextual breadcrumb links based on role
  const breadcrumbLinks = [
    { name: 'Dashboard', href: familyPaths.dashboardRoot },
    { name: 'Family Engagement', href: familyPaths.familyOverview },
    { name: 'Moderation' },
  ];

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((f) => f.type === 'status'),
    []
  );

  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((f) => f.type !== 'status'),
    []
  );

  const slides = useMemo(() => {
    const photos = selectedRequest?.photos?.length
      ? selectedRequest.photos
      : selectedRequest?.thumbnail
      ? [selectedRequest.thumbnail]
      : [];
    return photos.map((photo) => ({ type: 'image', src: photo }));
  }, [selectedRequest]);

  const handleSearchChange = useCallback(
    (event) => {
      table.onResetPage();
      filters.setState({ name: event.target.value });
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

  const handleResetFilters = useCallback(() => {
    table.onResetPage();
    filters.setState({ name: '', status: 'all' });
  }, [filters, table]);

  const getStatusCount = useCallback(
    (status) => {
      if (status === 'all') return tableData.length;
      return tableData.filter((item) => item.status === status).length;
    },
    [tableData]
  );

  const filteredRows = useMemo(() => {
    const search = filters.state.name.trim().toLowerCase();
    const status = filters.state.status;

    return tableData.filter((row) => {
      const matchesSearch =
        !search ||
        row.residentName?.toLowerCase().includes(search) ||
        row.caption?.toLowerCase().includes(search) ||
        row.uploadedBy?.toLowerCase().includes(search);

      const matchesStatus = status === 'all' || row.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [tableData, filters.state.name, filters.state.status]);

  const canReset = !!filters.state.name || filters.state.status !== 'all';

  const notFound = !filteredRows.length;

  const dataInPage = useMemo(
    () =>
      filteredRows.slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
      ),
    [filteredRows, table.page, table.rowsPerPage]
  );

  const handleOpenPreview = (row) => {
    setSelectedRequest(row);
    setPreviewIndex(0);
    previewModal.onTrue();
  };

  const handleApprove = useCallback((row) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? {
              ...item,
              status: 'approved',
              approvedAt: new Date().toISOString().split('T')[0],
              rejectionReason: undefined,
            }
          : item
      )
    );
    toast.success(`Upload for ${row.residentName} approved successfully!`);
  }, []);

  const handleDisapproveClick = useCallback(
    (row) => {
      setDisapproveTarget(row);
      disapproveDialog.onTrue();
    },
    [disapproveDialog]
  );

  const handleConfirmDisapprove = useCallback(
    (row, reason) => {
      setTableData((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? {
                ...item,
                status: 'rejected',
                rejectionReason: reason || 'Disapproved by Manager',
              }
            : item
        )
      );
      disapproveDialog.onFalse();
      setDisapproveTarget(null);
      toast.error(`Upload for ${row.residentName} disapproved.`);
    },
    [disapproveDialog]
  );

  return (
    <>
      <Helmet>
        <title>{`Moderation | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading="Moderation"
          links={breadcrumbLinks}
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
            totalResults={filteredRows.length}
            onResetPage={handleResetFilters}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <TableContainer>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {dataInPage.map((row, index) => (
                  <FamilyModerationTableRow
                    key={row.id}
                    row={row}
                    serialNumber={table.page * table.rowsPerPage + index + 1}
                    onPreview={() => handleOpenPreview(row)}
                    onApprove={() => handleApprove(row)}
                    onDisapprove={() => handleDisapproveClick(row)}
                  />
                ))}

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>

          <TablePaginationCustom
            page={table.page}
            count={filteredRows.length}
            dense={table.dense}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            onChangeDense={table.onChangeDense}
          />
        </TableContainer>
      </Card>

      {/* Lightbox photo preview */}
      <Lightbox
        open={previewModal.value}
        close={previewModal.onFalse}
        slides={slides}
        index={previewIndex}
      />

      {/* Disapprove confirmation dialog */}
      <DisapprovePhotoDialog
        open={disapproveDialog.value}
        onClose={() => {
          disapproveDialog.onFalse();
          setDisapproveTarget(null);
        }}
        photo={disapproveTarget}
        onConfirm={handleConfirmDisapprove}
      />
    </DashboardContent>
  </>
  );
}

export default FamilyModerationView;