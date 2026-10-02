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
} from '@mui/material';
import { useCallback, useMemo } from 'react';
import { VISITOR_STATUS_OPTIONS } from 'src/_mock';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import {
    TableHeadCustom,
    TablePaginationCustom,
    useTable,
} from 'src/components/table';
import { useSetState } from 'src/hooks/use-set-state';
import { TableInfo } from 'src/sections/user/attendance-table';
import { UserTableFiltersResult } from 'src/sections/user/user-table-filters-result';
import { fTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------
const USER_TYPE_OPTION = [
    { value: 'all', label: 'All', color: 'default' },
    { value: 'visitor', label: 'Visitor' },
    { value: 'contractor', label: 'Contractor' },
]

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...VISITOR_STATUS_OPTIONS];

const HEAD_LABELS = [
    { id: "sr#", label: "Sr#" },
    { id: 'name', label: 'Name' },
    { id: 'type', label: 'Type' },
    { id: 'checkIn', label: 'In', align: "center" },
    { id: 'method', label: 'Method' },
    { id: 'reasonForVisit', label: 'Reason for Visit', minWidth: 160 },
    { id: 'handoverNotes', label: 'Handover Notes', minWidth: 220 },
    { id: 'status', label: 'Status', align: "center" },
];

const FILTER_FIELDS = [
    createFilterField.status({
        options: STATUS_OPTIONS,
        showCounts: true,
    }),

    createFilterField.search({
        placeholder: 'Search ...',
    }),
    createFilterField.select({
        key: 'userType',
        label: 'User Type',
        options: USER_TYPE_OPTION,
        defaultValue: 'all',
    }),


];

// ----------------------------------------------------------------------

export function VisitorCheckInTable({ data, title = 'Visitor Check In' }) {

    const table = useTable();

    const filters = useSetState({ name: '', status: 'all' });


    const apiUsers = data || [];

    // const meta = data?.meta||{};
    const meta = {};

    const statusFilterField = useMemo(
        () => FILTER_FIELDS.find((f) => f.type === 'status'),
        []
    );

    // Get toolbar filter fields (exclude status as it's in tabs)
    const toolbarFilterFields = useMemo(
        () => FILTER_FIELDS.filter((f) => f.type !== 'status'),
        []
    );
    const getStatusCount = useCallback((status) => {
        const statusCounts = meta?.usersCount || {};
        if (status === 'all') {
            return statusCounts.total || 0;
        }


        return statusCounts[status] || 0;
    },
        [meta]
    );


    const canReset = !!filters.state.name || filters.state.status !== 'all';

    const handleFilterChange = () => {

    }

    const handleSearchChange = () => {

    }

    return (
        <Card>
            {/* {title && <CardHeader title={title} />} */}

            <StatusTabsFilterWrapper
                filterField={statusFilterField}
                value={filters.state.status}
                onChange={handleFilterChange}
                getCount={getStatusCount}
            />


            {/* Toolbar with Search */}
            <FlexibleTableToolbar
                filterFields={toolbarFilterFields}
                filterValues={filters.state}
                onFilterChange={handleFilterChange}
                onSearchChange={handleSearchChange}
            />

            {canReset && (
                <UserTableFiltersResult
                    filters={filters}
                    totalResults={meta?.totalRecords || 0}
                    onResetPage={table.onResetPage}
                    sx={{ p: 2.5, pt: 0 }}
                />
            )}

            <TableContainer sx={{ mt: 1 }}>
                <Scrollbar>
                    <Table>
                        <TableHeadCustom headLabel={HEAD_LABELS} />

                        <TableBody>
                            {data.map((row, index) => (
                                <TableRow key={row.id} hover>

                                    <TableCell>{index + 1}</TableCell>
                                    {/* Name */}
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Avatar
                                                alt={row.name}
                                                src={row.image}
                                                sx={{ width: 36, height: 36 }}
                                            >
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
                                                    sx={{
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {row.name || '—'}
                                                </Link>

                                                {row.email && (
                                                    <Box
                                                        sx={{
                                                            color: 'text.secondary',
                                                            typography: 'caption',
                                                        }}
                                                    >
                                                        {row.email}
                                                    </Box>
                                                )}
                                            </Stack>
                                        </Stack>
                                    </TableCell>

                                    {/* Type */}
                                    <TableCell>
                                        {row.type || '—'}
                                    </TableCell>

                                    {/* Check In */}
                                    <TableCell>
                                        {/* {row.checkIn || '—'} */}
                                        {row.checkIn ?
                                            <TableInfo
                                                icon="famicons:log-in"
                                                color="success"
                                                value={fTime(new Date())}
                                            /> : '—'}
                                    </TableCell>

                                    {/* Method */}
                                    <TableCell>
                                        {row.method || '—'}
                                    </TableCell>

                                    {/* Reason for Visit */}
                                    <TableCell>
                                        {row.reasonForVisit || '—'}
                                    </TableCell>

                                    {/* Handover Notes */}
                                    <TableCell>
                                        {row.handoverNotes || '—'}
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell align="center">
                                        <Label
                                            variant="soft"
                                            color={
                                                row.status === 'On site'
                                                    ? 'success'
                                                    : row.status === 'Awaiting'
                                                        ? 'warning'
                                                        : row.status === 'Late'
                                                            ? 'warning'
                                                            : row.status === "In building" ? "success" : "default"
                                            }
                                        >
                                            {row.status || '—'}
                                        </Label>
                                    </TableCell>
                                </TableRow>
                            ))}
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