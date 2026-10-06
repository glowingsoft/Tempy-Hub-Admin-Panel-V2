import { useCallback, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/config-global';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { UserTableFiltersResult } from 'src/sections/user/user-table-filters-result';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';

import { mockGazettesData, SAMPLE_GAZETTE_PDF } from '../mocks/data';
import { GazetteTableRow } from '../gazette-table-row';
import { GazettePreviewDialog } from '../gazette-preview-dialog';
import { GazetteMessageFamilyDialog } from '../gazette-message-family-dialog';
import { GazetteInviteFamilyDialog } from '../gazette-invite-family-dialog';
import { FamilyWallPostDialog } from 'src/sections/family-engagement/family-wall-post-dialog';

// ----------------------------------------------------------------------

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 60 },
  { id: 'resident', label: 'Resident', width: '22%', minWidth: 200 },
  { id: 'room', label: 'Room', align: 'center', width: '13%', minWidth: 110 },
  { id: 'family', label: 'Family', align: 'center', width: '13%', minWidth: 110 },
  { id: 'messages', label: 'Messages', align: 'center', width: '13%', minWidth: 110 },
  { id: 'status', label: 'Status', align: 'center', width: '15%', minWidth: 140 },
  { id: 'actions', label: 'Actions', align: 'center', width: '24%', minWidth: 220 },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ready', label: 'Ready to print' },
  { value: 'no_content', label: 'No content' },
  { value: 'over_limit', label: 'Over 30 messages' },
  { value: 'printed', label: 'Printed' },
  { value: 'no_family', label: 'No family linked' },
];

const FILTER_FIELDS = [
  createFilterField.status({
    options: STATUS_OPTIONS,
    showCounts: true,
  }),
  createFilterField.search({
    placeholder: 'Search resident, room, or status...',
  }),
];

// ----------------------------------------------------------------------

export function GazettesView() {
  const table = useTable();
  const familyPaths = useFamilyEngagementPaths();

  const [tableData, setTableData] = useState(mockGazettesData.residents);
  const [activeResident, setActiveResident] = useState(mockGazettesData.residents[0]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  // Filters using project's useSetState (matches Uploaded Photos)
  const filters = useSetState({ name: '', status: 'all' });

  // Dialog Controls
  const previewDialog = useBoolean();
  const messageFamilyDialog = useBoolean();
  const inviteFamilyDialog = useBoolean();
  const wallPostDialog = useBoolean();
  const [targetResident, setTargetResident] = useState(null);

  // Contextual breadcrumb links based on role
  const breadcrumbLinks = [
    { name: 'Dashboard', href: familyPaths.dashboardRoot },
    { name: 'Family Engagement', href: familyPaths.familyOverview },
    { name: 'Gazettes' },
  ];

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((f) => f.type === 'status'),
    []
  );

  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((f) => f.type !== 'status'),
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
      if (status === 'all') return tableData.length;
      if (status === 'ready') {
        return tableData.filter((item) => item.status === 'ready' || item.status === 'printed').length;
      }
      return tableData.filter((item) => item.status === status).length;
    },
    [tableData]
  );

  // Counts for main dashboard cards
  const summaryCounts = useMemo(() => {
    const ready = tableData.filter((r) => r.status === 'ready' || r.status === 'printed').length;
    const noContent = tableData.filter((r) => r.status === 'no_content').length;
    const needReview = tableData.filter((r) => r.status === 'over_limit' || r.status === 'no_family').length;
    return {
      all: tableData.length,
      ready,
      noContent,
      needReview,
    };
  }, [tableData]);

  // Filtered rows matching search & status tabs
  const filteredRows = useMemo(() => {
    const search = filters.state.name.trim().toLowerCase();
    const status = filters.state.status;

    return tableData.filter((row) => {
      const matchesSearch =
        !search ||
        row.resident?.toLowerCase().includes(search) ||
        row.room?.toString().includes(search) ||
        row.statusLabel?.toLowerCase().includes(search);

      let matchesStatus = true;
      if (status === 'all') {
        matchesStatus = true;
      } else if (status === 'ready') {
        matchesStatus = row.status === 'ready' || row.status === 'printed';
      } else if (status === 'need_review') {
        matchesStatus = row.status === 'over_limit' || row.status === 'no_family';
      } else {
        matchesStatus = row.status === status;
      }

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

  // Row Selection & Actions
  const handleSelectRow = useCallback((row) => {
    setActiveResident(row);
  }, []);

  const handleOpenPreview = useCallback((row) => {
    setActiveResident(row);
    setTargetResident(row);
    previewDialog.onTrue();
  }, [previewDialog]);

  const handleRegenerate = useCallback((row) => {
    toast.info(`Regenerating gazette for ${row.resident}...`);
    setTimeout(() => {
      setTableData((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: 'ready', statusLabel: 'Ready' } : r))
      );
      toast.success(`Gazette regenerated successfully for ${row.resident}`);
    }, 1000);
  }, []);

  const handlePdfDownload = useCallback((row) => {
    const pdfUrl = row.pdfUrl || SAMPLE_GAZETTE_PDF;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${row.resident.replace(/\s+/g, '_')}_Gazette_Issue_14.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${row.resident} - Gazette Issue 14 PDF`);
  }, []);

  const handleMessageFamily = useCallback((row) => {
    setTargetResident(row);
    messageFamilyDialog.onTrue();
  }, [messageFamilyDialog]);

  const handleAddWallPost = useCallback((row) => {
    setTargetResident(row);
    wallPostDialog.onTrue();
  }, [wallPostDialog]);

  const handleInviteFamily = useCallback((row) => {
    setTargetResident(row);
    inviteFamilyDialog.onTrue();
  }, [inviteFamilyDialog]);

  const handleGenerateAll = useCallback(() => {
    setIsGeneratingAll(true);
    toast.info('Generating all gazettes from approved content...');
    setTimeout(() => {
      setIsGeneratingAll(false);
      setTableData((prev) =>
        prev.map((r) =>
          r.status === 'ready' || r.status === 'over_limit'
            ? { ...r, status: 'ready', statusLabel: 'Ready' }
            : r
        )
      );
      toast.success('All gazettes generated and formatted for Issue 14!');
    }, 1400);
  }, []);

  const handleDownloadAllPDFs = useCallback(() => {
    const link = document.createElement('a');
    link.href = SAMPLE_GAZETTE_PDF;
    link.download = 'Florence_House_Issue_14_Gazettes_Bundle.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloading Florence House Gazettes bundle...');
  }, []);

  const handleMarkPrinted = useCallback(() => {
    setTableData((prev) =>
      prev.map((r) => (r.status === 'ready' ? { ...r, status: 'printed', statusLabel: 'Printed' } : r))
    );
    toast.success('Marked ready gazettes as Printed');
  }, []);

  return (
    <>
      <Helmet>
        <title>{`Gazettes | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent>
        {/* Breadcrumbs & Header with Actions */}
        <CustomBreadcrumbs
          heading="Gazettes"
          links={breadcrumbLinks}
          action={
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateAll}
                disabled={isGeneratingAll}
                startIcon={
                  isGeneratingAll ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Iconify icon="solar:magic-stick-3-bold" />
                  )
                }
                sx={{ fontWeight: 700 }}
              >
                Generate all
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleDownloadAllPDFs}
                startIcon={<Iconify icon="solar:file-download-bold" />}
                sx={{ fontWeight: 600, bgcolor: 'background.paper' }}
              >
                Download all PDFs
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleMarkPrinted}
                startIcon={<Iconify icon="solar:printer-check-bold" />}
                sx={{ fontWeight: 600, bgcolor: 'background.paper' }}
              >
                Mark printed
              </Button>
            </Stack>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* Main Dashboard Cards (Data display only - non-clickable) */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Card 1: Residents in this issue */}
          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="Residents in this issue"
              total={summaryCounts.all}
              color="primary"
              icon={icon('ic-users')}
              sx={{
                border: (t) => `1px solid ${t.palette.divider}`,
                cursor: 'default',
                userSelect: 'none',
              }}
            />
          </Grid>

          {/* Card 2: Ready to print */}
          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="Ready to print"
              total={summaryCounts.ready}
              color="success"
              icon={icon('ic-check')}
              sx={{
                border: (t) => `1px solid ${t.palette.divider}`,
                cursor: 'default',
                userSelect: 'none',
              }}
            />
          </Grid>

          {/* Card 3: No content */}
          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="No content"
              total={summaryCounts.noContent}
              color="warning"
              icon={icon('ic-file')}
              sx={{
                border: (t) => `1px solid ${t.palette.divider}`,
                cursor: 'default',
                userSelect: 'none',
              }}
            />
          </Grid>

          {/* Card 4: Need review */}
          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="Need review"
              total={summaryCounts.needReview}
              color="error"
              icon={icon('ic-analytics')}
              sx={{
                border: (t) => `1px solid ${t.palette.divider}`,
                cursor: 'default',
                userSelect: 'none',
              }}
            />
          </Grid>
        </Grid>

        {/* Table in Card - Identical to Uploaded Photos (photo-approval-list-view.jsx) */}
        <Card sx={{ mb: 4 }}>
          {/* Status Tabs Filter */}
          <StatusTabsFilterWrapper
            filterField={statusFilterField}
            value={filters.state.status}
            onChange={handleFilterChange}
            getCount={getStatusCount}
          />

          {/* Flexible Toolbar with Search */}
          <FlexibleTableToolbar
            filterFields={toolbarFilterFields}
            filterValues={filters.state}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
          />

          {/* Filters Result Bar */}
          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              totalResults={filteredRows.length}
              onResetPage={handleResetFilters}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          {/* Table Container */}
          <TableContainer>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {dataInPage.map((row, index) => (
                    <GazetteTableRow
                      key={row.id}
                      row={row}
                      serialNumber={table.page * table.rowsPerPage + index + 1}
                      isSelected={activeResident?.id === row.id}
                      onSelectRow={handleSelectRow}
                      onPreview={handleOpenPreview}
                      onRegenerate={handleRegenerate}
                      onPdf={handlePdfDownload}
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
      </DashboardContent>

      {/* Modals & Dialogs */}
      <GazettePreviewDialog
        open={previewDialog.value}
        onClose={previewDialog.onFalse}
        resident={targetResident || activeResident}
      />

      <GazetteMessageFamilyDialog
        open={messageFamilyDialog.value}
        onClose={messageFamilyDialog.onFalse}
        resident={targetResident}
      />

      <GazetteInviteFamilyDialog
        open={inviteFamilyDialog.value}
        onClose={inviteFamilyDialog.onFalse}
        resident={targetResident}
        onInvited={(id) => {
          setTableData((prev) =>
            prev.map((r) => (r.id === id ? { ...r, family: 1, status: 'no_content', statusLabel: 'No content' } : r))
          );
        }}
      />

      <FamilyWallPostDialog
        open={wallPostDialog.value}
        onClose={wallPostDialog.onFalse}
        onCreated={() => {
          toast.success(`Wall post published for ${targetResident?.resident}`);
        }}
      />
    </>
  );
}

export default GazettesView;
