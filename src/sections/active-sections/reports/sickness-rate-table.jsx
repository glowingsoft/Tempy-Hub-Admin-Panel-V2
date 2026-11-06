import { useState } from 'react';
import PropTypes from 'prop-types';

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
import { TableHeadCustom, TableNoData, TablePaginationCustom, TableSkeleton } from 'src/components/table';
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

const LEAVE_TYPE_COLOR = {
    SSP: 'warning',
    SMP: 'info',
    Unpaid: 'default',
    sick: 'warning',
    maternity: 'info',
    unpaid: 'default',
};

// ----------------------------------------------------------------------

export function SicknessRateTable({
    data = [],
    loading = false,
    table,
    totalRecords = 0,
}) {
    return (
        <Card>
            <TableContainer sx={{ mt: 1 }}>
                <Scrollbar>
                    <Table size={table?.dense ? 'small' : 'medium'}>
                        <TableHeadCustom headLabel={HEAD_LABELS} />

                        <TableBody>
                            {loading ? (
                                <TableSkeleton
                                    rowCount={table?.rowsPerPage || 10}
                                    cellCount={HEAD_LABELS.length}
                                />
                            ) : data.length === 0 ? (
                                <TableNoData notFound={true} title="No sickness records found" />
                            ) : (
                                data.map((row, index) => (
                                    <SicknessRow
                                        key={row._id || row.id || index}
                                        row={row}
                                        serialNumber={
                                            (table?.page || 0) * (table?.rowsPerPage || 10) + index + 1
                                        }
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Scrollbar>

                <TablePaginationCustom
                    page={table?.page || 0}
                    dense={table?.dense}
                    count={totalRecords}
                    rowsPerPage={table?.rowsPerPage || 10}
                    onPageChange={table?.onChangePage}
                    onChangeDense={table?.onChangeDense}
                    onRowsPerPageChange={table?.onChangeRowsPerPage}
                />
            </TableContainer>
        </Card>
    );
}

SicknessRateTable.propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool,
    table: PropTypes.object,
    totalRecords: PropTypes.number,
};

// ----------------------------------------------------------------------

function SicknessRow({ row, serialNumber }) {
    const [expanded, setExpanded] = useState(false);

    const staff = row.staff || {};
    const displayName = staff.name || row.name || '—';
    const displayEmail = staff.email || row.email || '—';
    const photoUrl = staff.photoUrl || row.image || '';
    const departmentName = staff.department?.name || row.department || '—';
    const leaveLabel = row.leaveTypeLabel || row.leaveType || '—';
    const days = row.days || row.dates || [];

    const badgeColor =
        LEAVE_TYPE_COLOR[leaveLabel] ||
        LEAVE_TYPE_COLOR[row.leaveType] ||
        'default';

    return (
        <>
            <TableRow hover>
                <TableCell>{serialNumber}</TableCell>

                <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar alt={displayName} src={photoUrl}>
                            {displayName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Stack sx={{ typography: 'body2', minWidth: 0 }}>
                            <Box sx={{ fontWeight: 600 }}>{displayName}</Box>
                            <Box sx={{ color: 'text.secondary', typography: 'caption' }}>
                                {displayEmail}
                            </Box>
                        </Stack>
                    </Stack>
                </TableCell>

                <TableCell>{departmentName}</TableCell>

                <TableCell align="center">{row.sickDays ?? 0}</TableCell>

                <TableCell align="center">
                    <Label variant="soft" color={badgeColor}>
                        {leaveLabel}
                    </Label>
                </TableCell>

                <TableCell align="center">
                    {!!days.length && (
                        <IconButton size="small" onClick={() => setExpanded((prev) => !prev)}>
                            <Iconify icon={expanded ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />
                        </IconButton>
                    )}
                </TableCell>
            </TableRow>

            {!!days.length && (
                <TableRow>
                    <TableCell
                        colSpan={HEAD_LABELS.length}
                        sx={{ py: 0, borderBottom: expanded ? undefined : 'none' }}
                    >
                        <Collapse in={expanded} unmountOnExit>
                            <Stack spacing={1} sx={{ py: 2, pl: 7, pr: 2 }}>
                                {days.map((entry, idx) => (
                                    <Stack
                                        key={entry.date || idx}
                                        direction="row"
                                        spacing={2}
                                        alignItems="center"
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{ minWidth: 110, fontWeight: 600 }}
                                        >
                                            {fDate(entry.date)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {entry.reason || '—'}
                                        </Typography>
                                        {entry.leaveTypeLabel && (
                                            <Label variant="soft" color={LEAVE_TYPE_COLOR[entry.leaveTypeLabel] || 'default'}>
                                                {entry.leaveTypeLabel}
                                            </Label>
                                        )}
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

SicknessRow.propTypes = {
    row: PropTypes.object.isRequired,
    serialNumber: PropTypes.number.isRequired,
};
