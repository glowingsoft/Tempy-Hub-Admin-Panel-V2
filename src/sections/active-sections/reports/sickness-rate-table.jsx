import { useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

const HEAD_LABELS = [
    { id: 'sr#', label: 'Sr#', width: 60 },
    { id: 'employee', label: 'Employee', minWidth: 220 },
    { id: 'department', label: 'Department', minWidth: 160 },
    { id: 'sickDays', label: 'Sick days', align: 'center' },
    { id: 'leaveType', label: 'Leave type', align: 'center' },
    { id: 'action', label: 'Action / Detail', align: 'center', width: 120 },
];

const LEAVE_TYPE_COLOR = { SSP: 'warning', SMP: 'info', Unpaid: 'default' };

export function SicknessRateTable({ data }) {
    const table = useTable();

    const paginatedRows = data.slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
    );

    return (
        <Card>
            <TableContainer sx={{ mt: 1 }}>
                <Scrollbar>
                    <Table>
                        <TableHeadCustom headLabel={HEAD_LABELS} />

                        <TableBody>
                            {paginatedRows.map((row, index) => (
                                <SicknessRow
                                    key={row.id}
                                    row={row}
                                    serialNumber={table.page * table.rowsPerPage + index + 1}
                                />
                            ))}

                            <TableNoData notFound={!paginatedRows.length} title="No sickness records found" />
                        </TableBody>
                    </Table>
                </Scrollbar>

                <TablePaginationCustom
                    page={table.page}
                    dense={table.dense}
                    count={data.length}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    onChangeDense={table.onChangeDense}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                />
            </TableContainer>
        </Card>
    );
}

// ----------------------------------------------------------------------

function SicknessRow({ row, serialNumber }) {
    const [expanded, setExpanded] = useState(false);
    const dates = row.dates || [];

    return (
        <>
            <TableRow hover>
                <TableCell>{serialNumber}</TableCell>

                <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar alt={row.name} src={row.image}>
                            {row.name?.charAt(0)}
                        </Avatar>
                        <Stack sx={{ typography: 'body2', minWidth: 0 }}>
                            <Box sx={{ fontWeight: 600 }}>{row.name || '—'}</Box>
                            <Box sx={{ color: 'text.secondary', typography: 'caption' }}>{row.email || '—'}</Box>
                        </Stack>
                    </Stack>
                </TableCell>

                <TableCell>{row.department || '—'}</TableCell>

                <TableCell align="center">{row.sickDays}</TableCell>

                <TableCell align="center">
                    <Label variant="soft" color={LEAVE_TYPE_COLOR[row.leaveType] || 'default'}>
                        {row.leaveType || '—'}
                    </Label>
                </TableCell>

                <TableCell align="center">
                    {!!dates.length && (
                        <IconButton size="small" onClick={() => setExpanded((prev) => !prev)}>
                            <Iconify icon={expanded ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />
                        </IconButton>
                    )}
                </TableCell>
            </TableRow>

            {!!dates.length && (
                <TableRow>
                    <TableCell colSpan={HEAD_LABELS.length} sx={{ py: 0, borderBottom: expanded ? undefined : 'none' }}>
                        <Collapse in={expanded} unmountOnExit>
                            <Stack spacing={1} sx={{ py: 2, pl: 7, pr: 2 }}>
                                {dates.map((entry) => (
                                    <Stack key={entry.date} direction="row" spacing={2} alignItems="center">
                                        <Typography variant="body2" sx={{ minWidth: 110, fontWeight: 600 }}>
                                            {fDate(entry.date)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {entry.reason}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}
