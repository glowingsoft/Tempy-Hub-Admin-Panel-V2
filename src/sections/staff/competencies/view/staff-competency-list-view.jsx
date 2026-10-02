import { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { useDebounce } from 'src/hooks/use-debounce';
import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';

import { getCompetencyStatus, competencyStatusOptions, staffCompetencies } from '../mocks/data';
import { StaffCompetencyDialog } from './staff-competency-dialog';
import { StaffCompetencyTableRow } from './staff-competency-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'title', label: 'Title', minWidth: 200 },
  { id: 'providerAssessor', label: 'Assessor / Provider', minWidth: 180 },
  { id: 'expiryDate', label: 'Expiry Date', width: 140 },
  { id: 'status', label: 'Status', width: 130, align: 'center' },
  { id: 'action', label: 'Evidence', width: 170, align: 'center' },
];

const STATUS_FILTER_FIELD = createFilterField.status({
  options: [{ value: 'all', label: 'All' }, ...competencyStatusOptions],
  showCounts: true,
});

const SEARCH_FILTER_FIELD = createFilterField.search({ placeholder: 'Search competencies...' });

// ----------------------------------------------------------------------

export function StaffCompetencyListView() {
  const table = useTable();
  const [competencies, setCompetencies] = useState(staffCompetencies);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState(null);

  const keyword = useDebounce(search, 400);

  const rows = useMemo(
    () =>
      competencies.map((competency) => ({
        ...competency,
        status: getCompetencyStatus(competency),
      })),
    [competencies]
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesStatus = status === 'all' || row.status === status;
        const matchesSearch =
          !keyword || row.title.toLowerCase().includes(keyword.trim().toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [keyword, rows, status]
  );

  const getStatusCount = useCallback(
    (value) => (value === 'all' ? rows.length : rows.filter((row) => row.status === value).length),
    [rows]
  );

  const handleOpenEvidenceDialog = useCallback((competency) => {
    setSelectedCompetency({
      ...competency,
      completedDate: dayjs(competency.completedDate),
      nextDueDate: dayjs(competency.nextDueDate),
    });
    setDialogOpen(true);
  }, []);

  const handleSaveEvidence = useCallback((updatedRecord) => {
    const record = {
      ...updatedRecord,
      completedDate: dayjs(updatedRecord.completedDate).toISOString(),
      nextDueDate: dayjs(updatedRecord.nextDueDate).toISOString(),
    };
    setCompetencies((current) =>
      current.map((item) => (item._id === record._id ? record : item))
    );
  }, []);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    table.onResetPage();
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="My Competencies"
        links={[{ name: 'Dashboard', href: paths.staff.dashboard }, { name: 'My Competencies' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <StatusTabsFilterWrapper
          filterField={STATUS_FILTER_FIELD}
          value={status}
          onChange={(_, value) => setStatus(value)}
          getCount={getStatusCount}
        />

        <FlexibleTableToolbar
          filterFields={[SEARCH_FILTER_FIELD]}
          filterValues={{ search }}
          onFilterChange={() => {}}
          onSearchChange={handleSearchChange}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {filteredRows
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row, index) => (
                    <StaffCompetencyTableRow
                      key={row._id}
                      row={row}
                      status={row.status}
                      serialNumber={table.page * table.rowsPerPage + index + 1}
                      onUploadEvidence={handleOpenEvidenceDialog}
                    />
                  ))}

                <TableNoData notFound={!filteredRows.length} title="No competencies found" />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

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

      <StaffCompetencyDialog
        open={dialogOpen}
        competency={selectedCompetency}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveEvidence}
      />
    </DashboardContent>
  );
}
