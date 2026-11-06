import { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import {
    Avatar,
    Box,
    Card,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
} from '@mui/material';

import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import {
    TableHeadCustom,
    TablePaginationCustom,
    TableSkeleton,
    TableNoData,
} from 'src/components/table';
import { TableInfo } from 'src/sections/user/attendance-table';

// ----------------------------------------------------------------------

const USER_TYPE_OPTIONS = [
    { value: 'all', label: 'All', color: 'default' },
    { value: 'visitor', label: 'Visitor' },
    { value: 'contractor', label: 'Contractor' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'All', color: 'default' },
    { value: 'onSite', label: 'On Site', color: 'success' },
    { value: 'checkedOut', label: 'Checked Out', color: 'default' },
    { value: 'awaitingApproval', label: 'Awaiting', color: 'warning' },
    { value: 'denied', label: 'Denied', color: 'error' },
];

const HEAD_LABELS = [
    { id: 'sr#', label: 'Sr#', width: 70 },
    { id: 'name', label: 'Name', minWidth: 220 },
    { id: 'type', label: 'Type', minWidth: 120 },
    { id: 'checkIn', label: 'In', align: 'center', minWidth: 130 },
    { id: 'method', label: 'Method', minWidth: 130 },
    { id: 'reasonForVisit', label: 'Reason for Visit', minWidth: 200 },
    { id: 'status', label: 'Status', align: 'center', minWidth: 130 },
];

export function formatMethod(method) {
    if (!method) return '—';
    const map = {
        walkIn: 'Walk-in',
        kiosk: 'Kiosk',
        phone: 'Phone',
        qr: 'QR Code',
        manual: 'Manual',
        nfc: 'NFC',
    };
    return map[method] || method;
}

export function getStatusBadge(status) {
    switch (status) {
        case 'onSite':
        case 'inBuilding':
            return { label: 'On site', color: 'success' };
        case 'checkedOut':
            return { label: 'Checked out', color: 'default' };
        case 'awaitingApproval':
        case 'awaiting':
            return { label: 'Awaiting', color: 'warning' };
        case 'denied':
            return { label: 'Denied', color: 'error' };
        case 'late':
            return { label: 'Late', color: 'warning' };
        default:
            return { label: status || '—', color: 'default' };
    }
}

// ----------------------------------------------------------------------

export function VisitorCheckInTable({
    data = [],
    meta = {},
    loading = false,
    table,
    filters,
    onFilterChange,
}) {
    const statusFilterField = useMemo(
        () =>
            createFilterField.status({
                options: STATUS_OPTIONS,
                showCounts: true,
            }),
        []
    );

    const toolbarFilterFields = useMemo(
        () => [
            createFilterField.search({
                key: 'search',
                placeholder: 'Search ...',
            }),
            createFilterField.select({
                key: 'userType',
                label: 'User Type',
                options: USER_TYPE_OPTIONS,
                defaultValue: 'all',
            }),
        ],
        []
    );

    const getStatusCount = useCallback(
        (statusValue) => {
            if (statusValue === 'all') {
                return meta?.totalRecords || 0;
            }
            return meta?.counts?.[statusValue] || 0;
        },
        [meta]
    );

    const handleStatusTabChange = useCallback(
        (fieldKey, newValue) => {
            table?.onResetPage?.();
            onFilterChange?.('status', newValue);
        },
        [table, onFilterChange]
    );

    const handleToolbarFilterChange = useCallback(
        (fieldKey, newValue) => {
            table?.onResetPage?.();
            onFilterChange?.(fieldKey, newValue);
        },
        [table, onFilterChange]
    );

    const handleSearchChange = useCallback(
        (e) => {
            table?.onResetPage?.();
            onFilterChange?.('search', e.target.value);
        },
        [table, onFilterChange]
    );

    const totalRecords = meta?.totalRecords ?? data.length;

    return (
        <Card>
            <StatusTabsFilterWrapper
                filterField={statusFilterField}
                value={filters?.status || 'all'}
                onChange={handleStatusTabChange}
                getCount={getStatusCount}
            />

            <FlexibleTableToolbar
                filterFields={toolbarFilterFields}
                filterValues={filters || {}}
                onFilterChange={handleToolbarFilterChange}
                onSearchChange={handleSearchChange}
            />

            <TableContainer sx={{ mt: 1 }}>
                <Scrollbar>
                    <Table size={table?.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                        <TableHeadCustom headLabel={HEAD_LABELS} />

                        <TableBody>
                            {loading ? (
                                <TableSkeleton rowCount={table?.rowsPerPage || 10} cellCount={HEAD_LABELS.length} />
                            ) : data.length === 0 ? (
                                <TableNoData notFound={true} />
                            ) : (
                                data.map((row, index) => {
                                    const badge = getStatusBadge(row.status);
                                    const checkInTime = row.checkInAt || row.arrivedAt;
                                    const person = row.person || {};
                                    const displayName = person.name || row.hostName || 'Walk-in Visitor';
                                    const displayType =
                                        row.personType === 'contractor' || person.type === 'contractor'
                                            ? 'Contractor'
                                            : 'Visitor';

                                    return (
                                        <TableRow key={row._id || row.id || index} hover>
                                            <TableCell>
                                                {(table?.page || 0) * (table?.rowsPerPage || 10) + index + 1}
                                            </TableCell>

                                            {/* Name */}
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <Avatar
                                                        alt={displayName}
                                                        src={person.photoUrl || ''}
                                                        sx={{ width: 36, height: 36 }}
                                                    >
                                                        {displayName.charAt(0).toUpperCase()}
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
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {displayName}
                                                        </Link>

                                                        {person.email ? (
                                                            <Box
                                                                sx={{
                                                                    color: 'text.secondary',
                                                                    typography: 'caption',
                                                                }}
                                                            >
                                                                {person.email}
                                                            </Box>
                                                        ) : person.phone ? (
                                                            <Box
                                                                sx={{
                                                                    color: 'text.secondary',
                                                                    typography: 'caption',
                                                                }}
                                                            >
                                                                {person.phone}
                                                            </Box>
                                                        ) : null}

                                                        {person.carRegistration ? (
                                                            <Box
                                                                sx={{
                                                                    color: 'text.disabled',
                                                                    typography: 'caption',
                                                                    fontSize: '11px',
                                                                }}
                                                            >
                                                                Reg: {person.carRegistration}
                                                            </Box>
                                                        ) : null}
                                                    </Stack>
                                                </Stack>
                                            </TableCell>

                                            {/* Type */}
                                            <TableCell>{displayType}</TableCell>

                                            {/* Check In */}
                                            <TableCell align="center">
                                                {checkInTime ? (
                                                    <TableInfo
                                                        icon="famicons:log-in"
                                                        color="success"
                                                        value={dayjs(checkInTime).format('h:mm a')}
                                                    />
                                                ) : (
                                                    '—'
                                                )}
                                            </TableCell>

                                            {/* Method */}
                                            <TableCell>{formatMethod(row.method)}</TableCell>

                                            {/* Reason for Visit */}
                                            <TableCell>{row.purposeOfVisit || row.reasonForVisit || '—'}</TableCell>

                                            {/* Status */}
                                            <TableCell align="center">
                                                <Label variant="soft" color={badge.color}>
                                                    {badge.label}
                                                </Label>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
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

VisitorCheckInTable.propTypes = {
    data: PropTypes.array,
    filters: PropTypes.object,
    loading: PropTypes.bool,
    meta: PropTypes.object,
    onFilterChange: PropTypes.func,
    table: PropTypes.object,
};
