import { useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';

import { getAcknowledgementRecords } from '../mocks/data';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: 'acknowledged', label: 'Acknowledged' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' },
];

const TABLE_HEAD = [
    { id: 'number', label: '#', width: 64 },
    { id: 'staff', label: 'Staff member', minWidth: 220 },
    { id: 'role', label: 'Role', minWidth: 160 },
    { id: 'assignedAt', label: 'Assigned date', minWidth: 145 },
    { id: 'respondedAt', label: 'Response date', minWidth: 145 },
    { id: 'status', label: 'Status', minWidth: 130, align: 'center' },
];

const STATUS_META = {
    acknowledged: { label: 'Acknowledged', color: 'success' },
    pending: { label: 'Pending', color: 'warning' },
    overdue: { label: 'Overdue', color: 'error' },
};

export function AcknowledgementStaffTable({ documentId }) {
    const table = useTable();
    const records = getAcknowledgementRecords(documentId);
    const [filters, setFilters] = useState({ search: '', status: 'all', role: 'all' });

    const filterFields = [
        createFilterField.search({ key: 'search', placeholder: 'Search staff...' }),
        createFilterField.select({ key: 'status', label: 'Status', options: STATUS_OPTIONS }),
        createFilterField.select({
            key: 'role',
            label: 'Role',
            options: [
                { value: 'all', label: 'All roles' },
                ...Array.from(new Set(records.map((record) => record.role)), (role) => ({
                    value: role,
                    label: role,
                })),
            ],
        }),
    ];

    const query = filters.search.trim().toLowerCase();
    const filteredRecords = records.filter((record) =>
        `${record.name} ${record.role} ${record.department}`.toLowerCase().includes(query) &&
        (filters.status === 'all' || record.status === filters.status) &&
        (filters.role === 'all' || record.role === filters.role)
    );

    const handleFilterChange = (key, value) => {
        setFilters((current) => ({ ...current, [key]: value }));
        table.onResetPage();
    };

    const pageRecords = filteredRecords.slice(
        table.page * table.rowsPerPage,
        (table.page + 1) * table.rowsPerPage
    );

    return (
        <Card>
            <FlexibleTableToolbar
                filterFields={filterFields}
                filterValues={filters}
                onFilterChange={handleFilterChange}
            />

            <Box sx={{ position: 'relative' }}>
                <Scrollbar>
                    <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 900 }}>
                        <TableHeadCustom headLabel={TABLE_HEAD} />
                        <TableBody>
                            {pageRecords.map((record, index) => {
                                const status = STATUS_META[record.status];

                                return (
                                    <TableRow key={record.id} hover>
                                        <TableCell sx={{ color: 'text.secondary', typography: 'body2' }}>
                                            {table.page * table.rowsPerPage + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar src={record.image} alt={record.name} sx={{ width: 40, height: 40 }} />
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>{record.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{record.department}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{record.role}</TableCell>
                                        <TableCell>{record.assignedAt}</TableCell>
                                        <TableCell>{record.respondedAt || '—'}</TableCell>
                                        <TableCell align="center">
                                            <Label color={status.color} variant="soft">{status.label}</Label>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            <TableNoData notFound={!filteredRecords.length} title="No staff match these filters" />
                        </TableBody>
                    </Table>
                </Scrollbar>
            </Box>

            <TablePaginationCustom
                page={table.page}
                dense={table.dense}
                count={filteredRecords.length}
                rowsPerPage={table.rowsPerPage}
                onPageChange={table.onChangePage}
                onChangeDense={table.onChangeDense}
                onRowsPerPageChange={table.onChangeRowsPerPage}
            />
        </Card>
    );
}