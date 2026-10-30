import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { CONFIG } from 'src/config-global';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Iconify } from 'src/components/iconify';
import { Lightbox } from 'src/components/lightbox';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { getUserBranchId } from 'src/utils/organization';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import {
  useDecideFamilyUploadMutation,
  useGetFamilyUploadsQuery,
} from 'src/store/Reducer/family-uploads-api';

import DisapprovePhotoDialog from 'src/sections/active-sections/photo-approval/disapprove-photo-dialog';
import { FamilyModerationTableRow } from '../family-moderation-table-row';
import { PhotoUploadCreateDialog } from '../photo-upload-create-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'photo', label: 'Photo', width: 80 },
  { id: 'resident', label: 'Resident' },
  { id: 'caption', label: 'Caption / Story' },
  { id: 'uploadedBy', label: 'Uploaded by' },
  { id: 'date', label: 'Submitted' },
  { id: 'status', label: 'Status', align: 'center', width: 120 },
  { id: 'actions', label: 'Actions', align: 'center', width: 140 },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'waiting', label: 'Pending', color: 'warning' },
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

export function FamilyModerationView({
  heading = 'Moderation',
  canCreate = false,
  canModerate = true,
}) {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId, user } = useCurrentOrganization();
  const branchId = getUserBranchId(user, organizationId);

  const previewModal = useBoolean();
  const createDialog = useBoolean();
  const disapproveDialog = useBoolean();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [disapproveTarget, setDisapproveTarget] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  const filters = useSetState({ search: '', status: 'all' });
  const trimmedKeyword = useDebounce(filters.state.search, 400).trim();
  const { status } = filters.state;

  const { data, isLoading, isFetching, isError } = useGetFamilyUploadsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(status && status !== 'all' ? { status } : {}),
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
    },
    { skip: !organizationId }
  );

  const [decideFamilyUpload] = useDecideFamilyUploadMutation();

  const uploads = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta ?? {};
  const statusCounts = meta.counts ?? {};
  const totalRecords = meta.totalRecords ?? uploads.length;
  const loading = isLoading || isFetching;

  const breadcrumbLinks = [
    { name: 'Dashboard', href: familyPaths.dashboardRoot },
    { name: 'Family Engagement', href: familyPaths.familyOverview },
    { name: heading },
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
    const photos = Array.isArray(selectedRequest?.photos) ? selectedRequest.photos : [];
    return photos
      .map((photo) => photo?.url)
      .filter(Boolean)
      .map((src) => ({ type: 'image', src }));
  }, [selectedRequest]);

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
    (tabStatus) => {
      if (tabStatus === 'all') {
        return statusCounts.total ?? totalRecords;
      }
      return statusCounts[tabStatus] ?? 0;
    },
    [statusCounts, totalRecords]
  );

  const notFound = !loading && !uploads.length;

  const handleOpenPreview = (row) => {
    setSelectedRequest(row);
    setPreviewIndex(0);
    previewModal.onTrue();
  };

  const handleApprove = useCallback(
    async (row) => {
      if (!row?.uploadId || row.status !== 'waiting') return;
      try {
        await decideFamilyUpload({
          uploadId: row.uploadId,
          organizationId,
          action: 'approve',
        }).unwrap();
        toast.success(`Upload for ${row.residentName || 'resident'} approved`);
      } catch (error) {
        toast.error(error?.data?.message || error?.message || 'Failed to approve upload');
      }
    },
    [decideFamilyUpload, organizationId]
  );

  const handleDisapproveClick = useCallback(
    (row) => {
      if (row.status !== 'waiting') return;
      setDisapproveTarget(row);
      disapproveDialog.onTrue();
    },
    [disapproveDialog]
  );

  const handleConfirmDisapprove = useCallback(
    async (row, reason) => {
      if (!row?.uploadId) return;
      try {
        await decideFamilyUpload({
          uploadId: row.uploadId,
          organizationId,
          action: 'reject',
          rejectionReason: reason?.trim() || undefined,
        }).unwrap();
        disapproveDialog.onFalse();
        setDisapproveTarget(null);
        toast.success(`Upload for ${row.residentName || 'resident'} rejected`);
      } catch (error) {
        toast.error(error?.data?.message || error?.message || 'Failed to reject upload');
      }
    },
    [decideFamilyUpload, disapproveDialog, organizationId]
  );

  const dialogPhoto = disapproveTarget
    ? {
      ...disapproveTarget,
      room: disapproveTarget.roomNumber,
      caption: disapproveTarget.message,
      thumbnail: disapproveTarget.photos?.[0]?.url,
      uploadedBy: disapproveTarget.authorName,
    }
    : null;

  return (
    <>
      <Helmet>
        <title>{`${heading} | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading={heading}
          links={breadcrumbLinks}
          action={
            canCreate ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={createDialog.onTrue}
              >
                Create
              </Button>
            ) : null
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

          <Box sx={{ position: 'relative' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {loading ? (
                    <TableBodySkeleton
                      rowCount={table.rowsPerPage}
                      cellCount={TABLE_HEAD.length}
                      dense={table.dense}
                    />
                  ) : (
                    <>
                      {uploads.map((row, index) => (
                        <FamilyModerationTableRow
                          key={row.uploadId || index}
                          row={row}
                          serialNumber={table.page * table.rowsPerPage + index + 1}
                          onPreview={() => handleOpenPreview(row)}
                          onApprove={() => handleApprove(row)}
                          onDisapprove={() => handleDisapproveClick(row)}
                          canModerate={canModerate}
                        />
                      ))}

                      <TableNoData
                        notFound={notFound}
                        title={
                          isError ? 'Unable to load uploads' : 'No family uploads found'
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
            count={totalRecords}
            dense={table.dense}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            onChangeDense={table.onChangeDense}
          />
        </Card>

        <Lightbox
          open={previewModal.value}
          close={previewModal.onFalse}
          slides={slides}
          index={previewIndex}
        />

        <DisapprovePhotoDialog
          open={disapproveDialog.value}
          onClose={() => {
            disapproveDialog.onFalse();
            setDisapproveTarget(null);
          }}
          photo={dialogPhoto}
          onConfirm={handleConfirmDisapprove}
        />

        {canCreate && (
          <PhotoUploadCreateDialog
            open={createDialog.value}
            onClose={createDialog.onFalse}
            organizationId={organizationId}
            branchId={branchId}
          />
        )}
      </DashboardContent>
    </>
  );
}

FamilyModerationView.propTypes = {
  heading: PropTypes.string,
  canCreate: PropTypes.bool,
  canModerate: PropTypes.bool,
};

export default FamilyModerationView;
