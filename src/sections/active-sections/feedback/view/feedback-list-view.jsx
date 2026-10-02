import { useCallback, useMemo, useState } from 'react';

import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useTabs } from 'src/hooks/use-tabs';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { UserTableFiltersResult } from 'src/sections/user/user-table-filters-result';
import VisitorSurveySettings from 'src/sections/active-sections/configuration/visitor-survey-settings';
import {
  DEFAULT_VISITOR_SURVEY_SETTINGS,
  saveMockVisitorSurveySettings,
} from 'src/sections/active-sections/configuration/mocks/data';
import { VisitorFeedbackTable } from 'src/sections/active-sections/visitor-feedback/visitor-feedback-table';

import { _clientFeedback, FEEDBACK_STATUS_OPTIONS, respondToMockFeedback } from '../mocks/data';
import FeedbackTableRow from '../feedback-table-row';
import RespondFeedbackDialog from '../respond-feedback-dialog';

const FEEDBACK_TABS_OPTIONS = [
  { value: 'feedback', label: 'Feedback', icon: 'solar:chat-round-dots-bold' },
  { value: 'visitorFeedback', label: 'Visitor Feedback', icon: 'solar:user-speak-bold' },
  { value: 'notificationSettings', label: 'Notification Settings', icon: 'solar:bell-bold' },
];

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 56 },
  { id: 'resident', label: 'Resident / submitted by', minWidth: 220 },
  { id: 'category', label: 'Category', minWidth: 130 },
  { id: 'message', label: 'Message', minWidth: 260 },
  { id: 'submitted', label: 'Submitted', minWidth: 110 },
  { id: 'status', label: 'Status', width: 150, align: 'center' },
  { id: 'actions', label: 'Actions', width: 90, align: 'center' },
];

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...FEEDBACK_STATUS_OPTIONS];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search resident...' }),
];

// ----------------------------------------------------------------------

function FeedbackListView() {
  const table = useTable();

  const tabs = useTabs('feedback');

  const respondModal = useBoolean();

  const filters = useSetState({ name: '', status: 'all' });

  const [selectedRow, setSelectedRow] = useState(null);

  const [visitorSurveySettings, setVisitorSurveySettings] = useState(DEFAULT_VISITOR_SURVEY_SETTINGS);

  const handleSaveVisitorSurveySettings = (next) => {
    setVisitorSurveySettings(saveMockVisitorSurveySettings(next));
  };

  // Local copy so the dialog's "resolve" mutation re-renders this list —
  // the mock data module itself is mutated by respondToMockFeedback.
  const [reloadKey, setReloadKey] = useState(0);

  const handleOpenRespond = (row) => {
    setSelectedRow(row);
    respondModal.onTrue();
  };

  const handleSaveResponse = (response) => {
    respondToMockFeedback(selectedRow.id, response);
    setReloadKey((key) => key + 1);
    respondModal.onFalse();
    setSelectedRow(null);
  };

  const statusFilterField = useMemo(() => FILTER_FIELDS.find((f) => f.type === 'status'), []);

  const toolbarFilterFields = useMemo(() => FILTER_FIELDS.filter((f) => f.type !== 'status'), []);

  const filteredFeedback = useMemo(() => {
    const search = filters.state.name.trim().toLowerCase();

    return _clientFeedback.filter((item) => {
      const matchesStatus = filters.state.status === 'all' || item.status === filters.state.status;
      const matchesSearch = !search || item.residentName.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.state.status, filters.state.name, reloadKey]);

  const getStatusCount = useCallback(
    (status) =>
      status === 'all'
        ? _clientFeedback.length
        : _clientFeedback.filter((item) => item.status === status).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reloadKey]
  );

  const canReset = !!filters.state.name || filters.state.status !== 'all';

  const handleFilterChange = useCallback(
    (key, value) => {
      table.onResetPage();
      filters.setState({ [key]: value });
    },
    [filters, table]
  );

  const handleSearchChange = useCallback(
    (event) => {
      table.onResetPage();
      filters.setState({ name: event.target.value });
    },
    [filters, table]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Client Feedback"
        links={[
          { name: 'Dashboard', href: paths.lineManager.root },
          { name: 'Client Feedback' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <CustomTabs
        value={tabs.value}
        onChange={tabs.onChange}
        sx={{
          mb: 2,
          borderRadius: 1,
          width: 'fit-content',
          maxWidth: '100%',
        }}
      >
        {FEEDBACK_TABS_OPTIONS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            icon={<Iconify icon={tab.icon} width={18} />}
            iconPosition="start"
          />
        ))}
      </CustomTabs>

      {tabs.value === 'feedback' && (
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
              totalResults={filteredFeedback.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 880 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {filteredFeedback.map((row, index) => (
                    <FeedbackTableRow
                      key={row.id}
                      serialNumber={index + 1}
                      row={row}
                      onRespond={() => handleOpenRespond(row)}
                    />
                  ))}

                  <TableNoData notFound={!filteredFeedback.length} />
                </TableBody>
              </Table>
            </Scrollbar>

            <TablePaginationCustom
              page={table.page}
              count={filteredFeedback.length}
              dense={table.dense}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              onChangeDense={table.onChangeDense}
            />
          </TableContainer>
        </Card>
      )}

      {tabs.value === 'visitorFeedback' && <VisitorFeedbackTable />}

      {tabs.value === 'notificationSettings' && (
        <VisitorSurveySettings
          settings={visitorSurveySettings}
          onSave={handleSaveVisitorSurveySettings}
        />
      )}

      <RespondFeedbackDialog
        open={respondModal.value}
        row={selectedRow}
        onClose={() => {
          respondModal.onFalse();
          setSelectedRow(null);
        }}
        onSave={handleSaveResponse}
      />
    </DashboardContent>
  );
}

export default FeedbackListView;
