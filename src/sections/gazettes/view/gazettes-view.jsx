import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TextField from '@mui/material/TextField';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { CONFIG } from 'src/config-global';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { UserTableFiltersResult } from 'src/sections/user/user-table-filters-result';
import { getUserBranchId } from 'src/utils/organization';
import { getListStatusTabCount } from 'src/utils/table-utils';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import {
  useDownloadAllFamilyGazettesMutation,
  useGetFamilyGazettesQuery,
  useLazyGetFamilyGazettePdfQuery,
  useMarkFamilyGazettesPrintedMutation,
  useRegenerateFamilyGazetteMutation,
} from 'src/store/Reducer/family-gazettes-api';

import { GazetteCreateDialog } from '../gazette-create-dialog';
import { GazettePreviewDialog } from '../gazette-preview-dialog';
import { GazetteSummaryCards } from '../gazette-summary-cards';
import { GazetteTableRow } from '../gazette-table-row';
import {
  GAZETTE_STATUS_OPTIONS,
  getGazetteItemId,
  mapGazetteListItem,
  triggerFileDownload,
} from '../utils';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 60 },
  { id: 'resident', label: 'Resident', width: '22%', minWidth: 200 },
  { id: 'room', label: 'Room', align: 'center', width: '13%', minWidth: 110 },
  { id: 'family', label: 'Family', align: 'center', width: '13%', minWidth: 110 },
  { id: 'messages', label: 'Messages', align: 'center', width: '13%', minWidth: 110 },
  { id: 'status', label: 'Status', align: 'center', width: '15%', minWidth: 140 },
  { id: 'actions', label: 'Actions', align: 'center', width: '24%', minWidth: 220 },
];

const FILTER_FIELDS = [
  createFilterField.status({
    options: GAZETTE_STATUS_OPTIONS,
    showCounts: true,
  }),
  createFilterField.search({
    key: 'name',
    placeholder: 'Search resident, room, or status...',
  }),
];

// ----------------------------------------------------------------------

export function GazettesView() {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 10 });
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId, isOwner, user } = useCurrentOrganization();

  const staffBranchId = getUserBranchId(user, organizationId);
  const [ownerBranchId, setOwnerBranchId] = useState('');
  const branchId = isOwner ? ownerBranchId : staffBranchId;

  const { data: branchesData } = useGetBranchesQuery(
    { organizationId, page: 1, limit: 100 },
    { skip: !isOwner || !organizationId }
  );
  const branches = branchesData?.data ?? [];
  const selectedBranchName =
    branches.find((branch) => branch._id === branchId)?.name || user?.branch?.name || '';

  useEffect(() => {
    if (!isOwner || !branches.length) return;
    if (!ownerBranchId || !branches.some((branch) => branch._id === ownerBranchId)) {
      setOwnerBranchId(branches[0]._id);
    }
  }, [branches, isOwner, ownerBranchId]);

  const [activeResident, setActiveResident] = useState(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState('');
  const [targetResident, setTargetResident] = useState(null);

  const filters = useSetState({ name: '', status: 'all' });
  const trimmedKeyword = useDebounce(filters.state.name, 400).trim();

  const previewDialog = useBoolean();
  const createDialog = useBoolean();

  const { data, isLoading, isFetching, isError } = useGetFamilyGazettesQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      branchId,
      ...(filters.state.status && filters.state.status !== 'all' ? { status: filters.state.status } : {}),
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
    },
    { skip: !organizationId || !branchId }
  );

  const [getFamilyGazettePdf] = useLazyGetFamilyGazettePdfQuery();
  const [downloadAllFamilyGazettes, { isLoading: isDownloadingAll }] = useDownloadAllFamilyGazettesMutation();
  const [markFamilyGazettesPrinted, { isLoading: isMarkingPrinted }] = useMarkFamilyGazettesPrintedMutation();
  const [regenerateFamilyGazette] = useRegenerateFamilyGazetteMutation();

  const rows = useMemo(() => (data?.data ?? []).map(mapGazetteListItem), [data?.data]);
  const statusCounts = data?.meta?.counts ?? {};
  const totalRecords = data?.meta?.totalRecords ?? 0;
  const loading = isLoading || isFetching;

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );
  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((field) => field.type !== 'status'),
    []
  );

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
      if (status === 'all') return getListStatusTabCount(statusCounts, 'all', totalRecords);
      const option = GAZETTE_STATUS_OPTIONS.find((item) => item.value === status);
      return statusCounts[option?.countKey] ?? 0;
    },
    [statusCounts, totalRecords]
  );

  const canReset = !!filters.state.name || filters.state.status !== 'all';
  const notFound = !loading && (!rows.length || isError);

  const clearPreviewPdf = useCallback(() => {
    setPreviewPdfUrl((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current);
      }
      return '';
    });
  }, []);

  const handleOpenPreview = useCallback(
    async (row) => {
      setActiveResident(row);
      setTargetResident(row);
      clearPreviewPdf();

      if (!row?.hasPdf) {
        toast.error('No PDF is available for this gazette yet');
        return;
      }

      const gazetteItemId = getGazetteItemId(row);
      if (!gazetteItemId) return;

      previewDialog.onTrue();

      try {
        const result = await getFamilyGazettePdf({
          organizationId,
          gazetteItemId,
          download: false,
        }).unwrap();

        if (!(result?.blob instanceof Blob)) {
          toast.error('Unable to load gazette PDF');
          return;
        }

        setPreviewPdfUrl(URL.createObjectURL(result.blob));
      } catch (error) {
        toast.error(error?.data?.message || error?.message || 'Unable to load gazette PDF');
      }
    },
    [clearPreviewPdf, getFamilyGazettePdf, organizationId, previewDialog]
  );

  const handleClosePreview = useCallback(() => {
    previewDialog.onFalse();
    clearPreviewPdf();
  }, [clearPreviewPdf, previewDialog]);

  const handleRegenerate = useCallback(
    async (row) => {
      const gazetteItemId = getGazetteItemId(row);
      if (!gazetteItemId) return;

      try {
        await regenerateFamilyGazette({ organizationId, gazetteItemId }).unwrap();
        toast.success(`Gazette regenerated successfully for ${row.resident}`);
      } catch (error) {
        toast.error(error?.data?.message || error?.message || 'Unable to regenerate gazette');
      }
    },
    [organizationId, regenerateFamilyGazette]
  );

  const handlePdfDownload = useCallback(
    async (row) => {
      const gazetteItemId = getGazetteItemId(row);
      if (!gazetteItemId) return;

      try {
        const result = await getFamilyGazettePdf({
          organizationId,
          gazetteItemId,
          download: false,
          format: 'url',
        }).unwrap();

        if (!result?.url) {
          toast.error('PDF download link is not available');
          return;
        }

        triggerFileDownload(
          result.url,
          result.filename || `${String(row.resident).replace(/\s+/g, '_')}_Gazette.pdf`
        );
        toast.success(`Downloading ${row.resident} gazette PDF`);
      } catch (error) {
        toast.error(error?.data?.message || error?.message || 'Unable to download gazette PDF');
      }
    },
    [getFamilyGazettePdf, organizationId]
  );

  const handleMarkPrinted = useCallback(async () => {
    if (!organizationId || !branchId) {
      toast.error('Select a site first');
      return;
    }

    try {
      const result = await markFamilyGazettesPrinted({ organizationId, branchId }).unwrap();
      toast.success(result?.message || 'Marked as printed');
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to mark gazettes as printed');
    }
  }, [branchId, markFamilyGazettesPrinted, organizationId]);

  const handleDownloadAllPDFs = useCallback(async () => {
    if (!organizationId) return;

    try {
      const result = await downloadAllFamilyGazettes({ organizationId, branchId }).unwrap();
      const blob = result?.blob;
      if (!(blob instanceof Blob)) {
        toast.error('Unable to download gazette PDFs');
        return;
      }

      const href = URL.createObjectURL(blob);
      triggerFileDownload(href, result?.filename || 'gazettes.zip');
      URL.revokeObjectURL(href);
      toast.success('Downloading gazettes bundle...');
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to download gazette PDFs');
    }
  }, [branchId, downloadAllFamilyGazettes, organizationId]);

  const previewResident = useMemo(() => {
    if (!targetResident && !activeResident) return null;
    return {
      ...(targetResident || activeResident),
      pdfUrl: previewPdfUrl,
    };
  }, [activeResident, previewPdfUrl, targetResident]);

  return (
    <>
      <Helmet>
        <title>{`Gazettes | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading="Gazettes"
          links={[
            { name: 'Dashboard', href: familyPaths.dashboardRoot },
            { name: 'Family Engagement', href: familyPaths.familyOverview },
            { name: 'Gazettes' },
          ]}
          action={
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              {isOwner && (
                <TextField
                  select
                  size="small"
                  label="Site"
                  value={ownerBranchId}
                  onChange={(event) => {
                    setOwnerBranchId(event.target.value);
                    table.onResetPage();
                  }}
                  sx={{ minWidth: { xs: 1, sm: 220 } }}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch._id} value={branch._id} sx={{ textTransform: 'capitalize' }}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={createDialog.onTrue}
                disabled={!organizationId}
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                sx={{ fontWeight: 700 }}
              >
                Create gazettes
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleDownloadAllPDFs}
                disabled={isDownloadingAll || !branchId}
                startIcon={
                  isDownloadingAll ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Iconify icon="solar:file-download-bold" />
                  )
                }
                sx={{ fontWeight: 600, bgcolor: 'background.paper' }}
              >
                Download all PDFs
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleMarkPrinted}
                disabled={isMarkingPrinted || !branchId}
                startIcon={
                  isMarkingPrinted ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Iconify icon="solar:printer-check-bold" />
                  )
                }
                sx={{ fontWeight: 600, bgcolor: 'background.paper' }}
              >
                Mark printed
              </Button>
            </Stack>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <GazetteSummaryCards counts={statusCounts} total={totalRecords} />

        <Card sx={{ mb: 4 }}>
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
              totalResults={totalRecords}
              onResetPage={handleResetFilters}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {!branchId || loading ? (
                    branchId ? (
                      <TableBodySkeleton
                        rowCount={table.rowsPerPage}
                        cellCount={TABLE_HEAD.length}
                        dense={table.dense}
                      />
                    ) : (
                      <TableNoData notFound />
                    )
                  ) : (
                    <>
                      {rows.map((row, index) => (
                        <GazetteTableRow
                          key={getGazetteItemId(row)}
                          row={row}
                          serialNumber={table.page * table.rowsPerPage + index + 1}
                          isSelected={activeResident?.id === row.id}
                          onSelectRow={setActiveResident}
                          onPreview={handleOpenPreview}
                          onRegenerate={handleRegenerate}
                          onPdf={handlePdfDownload}
                        />
                      ))}
                      <TableNoData notFound={notFound} />
                    </>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>

            <TablePaginationCustom
              page={table.page}
              count={totalRecords}
              dense={table.dense}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              onChangeDense={table.onChangeDense}
            />
          </TableContainer>
        </Card>
      </DashboardContent>

      <GazetteCreateDialog
        open={createDialog.value}
        onClose={createDialog.onFalse}
        organizationId={organizationId}
        isOwner={isOwner}
        defaultBranchId={branchId}
        defaultBranchName={selectedBranchName}
        onCreated={(createdBranchId) => {
          if (isOwner && createdBranchId) {
            setOwnerBranchId(createdBranchId);
          }
          table.onResetPage();
        }}
      />

      <GazettePreviewDialog
        open={previewDialog.value}
        onClose={handleClosePreview}
        resident={previewResident}
      />
    </>
  );
}

export default GazettesView;
