import {
    Avatar,
    Box,
    Card,
    CardHeader,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TablePaginationCustom, TableNoData, TableSkeleton, useTable } from 'src/components/table';

// ----------------------------------------------------------------------

export function formatWorkedTime(minutes) {
    const total = Number(minutes) || 0;
    if (total === 0) return '0h';
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
}

const HEAD_LABELS = [
    { id: "sr#", label: "Sr#" },
    { id: "employee", label: "Employee" },
    { id: "department", label: "Department", minWidth: 160 },
    { id: "shiftsScheduled", label: "Scheduled", align: "center", minWidth: 100 },
    { id: "shiftsWorked", label: "Worked", align: "center", minWidth: 100 },
    { id: "variance", label: "Variance", align: "center", minWidth: 90 },
    { id: "lateCount", label: "Late count", align: "center", minWidth: 100 },
    { id: "workedHours", label: "Worked Hours", align: "center", minWidth: 120 },
];

export function ReportTable({
    data = [],
    title,
    icon,
    count,
    page,
    rowsPerPage,
    dense,
    onChangePage,
    onChangeRowsPerPage,
    onChangeDense,
    loading = false,
}) {
    const internalTable = useTable();

    const currentPage = page !== undefined ? page : internalTable.page;
    const currentRowsPerPage = rowsPerPage !== undefined ? rowsPerPage : internalTable.rowsPerPage;
    const currentDense = dense !== undefined ? dense : internalTable.dense;
    const currentCount = count !== undefined ? count : data.length;
    const handlePageChange = onChangePage || internalTable.onChangePage;
    const handleRowsPerPageChange = onChangeRowsPerPage || internalTable.onChangeRowsPerPage;
    const handleDenseChange = onChangeDense || internalTable.onChangeDense;

    return (
        <Card>
            <CardHeader title={title} avatar={<Iconify icon={icon} />} />

            <TableContainer sx={{ mt: 1 }}>
                <Scrollbar>
                    <Table size={currentDense ? 'small' : 'medium'}>
                        <TableHeadCustom headLabel={HEAD_LABELS} />

                        <TableBody>
                            {loading ? (
                                [...Array(currentRowsPerPage || 5)].map((_, i) => (
                                    <TableSkeleton key={i} sx={{ height: 60 }} />
                                ))
                            ) : (
                                data.map((row, index) => {
                                    const staff = row.staff || {};
                                    const staffName = staff.name || row.name || '—';
                                    const staffEmail = staff.email || row.email || '—';
                                    const staffImage = staff.photoUrl || row.image || '';
                                    const staffCode = staff.employeeCode || row.employeeCode || '';
                                    const departmentName = staff.department?.name || row.department || '—';
                                    const scheduled = row.scheduled ?? row.shiftsScheduled ?? 0;
                                    const worked = row.worked ?? row.shiftsWorked ?? 0;
                                    const variance = row.variance ?? (worked - scheduled);
                                    const lateCount = row.lateCount ?? 0;
                                    const workedMinutes = row.workedMinutes ?? (row.hours ? row.hours * 60 : 0);
                                    const serialNumber = currentPage * currentRowsPerPage + index + 1;

                                    return (
                                        <TableRow key={row._id || row.id || index} hover>
                                            <TableCell>{serialNumber}</TableCell>
                                            <TableCell>
                                                <Stack spacing={2} direction="row" alignItems="center">
                                                    <Avatar alt={staffName} src={staffImage}>
                                                        {staffName?.charAt(0)}
                                                    </Avatar>

                                                    <Stack
                                                        sx={{
                                                            typography: 'body2',
                                                            flex: '1 1 auto',
                                                            alignItems: 'flex-start',
                                                        }}
                                                    >
                                                        <Link
                                                            color="inherit"
                                                            sx={{ cursor: 'pointer', fontWeight: 600 }}
                                                        >
                                                            {staffName}
                                                        </Link>

                                                        <Box
                                                            sx={{
                                                                color: 'text.secondary',
                                                                typography: 'caption',
                                                            }}
                                                        >
                                                            {staffEmail}
                                                            {staffCode && ` • ${staffCode}`}
                                                        </Box>
                                                    </Stack>
                                                </Stack>
                                            </TableCell>

                                            <TableCell>
                                                {departmentName}
                                            </TableCell>

                                            <TableCell align="center">
                                                {scheduled}
                                            </TableCell>

                                            <TableCell align="center">
                                                {worked}
                                            </TableCell>

                                            <TableCell align="center">
                                                <Label color={variance < 0 ? 'error' : 'success'}>
                                                    {variance > 0 ? `+${variance}` : variance}
                                                </Label>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Label color={lateCount > 0 ? 'warning' : 'success'}>
                                                    {lateCount || 0}
                                                </Label>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {formatWorkedTime(workedMinutes)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}

                            <TableNoData notFound={!loading && data.length === 0} />
                        </TableBody>
                    </Table>
                </Scrollbar>
                <TablePaginationCustom
                    page={currentPage}
                    dense={currentDense}
                    count={currentCount}
                    rowsPerPage={currentRowsPerPage}
                    onPageChange={handlePageChange}
                    onChangeDense={handleDenseChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
            </TableContainer>
        </Card>
    );
}