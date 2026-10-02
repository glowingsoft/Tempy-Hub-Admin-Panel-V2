// invitation-list-view.jsx

import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useDebounce } from 'src/hooks/use-debounce';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
    TableHeadCustom,
    TableNoData,
    TablePaginationCustom,
    useTable,
} from 'src/components/table';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';

import { mockInvitations, INVITATION_STATUS_OPTIONS, BADGE_TYPE_OPTIONS } from '../mocks/data';
import { InvitationTableRow } from '../invitation-table-row';
import InvitationLoadingSkeleton from '../invitation-loading-skeleton';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...INVITATION_STATUS_OPTIONS];

const TABLE_HEAD = [
    { id: 'sr#', label: 'Sr#', width: 60 },
    { id: 'visitor', label: 'Visitor', minWidth: 220 },
    { id: 'host', label: 'Host', minWidth: 180 },
    { id: 'badgeType', label: 'Badge type', minWidth: 140 },
    { id: 'arrival', label: 'Arrival', minWidth: 140 },
    { id: 'status', label: 'Status', width: 130, align: 'center' },
    { id: 'actions', label: 'Actions', width: 100, align: 'center' },
];

const FILTER_FIELDS = [
    createFilterField.status({
        options: STATUS_OPTIONS,
        showCounts: true,
    }),

    createFilterField.search({
        placeholder: 'Search visitor or host...',
    }),

    createFilterField.select({
        key: 'badgeType',
        label: 'Badge type',
        options: [{ value: 'all', label: 'All' }, ...BADGE_TYPE_OPTIONS],
        defaultValue: 'all',
    }),
];

const DEFAULT_FILTERS = FILTER_FIELDS.reduce((acc, field) => {
    acc[field.key] = field.defaultValue;
    return acc;
}, {});

// ----------------------------------------------------------------------

export function InvitationListView() {
    const table = useTable();

    const router = useRouter();

    const filters = useSetState(DEFAULT_FILTERS);

    const keyword = useDebounce(filters.state.name, 500);

    const cancelInvitation=useBoolean();

    const resetInvitation=useBoolean();

    const isLoading = false;

    const isFetching = false;

    const statusFilterField = useMemo(() => FILTER_FIELDS.find((f) => f.type === 'status'), []);

    const toolbarFilterFields = useMemo(() => FILTER_FIELDS.filter((f) => f.type !== 'status'), []);

    // const { data, isLoading, isFetching } = useGetInvitationsQuery({
    //   page: table.page + 1,
    //   limit: table.rowsPerPage,
    //   keyword,
    //   status: filters.state.status !== 'all' ? filters.state.status : undefined,
    //   badgeType: filters.state.badgeType !== 'all' ? filters.state.badgeType : undefined,
    // });

    const apiInvitations = mockInvitations || [];

    const meta = {};

    const tableData = apiInvitations.map((invitation) => ({
        id: invitation.id,
        visitorName: invitation.visitorName,
        visitorEmail: invitation.visitorEmail,
        host: invitation.host,
        badgeType: invitation.badgeType,
        arrivalTime: invitation.arrivalTime,
        visitingUntil: invitation.visitingUntil,
        instructions: invitation.instructions,
        additionalRecipients: invitation.additionalRecipients,
        expressCheckIn: invitation.expressCheckIn,
        status: invitation.status || 'pending',
    }));

    const getStatusCount = useCallback(
        (status) => {
            if (status === 'all') return apiInvitations.length;
            return apiInvitations.filter((row) => row.status === status).length;
        },
        [apiInvitations]
    );

    const canReset =
        !!filters.state.name || filters.state.status !== 'all' || filters.state.badgeType !== 'all';

    const handleFilterStatus = useCallback(
        (event, newValue) => {
            table.onResetPage();
            filters.setState({ status: newValue });
        },
        [filters, table]
    );

    const handleFilterChange = useCallback(
        (key, value) => {
            table.onResetPage();
            filters.setState({ [key]: value });
        },
        [filters, table]
    );

    const handleSearchChange = useCallback(
        (value) => {
            table.onResetPage();
            filters.setState({ name: value });
        },
        [filters, table]
    );

    const handleResendInvite = useCallback((row) => {
        // TODO: wire up to resend-invitation mutation
        resetInvitation.onTrue();
    }, []);

    const handleCancelInvite = useCallback((row) => {
        // TODO: wire up to cancel-invitation mutation
        cancelInvitation.onTrue();
    }, []);

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Invitation list"
                links={[
                    { name: 'Dashboard', href: paths.siteManager.root },
                    { name: 'Invitations', href: paths.siteManager.invitaions.root },
                    { name: 'List' },
                ]}
                action={
                    <Stack direction={{ md: 'row', xs: 'column' }} spacing={1.5}>
                        <Button
                            variant="outlined"
                            startIcon={<Iconify icon="solar:export-bold" />}
                            onClick={() => { }}
                        >
                            Export to CSV
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => router.push(paths.siteManager.invitaions.new)}
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            New invitation
                        </Button>
                    </Stack>
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Card>
                <StatusTabsFilterWrapper
                    filterField={statusFilterField}
                    value={filters.state.status}
                    onChange={handleFilterStatus}
                    getCount={getStatusCount}
                />

                <FlexibleTableToolbar
                    filterFields={toolbarFilterFields}
                    filterValues={filters.state}
                    onFilterChange={handleFilterChange}
                    onSearchChange={handleSearchChange}
                />

                <Box sx={{ position: 'relative' }}>
                    <Scrollbar>
                        <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 860 }}>
                            <TableHeadCustom
                                order={table.order}
                                orderBy={table.orderBy}
                                headLabel={TABLE_HEAD}
                                numSelected={table.selected.length}
                            />

                            <TableBody>
                                {isLoading || isFetching ? (
                                    <InvitationLoadingSkeleton />
                                ) : tableData?.length > 0 ? (
                                    tableData.map((row, index) => (
                                        <InvitationTableRow
                                            key={row.id}
                                            row={row}
                                            serialNumber={index + 1 + table.page * table.rowsPerPage}
                                            selected={table.selected.includes(row.id)}
                                            onResend={() => handleResendInvite(row)}
                                            onCancel={() => handleCancelInvite(row)}
                                        />
                                    ))
                                ) : (
                                    <TableNoData notFound />
                                )}
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </Box>

                <ConfirmDialog
                    open={resetInvitation.value}
                    onClose={resetInvitation.onFalse}
                    title="Resend Invitation"
                    content="Are you sure you want to resend this invitation?"
                    action={
                        <Button variant="contained" color="success" onClick={resetInvitation.onFalse}>
                            Resend
                        </Button>
                    }
                />
                <ConfirmDialog
                    open={cancelInvitation.value}
                    onClose={cancelInvitation.onFalse}
                    title="Cancel Invitation"
                    content="Are you sure you want to cancel this invitation?"
                    action={
                        <Button variant="contained" color="error" onClick={cancelInvitation.onFalse}>
                            Cancel
                        </Button>
                    }
                />

                <TablePaginationCustom
                    page={table.page}
                    dense={table.dense}
                    count={meta?.totalRecords || tableData.length}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    onChangeDense={table.onChangeDense}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                />
            </Card>
        </DashboardContent>
    );
}