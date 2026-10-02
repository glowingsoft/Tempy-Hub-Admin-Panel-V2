import { useMemo, useState } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { useSetState } from 'src/hooks/use-set-state';

import { _visitorFeedback } from './mocks/data';
import VisitorFeedbackTableRow from './visitor-feedback-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 56 },
  { id: 'visitor', label: 'Visitor / site', minWidth: 200 },
  { id: 'host', label: 'Host', minWidth: 140 },
  { id: 'duration', label: 'Duration', minWidth: 100 },
  { id: 'rating', label: 'Rating', minWidth: 130 },
  { id: 'comment', label: 'Comment', minWidth: 260 },
  { id: 'submitted', label: 'Submitted', minWidth: 110 },
];

const FILTER_FIELDS = [
  createFilterField.search({ placeholder: 'Search visitor...' }),
];

// ----------------------------------------------------------------------

export function VisitorFeedbackTable() {
  const table = useTable();

  const filters = useSetState({ name: '' });

  const filteredFeedback = useMemo(() => {
    const search = filters.state.name.trim().toLowerCase();

    if (!search) return _visitorFeedback;

    return _visitorFeedback.filter((item) => item.visitorName.toLowerCase().includes(search));
  }, [filters.state.name]);

  const handleSearchChange = (event) => {
    table.onResetPage();
    filters.setState({ name: event.target.value });
  };

  return (
    <Card>
      <FlexibleTableToolbar
        filterFields={FILTER_FIELDS}
        filterValues={filters.state}
        onFilterChange={(key, value) => filters.setState({ [key]: value })}
        onSearchChange={handleSearchChange}
      />

      <TableContainer sx={{ position: 'relative' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 880 }}>
            <TableHeadCustom headLabel={TABLE_HEAD} />

            <TableBody>
              {filteredFeedback.map((row, index) => (
                <VisitorFeedbackTableRow key={row.id} row={row} serialNumber={index + 1} />
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
  );
}
