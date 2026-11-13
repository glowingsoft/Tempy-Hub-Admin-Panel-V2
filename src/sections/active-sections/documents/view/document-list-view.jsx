// document-list-view.jsx
import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { useCanManage } from 'src/auth/hooks';
import { ModuleSlug } from 'src/auth/permissions';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { usePathname, useRouter } from 'src/routes/hooks';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { DashboardContent } from 'src/layouts/dashboard';

import InputAdornment from '@mui/material/InputAdornment';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetDocumentsQuery, useDeleteDocumentMutation } from 'src/store/Reducer/documents-api';
import UploadDocumentModal from '../upload-document-modal';
import ReplaceDocumentModal from '../replace-document-modal';
import {
  DocumentTableRow,
  DocumentTableRowSkeleton,
} from '../document-table-row';
import { paths } from 'src/routes/paths';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { toast } from 'src/components/snackbar';
import LoadingButton from '@mui/lab/LoadingButton';

// ----------------------------------------------------------------------

const ALL_BRANCHES_VALUE = 'all';

const mapBranchOption = (item) => ({
  value: item._id,
  label: item.name,
});

const EXTRA_BRANCH_OPTIONS = [{ value: ALL_BRANCHES_VALUE, label: 'All sites' }];

const SCOPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'org', label: 'Organization' },
  { value: 'branch', label: 'Branch' },
  { value: 'personal', label: 'Personal' },
];

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 64, align: 'center' },
  { id: 'documentName', label: 'Document', width: 320 },
  { id: 'scope', label: 'Scope', width: 160 },
  { id: 'version', label: 'Version', width: 130, align: 'center' },
  { id: 'updatedAt', label: 'Updated At', width: 160, align: 'center' },
  { id: 'actions', label: 'Actions', width: 130, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.search({
    placeholder: 'Search documents...',
  }),
  createFilterField.select({
    key: 'scope',
    label: 'Scope',
    options: SCOPE_OPTIONS,
    defaultValue: 'all',
  }),
];

// ----------------------------------------------------------------------

export function DocumentListView({ ownerDashboard = false, isStaff: isStaffProp = false }) {
  const canManageDocuments = useCanManage(ModuleSlug.DOCUMENTS_ESIGN);
  const table = useTable({ defaultDense: true });
  const router = useRouter();
  const pathname = usePathname();
  const { organizationId } = useCurrentOrganization();

  const isStaff = Boolean(isStaffProp || pathname.startsWith('/staff'));
  const isLineManager = pathname.startsWith('/line-manager');
  const isOwner = Boolean(!isStaff && (ownerDashboard || pathname.startsWith('/owner-dashboard')));

  const categoriesPath = isOwner
    ? paths.owner.documents.categories
    : isLineManager
      ? paths.lineManager?.documents?.categories || '/line-manager/documents/categories'
      : paths.siteManager.documents.categories;

  const [selectedBranch, setSelectedBranch] = useState(EXTRA_BRANCH_OPTIONS[0]);

  const filters = useSetState({
    search: '',
    category: 'all',
    scope: 'all',
  });

  const openUploadModal = useBoolean();
  const replaceModal = useBoolean();
  const deleteModal = useBoolean();
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const keyword = useDebounce(filters.state.search, 500);

  const queryScope =
    filters.state.scope && filters.state.scope !== 'all'
      ? filters.state.scope
      : undefined;

  const branchId = isOwner && selectedBranch?.value !== ALL_BRANCHES_VALUE ? selectedBranch?.value : undefined;

  const handleBranchChange = useCallback(
    (option) => {
      table.onResetPage();
      setSelectedBranch(option || EXTRA_BRANCH_OPTIONS[0]);
    },
    [table]
  );

  const { data: documentsData, isLoading, isFetching } = useGetDocumentsQuery(
    {
      organizationId,
      branchId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      keyword: keyword || undefined,
      scope: queryScope,
    },
    { skip: !organizationId }
  );

  const apiDocuments = useMemo(() => {
    if (Array.isArray(documentsData?.data)) {
      return documentsData.data;
    }
    if (Array.isArray(documentsData?.documents)) {
      return documentsData.documents;
    }
    if (Array.isArray(documentsData)) {
      return documentsData;
    }
    return [];
  }, [documentsData]);

  const totalCount =
    documentsData?.total ||
    documentsData?.meta?.total ||
    documentsData?.totalRecords ||
    apiDocuments.length;

  const categoryFilterField = useMemo(
    () => FILTER_FIELDS.find((f) => f.type === 'status'),
    []
  );

  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((f) => f.type !== 'status'),
    []
  );

  const tableData = apiDocuments.map((doc) => {
    // Some backend APIs return `version` as an object: {_id, version, createdAt, uploadedBy, file}
    // or as a number/string.
    const resolvedVersion =
      typeof doc.version === 'object' && doc.version !== null
        ? doc.version.version || doc.version.name || '1.0'
        : doc.version != null
          ? String(doc.version)
          : '1.0';

    const resolvedFolder =
      typeof doc.folder === 'object' && doc.folder !== null
        ? doc.folder.name || doc.folder.title || doc.folder._id || ''
        : typeof doc.folder === 'string'
          ? doc.folder
          : '';

    const rawScope = doc.scopeLabel || doc.scope || doc.scopeType || doc.category;
    const resolvedScopeLabel =
      typeof rawScope === 'object' && rawScope !== null
        ? rawScope.name || rawScope.label || ''
        : typeof rawScope === 'string'
          ? rawScope.toLowerCase() === 'org'
            ? 'Organization'
            : rawScope.toLowerCase() === 'branch'
              ? 'Branch'
              : rawScope.toLowerCase() === 'personal'
                ? 'Personal'
                : rawScope
          : '';

    const resolvedFileType =
      typeof doc.fileType === 'string'
        ? doc.fileType
        : typeof doc.mimeType === 'string'
          ? doc.mimeType.split('/')[1] || 'pdf'
          : typeof doc.file === 'object' && typeof doc.file?.mimeType === 'string'
            ? doc.file.mimeType.split('/')[1] || 'pdf'
            : 'pdf';

    const resolvedUpdatedAt =
      doc.updatedAt ||
      doc.createdAt ||
      (typeof doc.version === 'object' ? doc.version?.createdAt : null) ||
      '';

    return {
      id: doc._id || doc.id,
      _id: doc._id || doc.id,
      name: typeof doc.name === 'string' ? doc.name : (doc.title || 'Untitled Document'),
      folder: resolvedFolder,
      scopeType: doc.scopeType || doc.category,
      scopeLabel: resolvedScopeLabel,
      version: resolvedVersion,
      fileType: resolvedFileType,
      updatedAt: resolvedUpdatedAt,
      raw: doc,
    };
  });

  const getCategoryCount = useCallback(
    (category) => {
      const counts = documentsData?.meta?.categoryCounts || {};
      if (category === 'all') return counts.total || totalCount;
      return counts[category] || 0;
    },
    [documentsData, totalCount]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ category: newValue });
    },
    [filters, table]
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      table.onResetPage();
      const resolvedValue =
        value && typeof value === 'object' && 'target' in value
          ? value.target.value
          : value;
      filters.setState({ [key]: resolvedValue });
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

  const handleEdit = useCallback(
    (doc) => {
      setSelectedDocument(doc?.raw || doc);
      openUploadModal.onTrue();
    },
    [openUploadModal]
  );

  const handleReplace = useCallback(
    (doc) => {
      setSelectedDocument(doc?.raw || doc);
      replaceModal.onTrue();
    },
    [replaceModal]
  );

  const handleDelete = useCallback(
    (doc) => {
      setSelectedDocument(doc?.raw || doc);
      deleteModal.onTrue();
    },
    [deleteModal]
  );

  const handleConfirmDelete = async () => {
    const docId = selectedDocument?._id || selectedDocument?.id;
    if (!docId) return;

    try {
      await deleteDocument({
        documentId: docId,
        organizationId,
      }).unwrap();
      deleteModal.onFalse();
      setSelectedDocument(null);
      toast.success('Document deleted successfully!');
    } catch (err) {
      console.error('Delete document failed:', err);
      toast.error(err?.data?.message || err?.message || 'Failed to delete document!');
    }
  };

  const uploadActions = (
    <Stack direction="row" spacing={1.5}>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => router.push(categoriesPath)}
        startIcon={<Iconify icon="solar:folder-with-files-bold" />}
      >
        Categories
      </Button>
      {canManageDocuments && (
        <Button
          variant="contained"
          color="primary"
          onClick={openUploadModal.onTrue}
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          Upload document
        </Button>
      )}
    </Stack>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Documents"
        links={[
          {
            name: 'Dashboard',
            href: isStaff ? paths.staff?.dashboard || '/staff/dashboard' : (ownerDashboard ? paths.owner.root : paths.siteManager.root),
          },
          { name: 'Documents' },
        ]}
        action={
          !isStaff ? (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              {isOwner && (
                <InfiniteAutocomplete
                  value={selectedBranch}
                  onChange={handleBranchChange}
                  useQuery={useGetBranchesQuery}
                  queryArgs={{ organizationId }}
                  mapOption={mapBranchOption}
                  extraOptions={EXTRA_BRANCH_OPTIONS}
                  label="Site"
                  placeholder="Search site..."
                  disabled={!organizationId}
                  size="small"
                  sx={{ minWidth: { xs: 1, sm: 260 } }}
                  textFieldProps={{
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Iconify
                            icon="solar:buildings-2-bold-duotone"
                            width={20}
                            sx={{ color: 'text.disabled' }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
              {uploadActions}
            </Stack>
          ) : null
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <StatusTabsFilterWrapper
          filterField={categoryFilterField}
          value={filters.state.category}
          onChange={handleFilterStatus}
          getCount={getCategoryCount}
        />

        <FlexibleTableToolbar
          filterFields={toolbarFilterFields}
          filterValues={filters.state}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        <Box sx={{ position: 'relative', width: 1, minWidth: 0 }}>
          <Scrollbar sx={{ width: 1 }}>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                numSelected={table.selected.length}
              />

              <TableBody>
                {isLoading || isFetching ? (
                  [...Array(table.rowsPerPage)].map((_, index) => (
                    <DocumentTableRowSkeleton
                      key={`document-skeleton-${index}`}
                      dense={table.dense}
                    />
                  ))
                ) : (
                  <>
                    {tableData.map((row, index) => (
                      <DocumentTableRow
                        key={row.id || row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        detailPath={`${pathname.replace(/\/$/, '')}/${row.id || row._id}`}
                        isStaff={isStaff || !canManageDocuments}
                        onEdit={canManageDocuments ? () => handleEdit(row) : undefined}
                        onReplace={canManageDocuments ? () => handleReplace(row) : undefined}
                        onDelete={canManageDocuments ? () => handleDelete(row) : undefined}
                      />
                    ))}

                    <TableNoData notFound={!isLoading && !isFetching && tableData.length === 0} />
                  </>
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

      <ConfirmDialog
        open={deleteModal.value}
        onClose={() => {
          deleteModal.onFalse();
          setSelectedDocument(null);
        }}
        title="Delete Document"
        content="Are you sure you want to delete this document? This action cannot be undone."
        action={
          <LoadingButton
            variant="contained"
            color="error"
            loading={isDeleting}
            onClick={handleConfirmDelete}
          >
            Delete
          </LoadingButton>
        }
      />

      <UploadDocumentModal
        open={openUploadModal.value}
        onClose={() => {
          openUploadModal.onFalse();
          setSelectedDocument(null);
        }}
        currentDocument={selectedDocument}
      />

      <ReplaceDocumentModal
        open={replaceModal.value}
        onClose={() => {
          replaceModal.onFalse();
          setSelectedDocument(null);
        }}
        currentDocument={selectedDocument}
      />
    </DashboardContent>
  );
}