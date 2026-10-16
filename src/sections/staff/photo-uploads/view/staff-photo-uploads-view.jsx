import { useCallback, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
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
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { TableEmptyRows, TableHeadCustom, TableNoData, TablePaginationCustom, emptyRows, useTable } from 'src/components/table';
import { UserTableFiltersResult } from 'src/sections/user/user-table-filters-result';

import { _pendingPhotoApprovals } from 'src/sections/active-sections/photo-approval/mocks/data';
import { FamilyWallPostDialog } from 'src/sections/family-engagement/family-wall-post-dialog';
import { StaffPhotoUploadsTableRow } from '../staff-photo-uploads-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 60 },
  { id: 'photo', label: 'Photo', width: 80 },
  { id: 'resident', label: 'Resident' },
  { id: 'caption', label: 'Caption / Story' },
  { id: 'uploadedBy', label: 'Uploaded by' },
  { id: 'date', label: 'Submitted' },
  { id: 'status', label: 'Status', align: 'center', width: 140 },
  { id: 'actions', label: 'Actions', align: 'center', width: 100 },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'pending', label: 'Waiting', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'rejected', label: 'Not approved', color: 'error' },
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

export function StaffPhotoUploadsView() {
  const table = useTable();
  const familyPaths = useFamilyEngagementPaths();

  const previewModal = useBoolean();
  const wallPostDialog = useBoolean();

  const [tableData, setTableData] = useState(_pendingPhotoApprovals);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  const filters = useSetState({ name: '', status: 'all' });

  // Breadcrumbs for staff
  const breadcrumbLinks = [
    { name: 'Dashboard', href: familyPaths.dashboardRoot },
    { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.myResidents },
    { name: 'Photo Uploads' },
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

  const handleOpenPreview = useCallback(
    (row) => {
      setSelectedRequest(row);
      setPreviewIndex(0);
      previewModal.onTrue();
    },
    [previewModal]
  );

  const handlePostCreated = useCallback(
    (newPostData) => {
      const newEntry = {
        id: `upload-${Date.now()}`,
        residentName: newPostData?.residentName || 'Florence Resident',
        residentAvatar: '',
        room: '101',
        caption: newPostData?.title ? `${newPostData.title} - ${newPostData.content || ''}` : 'New post shared with family',
        uploadedBy: 'Staff Member',
        uploadedAt: new Date().toISOString().split('T')[0],
        status: 'pending',
        thumbnail: newPostData?.photos?.[0] || 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80',
        photos: newPostData?.photos || [
          'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
        ],
        photoCount: newPostData?.photos?.length || 1,
      };

      setTableData((prev) => [newEntry, ...prev]);
      toast.success('Photo post uploaded successfully and submitted for approval!');
    },
    []
  );

  return (
    <>
      <Helmet>
        <title>{`Photo Uploads | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading="Photo Uploads"
          links={breadcrumbLinks}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={wallPostDialog.onTrue}
              sx={{ fontWeight: 600 }}
            >
              Add Post
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
                    <StaffPhotoUploadsTableRow
                      key={row.id}
                      serialNumber={table.page * table.rowsPerPage + index + 1}
                      row={row}
                      onPreview={() => handleOpenPreview(row)}
                    />
                  ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 76}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, filteredRows.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={filteredRows.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      {/* Lightbox for previewing uploaded photos */}
      <Lightbox
        open={previewModal.value}
        close={previewModal.onFalse}
        slides={slides}
        index={previewIndex}
      />

      {/* Add Post Dialog reused from Gazette / Family Engagement */}
      <FamilyWallPostDialog
        open={wallPostDialog.value}
        onClose={wallPostDialog.onFalse}
        onCreated={handlePostCreated}
      />
    </>
  );
}

export default StaffPhotoUploadsView;