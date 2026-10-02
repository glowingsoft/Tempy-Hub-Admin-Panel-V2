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
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TablePaginationCustom, useTable } from 'src/components/table';

// ----------------------------------------------------------------------
const HEAD_LABELS = [
    { id: "sr#", label: "Sr#" },
    { id: "employee", label: "Employee" },
    { id: "department", label: "Department", minWidth: 160 },
    { id: "shiftsScheduled", label: "Scheduled", align: "center", minWidth: 110 },
    { id: "shiftsWorked", label: "Worked", align: "center", minWidth: 110 },
    { id: "variance", label: "Variance", align: "center" },
    { id: "lateCount", label: "Late count", align: "center" },
]
export function ReportTable({ data, title, icon }) {

    const table = useTable();

    return (
        <Card>
            <CardHeader title={title} avatar={<Iconify icon={icon} />} />

            <TableContainer sx={{ mt: 1 }}>
                <Scrollbar>
                    <Table>
                        <TableHeadCustom headLabel={HEAD_LABELS} />

                        <TableBody>
                            {data.map((row, index) => {
                                const variance = row.shiftsWorked - row.shiftsScheduled;

                                return (
                                    <TableRow key={row.id} hover>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                        <Stack spacing={2} direction="row" alignItems="center">
                                            <Avatar alt={row.name} src={row.image}>
                                                {row.name?.charAt(0)}
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
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    {row.name || '—'}
                                                </Link>

                                                <Box
                                                    sx={{
                                                        color: 'text.secondary',
                                                        typography: 'caption',
                                                    }}
                                                >
                                                    {row.email || '—'}
                                                </Box>
                                            </Stack>
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        {row.department || '—'}
                                    </TableCell>

                                    <TableCell align="center">
                                        {row.shiftsScheduled}
                                    </TableCell>

                                    <TableCell align="center">
                                        {row.shiftsWorked}
                                    </TableCell>

                                    <TableCell align="center">
                                        <Label color={variance < 0 ? 'error' : 'success'}>
                                            {variance > 0 ? `+${variance}` : variance}
                                        </Label>
                                    </TableCell>

                                    <TableCell align="center">
                                        <Label color={row.lateCount > 0 ? 'warning' : 'success'}>{row.lateCount || 0}</Label>
                                    </TableCell>
                                    </TableRow>
                                );
                            })}
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