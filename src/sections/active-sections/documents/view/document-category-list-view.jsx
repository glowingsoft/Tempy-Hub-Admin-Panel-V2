// document-category-list-view.jsx
import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { DashboardContent } from 'src/layouts/dashboard';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { getListStatusTabCount } from 'src/utils/table-utils';

import {
  useGetDocumentCategoriesQuery,
  useDeleteDocumentCategoryMutation,
} from 'src/store/Reducer/document-categories-api';
import { toast } from 'src/components/snackbar';

import {
  DocumentCategoryTableRow,
  DocumentCategoryTableRowSkeleton,
} from '../document-category-table-row';
import { DocumentCategoryCreateModal } from '../document-category-create-modal';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'error' },
];

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 64, align: 'center' },
  { id: 'title', label: 'Category Name', width: '28%' },
  { id: 'documentCount', label: 'Count', width: '12%', align: 'center' },
  { id: 'createdBy', label: 'Created By', width: '22%', align: 'center' },
  { id: 'status', label: 'Status', width: '12%', align: 'center' },
  { id: 'createdAt', label: 'Created At', width: '16%', align: 'center' },
  { id: 'actions', label: 'Actions', width: 90, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({
    placeholder: 'Search categories...',
  }),
];

// ----------------------------------------------------------------------

export function DocumentCategoryListView({ ownerDashboard = false }) {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });
  const router = useRouter();
  const pathname = usePathname();
  const { organizationId } = useCurrentOrganization();

  const isOwner = Boolean(ownerDashboard || pathname.startsWith('/owner-dashboard'));

  const [selectedCategory, setSelectedCategory] = useState(null);

  const createModal = useBoolean();
  const deleteModal = useBoolean();
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const filters = useSetState({
    search: '',
    status: 'all',
  });

  const keyword = useDebounce(filters.state.search, 400);

  const queryParams = useMemo(() => ({
    organizationId,
    page: table.page + 1,
    limit: table.rowsPerPage,
    ...(keyword?.trim() ? { keyword: keyword.trim() } : {}),
    ...(filters.state.status && filters.state.status !== 'all'
      ? { status: filters.state.status }
      : {}),
  }), [organizationId, table.page, table.rowsPerPage, keyword, filters.state.status]);

  const {
    data: categoriesResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetDocumentCategoriesQuery(queryParams, {
    skip: !organizationId,
  });

  const [deleteCategory, { isLoading: isDeleting }] = useDeleteDocumentCategoryMutation();

  const categories = useMemo(() => {
    if (Array.isArray(categoriesResponse?.data)) {
      return categoriesResponse.data;
    }
    if (Array.isArray(categoriesResponse?.categories)) {
      return categoriesResponse.categories;
    }
    if (Array.isArray(categoriesResponse)) {
      return categoriesResponse;
    }
    return [];
  }, [categoriesResponse]);

  const totalCount =
    categoriesResponse?.meta?.totalRecords ||
    categoriesResponse?.meta?.total ||
    categoriesResponse?.total ||
    categories.length;

  const statusCounts = categoriesResponse?.meta?.counts || {};

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );

  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((field) => field.type !== 'status'),
    []
  );

  const getStatusCount = useCallback(
    (status) => {
      if (status === 'all') return getListStatusTabCount(statusCounts, 'all', totalCount);
      if (status === 'active') return statusCounts?.active ?? categories.filter((c) => c.active).length;
      if (status === 'inactive') return statusCounts?.inactive ?? categories.filter((c) => !c.active).length;
      return 0;
    },
    [statusCounts, totalCount, categories]
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      table.onResetPage();
      filters.setState({ [key]: value });
    },
    [filters, table]
  );

  const handleSearchChange = useCallback(
    (eventOrValue) => {
      table.onResetPage();
      const text =
        eventOrValue && typeof eventOrValue === 'object' && 'target' in eventOrValue
          ? eventOrValue.target.value
          : typeof eventOrValue === 'string'
            ? eventOrValue
            : '';
      filters.setState({ search: text });
    },
    [filters, table]
  );

  const handleOpenCreate = useCallback(() => {
    setSelectedCategory(null);
    createModal.onTrue();
  }, [createModal]);

  const handleOpenEdit = useCallback(
    (cat) => {
      setSelectedCategory(cat);
      createModal.onTrue();
    },
    [createModal]
  );

  const handleOpenDelete = useCallback(
    (cat) => {
      setCategoryToDelete(cat);
      deleteModal.onTrue();
    },
    [deleteModal]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (categoryToDelete) {
      const categoryId = categoryToDelete._id || categoryToDelete.id;
      try {
        await deleteCategory({
          organizationId,
          categoryId,
        }).unwrap();
        toast.success('Category deleted successfully');
        deleteModal.onFalse();
        setCategoryToDelete(null);
      } catch (err) {
        toast.error(err?.data?.message || err?.message || 'Failed to delete category');
      }
    }
  }, [categoryToDelete, deleteCategory, organizationId, deleteModal]);

  const handleSaveSuccess = useCallback(() => {
    table.onResetPage();
  }, [table]);

  const isLineManager = pathname.startsWith('/line-manager');
  const isAdmin = pathname.startsWith('/admin-dashboard');

  const documentsRoot = isOwner
    ? paths.owner.documents.root
    : isLineManager
      ? paths.lineManager?.documents?.root || '/line-manager/documents'
      : isAdmin
        ? paths.adminDashboard?.documents?.root || '/admin-dashboard/documents'
        : paths.siteManager.documents.root;

  const dashboardRoot = isOwner
    ? paths.owner.root
    : isLineManager
      ? paths.lineManager?.root || '/line-manager'
      : isAdmin
        ? paths.adminDashboard?.root || '/admin-dashboard'
        : paths.siteManager.root;

  return (
    <DashboardContent>
      <Box sx={{ mb: 2 }}>
        <Button
          color="primary"
          onClick={() => router.push(documentsRoot)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
        >
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading="Document Categories"
        links={[
          { name: 'Dashboard', href: dashboardRoot },
          { name: 'Documents', href: documentsRoot },
          { name: 'Categories' },
        ]}
        action={
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenCreate}
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Create Category
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

        <Box sx={{ position: 'relative', width: 1, minWidth: 0 }}>
          <Scrollbar sx={{ width: 1 }}>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 880 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
              />

              <TableBody>
                {isLoading || isFetching ? (
                  [...Array(table.rowsPerPage)].map((_, index) => (
                    <DocumentCategoryTableRowSkeleton
                      key={`category-skeleton-${index}`}
                      dense={table.dense}
                    />
                  ))
                ) : categories.length > 0 ? (
                  categories.map((row, index) => (
                    <DocumentCategoryTableRow
                      key={row._id || row.id || index}
                      row={row}
                      serialNumber={table.page * table.rowsPerPage + index + 1}
                      onEdit={handleOpenEdit}
                      onDelete={handleOpenDelete}
                    />
                  ))
                ) : (
                  <TableNoData notFound={categories.length === 0} />
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={totalCount}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <DocumentCategoryCreateModal
        open={createModal.value}
        onClose={createModal.onFalse}
        organizationId={organizationId}
        currentCategory={selectedCategory}
        onSuccess={handleSaveSuccess}
      />

      <ConfirmDialog
        open={deleteModal.value}
        onClose={deleteModal.onFalse}
        title="Delete Category"
        content={`Are you sure you want to delete category "${categoryToDelete?.title || categoryToDelete?.name || ''}"?`}
        action={
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        }
      />
    </DashboardContent>
  );
}