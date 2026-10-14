// document-list-view.jsx
import { useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';


import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { usePathname } from 'src/routes/hooks';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { DashboardContent } from 'src/layouts/dashboard';

import { mockDocuments, FOLDER_OPTIONS, getAllDocuments } from '../mocks/data';
import UploadDocumentModal from '../upload-document-modal';
import BulkUploadDocumentModal from '../bulk-upload-document-modal';
import { DocumentTableRow } from '../document-table-row';
import { paths } from 'src/routes/paths';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';

// ----------------------------------------------------------------------

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'fire_safety', label: 'Fire & safety' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'personal_hr', label: 'Personal / HR' },
];

// Client feedback: documents need to be groupable into folders — a plain
// filter dropdown, same convention as the existing Scope filter, rather than
// a new folder-tree UI. The dense table view stays exactly as-is.
const FOLDER_FILTER_OPTIONS = [{ value: 'all', label: 'All folders' }, ...FOLDER_OPTIONS];

const TABLE_HEAD = [
  { id: "sr#", label: "Sr#", width: 60 },
  { id: 'documentName', label: 'Document' },
  { id: 'folder', label: 'Folder' },
  { id: 'scope', label: 'Scope' },
  { id: 'version', label: 'Version', align: "center" },
  { id: 'updatedAt', label: 'Updated At', align: "center" },
  { id: 'actions', label: 'Actions', align: 'center' },
];


const FILTER_FIELDS = [

  createFilterField.search({
    placeholder: 'Search documents...',
  }),
  createFilterField.select({
    key: 'scope',
    label: 'Scope',
    options: CATEGORY_OPTIONS,
    defaultValue: 'all',
  }),
  createFilterField.select({
    key: 'folder',
    label: 'Folder',
    options: FOLDER_FILTER_OPTIONS,
    defaultValue: 'all',
  }),
];

const DEFAULT_FILTERS = FILTER_FIELDS.reduce((acc, field) => {
  acc[field.key] = field.defaultValue;
  return acc;
}, {});

// ----------------------------------------------------------------------

export function DocumentListView({ ownerDashboard = false }) {
  const table = useTable();
  const pathname = usePathname();
  const { branchId, onBranchChange } = useOwnerBranchFilter();

  const filters = useSetState({ name: '', category: 'all', actionType: 'all', folder: 'all' });

  const openUploadModal = useBoolean();

  const openBulkUploadModal = useBoolean();

  const deleteModal = useBoolean();

  const keyword = useDebounce(filters.state.name, 500);

  const isLoading = false;

  const apiDocuments = getAllDocuments();

  const meta = {};

  const categoryFilterField = useMemo(
    () => FILTER_FIELDS.find((f) => f.type === 'status'),
    []
  );

  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((f) => f.type !== 'status'),
    []
  );

  // Folder filter — client feedback: documents need to be groupable into
  // folders. Filtered here client-side, same as every other mock listing.
  const folderFilteredDocuments = useMemo(
    () => apiDocuments.filter((doc) => filters.state.folder === 'all' || doc.folder === filters.state.folder),
    [apiDocuments, filters.state.folder]
  );

  const tableData = folderFilteredDocuments.map((doc) => ({
    id: doc._id,
    name: doc.name,
    folder: doc.folder,
    scopeType: doc.scopeType,
    scopeLabel: doc.scopeLabel,
    version: doc.version,
    updatedAt: doc.updatedAt,
  }));

  const tableDataInPage = useMemo(
    () => tableData.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage),
    [table.page, table.rowsPerPage, tableData]
  );

  const getCategoryCount = useCallback(
    (category) => {
      const counts = meta?.categoryCounts || {};
      if (category === 'all') return counts.total || tableData.length;
      return counts[category] || 0;
    },
    [meta, tableData.length]
  );

  const canReset = !!filters.state.name || filters.state.category !== 'all';

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
      filters.setState({ [key]: value });
    },
    [filters, table]
  );
  const handleSearchChange = () => { };

  const handleView = useCallback((doc) => {
    console.info('view', doc);
  }, []);

  const handleReplace = useCallback((doc) => {
    console.info('replace', doc);
  }, []);

  const handleDelete = useCallback((doc) => {
    console.info('delete', doc);
    deleteModal.onTrue();
  }, []);

  // Client feedback: management needs the option to upload one document or
  // several at once — same primary-action row, just a second button.
  const uploadActions = (
    <Stack direction="row" spacing={1.5}>
      <Button
        variant="outlined"
        onClick={openBulkUploadModal.onTrue}
        startIcon={<Iconify icon="solar:upload-square-bold" />}
      >
        Bulk upload
      </Button>
      <Button
        variant="contained"
        onClick={openUploadModal.onTrue}
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        Upload document
      </Button>
    </Stack>
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Documents"
        links={[
          {
            name: 'Dashboard',
            href: ownerDashboard ? paths.owner.root : paths.siteManager.root,
          },
          { name: 'Documents' },
        ]}
        action={
          ownerDashboard ? (
            <OwnerBranchFilterActions value={branchId} onChange={onBranchChange}>
              {uploadActions}
            </OwnerBranchFilterActions>
          ) : (
            uploadActions
          )
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

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} >
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                numSelected={table.selected.length}
              />

              <TableBody>
                {tableDataInPage.length > 0 ? (
                  tableDataInPage.map((row, index) => (
                    <DocumentTableRow
                      key={row.id || row._id}
                      row={row}
                      serialNumber={table.page * table.rowsPerPage + index + 1}
                      detailPath={`${pathname.replace(/\/$/, '')}/${row.id || row._id}`}
                      onReplace={() => handleReplace(row)}
                    />
                  ))
                ) : (
                  <TableNoData notFound />
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={meta?.totalRecords || tableData.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <ConfirmDialog
        open={deleteModal.value}
        onClose={deleteModal.onFalse}
        title="Delete Document"
        content="Are you sure want to delete this document?"
        action={
          <Button variant="contained" color="error" onClick={deleteModal.onTrue}>
            Delete
          </Button>
        }
      />

      <UploadDocumentModal open={openUploadModal.value} onClose={openUploadModal.onFalse} />

      <BulkUploadDocumentModal open={openBulkUploadModal.value} onClose={openBulkUploadModal.onFalse} />
    </DashboardContent>
  );
}