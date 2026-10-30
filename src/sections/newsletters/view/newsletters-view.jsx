import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TextField from '@mui/material/TextField';

import { ConfirmDialog } from 'src/components/custom-dialog';
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
import { useRouter } from 'src/routes/hooks';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { UserTableFiltersResult } from 'src/sections/user/user-table-filters-result';
import { getUserBranchId } from 'src/utils/organization';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import {
  useDeleteFamilyNewsletterMutation,
  useGetFamilyNewslettersQuery,
  useLazyGetFamilyNewsletterPdfQuery,
} from 'src/store/Reducer/family-newsletters-api';

import { NewsletterCreateDialog } from '../newsletter-create-dialog';
import { NewsletterPdfPreviewDialog } from '../newsletter-pdf-preview-dialog';
import { NewsletterTableRow } from '../newsletter-table-row';
import { NEWSLETTER_STATUS_OPTIONS, canDeleteNewsletter, getNewsletterId } from '../utils';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 60 },
  { id: 'title', label: 'Newsletter', width: '28%', minWidth: 220 },
  { id: 'month', label: 'Month', width: '12%', minWidth: 110 },
  { id: 'author', label: 'Author', width: '16%', minWidth: 140 },
  { id: 'highlights', label: 'Highlights', align: 'center', width: '12%', minWidth: 110 },
  { id: 'status', label: 'Status', align: 'center', width: '12%', minWidth: 120 },
  { id: 'actions', label: 'Actions', align: 'center', width: '16%', minWidth: 140 },
];

const FILTER_FIELDS = [
  createFilterField.status({
    options: NEWSLETTER_STATUS_OPTIONS,
    showCounts: true,
  }),
  createFilterField.search({
    key: 'name',
    placeholder: 'Search title...',
  }),
];

// ----------------------------------------------------------------------

export function NewslettersView() {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 10 });
  const router = useRouter();
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

  const filters = useSetState({ name: '', status: 'all' });
  const trimmedKeyword = useDebounce(filters.state.name, 400).trim();

  const createDialog = useBoolean();
  const previewDialog = useBoolean();
  const deleteDialog = useBoolean();
  const [previewPdfUrl, setPreviewPdfUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('Newsletter PDF');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const { data, isLoading, isFetching, isError } = useGetFamilyNewslettersQuery(
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

  const [getFamilyNewsletterPdf] = useLazyGetFamilyNewsletterPdfQuery();
  const [deleteFamilyNewsletter, { isLoading: isDeleting }] = useDeleteFamilyNewsletterMutation();

  const rows = data?.data ?? [];
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
      if (status === 'all') return totalRecords;
      const option = NEWSLETTER_STATUS_OPTIONS.find((item) => item.value === status);
      return statusCounts[option?.countKey] ?? 0;
    },
    [statusCounts, totalRecords]
  );

  const canReset = !!filters.state.name || filters.state.status !== 'all';
  const notFound = !loading && (!rows.length || isError);

  const openEdit = useCallback(
    (row) => {
      const newsletterId = getNewsletterId(row);
      if (!newsletterId || !familyPaths.newsletterEdit) return;
      router.push(familyPaths.newsletterEdit(newsletterId));
    },
    [familyPaths.newsletterEdit, router]
  );

  const clearPreviewPdf = useCallback(() => {
    setPreviewPdfUrl((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return '';
    });
  }, []);

  const handleOpenPreview = useCallback(
    async (row) => {
      const newsletterId = getNewsletterId(row);
      if (!newsletterId || !organizationId) return;

      setPreviewTitle(row?.title || 'Newsletter PDF');
      clearPreviewPdf();
      previewDialog.onTrue();
      setPreviewLoading(true);

      try {
        const result = await getFamilyNewsletterPdf({
          organizationId,
          newsletterId,
          download: false,
        }).unwrap();

        if (!(result?.blob instanceof Blob)) {
          toast.error('Unable to load newsletter PDF');
          return;
        }

        setPreviewPdfUrl(URL.createObjectURL(result.blob));
      } catch (error) {
        toast.error(error?.data?.message || error?.message || 'Unable to load newsletter PDF');
      } finally {
        setPreviewLoading(false);
      }
    },
    [clearPreviewPdf, getFamilyNewsletterPdf, organizationId, previewDialog]
  );

  const handleAskDelete = useCallback(
    (row) => {
      if (!canDeleteNewsletter(row?.status)) return;
      setRowToDelete(row);
      deleteDialog.onTrue();
    },
    [deleteDialog]
  );

  const handleConfirmDelete = useCallback(async () => {
    const newsletterId = getNewsletterId(rowToDelete);
    if (!newsletterId) return;

    try {
      await deleteFamilyNewsletter({ organizationId, newsletterId }).unwrap();
      toast.success('Newsletter deleted');
      deleteDialog.onFalse();
      setRowToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to delete newsletter');
    }
  }, [deleteDialog, deleteFamilyNewsletter, organizationId, rowToDelete]);

  return (
    <>
      <Helmet>
        <title>{`Newsletters | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading="Newsletters"
          links={[
            { name: 'Dashboard', href: familyPaths.dashboardRoot },
            { name: 'Family Engagement', href: familyPaths.familyOverview },
            { name: 'Newsletters' },
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
                Create newsletter
              </Button>
            </Stack>
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
                        <NewsletterTableRow
                          key={getNewsletterId(row) || index}
                          row={row}
                          serialNumber={table.page * table.rowsPerPage + index + 1}
                          onEdit={openEdit}
                          onPreview={handleOpenPreview}
                          onDelete={handleAskDelete}
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

      <NewsletterCreateDialog
        open={createDialog.value}
        onClose={createDialog.onFalse}
        organizationId={organizationId}
        isOwner={isOwner}
        defaultBranchId={branchId}
        defaultBranchName={selectedBranchName}
        onCreated={(newsletterId) => {
          table.onResetPage();
          if (newsletterId && familyPaths.newsletterEdit) {
            router.push(familyPaths.newsletterEdit(newsletterId));
          }
        }}
      />

      <NewsletterPdfPreviewDialog
        open={previewDialog.value}
        onClose={() => {
          previewDialog.onFalse();
          setPreviewLoading(false);
          clearPreviewPdf();
        }}
        title={previewTitle}
        pdfUrl={previewPdfUrl}
        loading={previewLoading}
      />

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
          setRowToDelete(null);
        }}
        title="Delete newsletter"
        content={
          <>
            Delete <strong>{rowToDelete?.title || 'this newsletter'}</strong>? This cannot be undone.
          </>
        }
        action={
          <LoadingButton variant="contained" color="error" loading={isDeleting} onClick={handleConfirmDelete}>
            Delete
          </LoadingButton>
        }
      />
    </>
  );
}

export default NewslettersView;
