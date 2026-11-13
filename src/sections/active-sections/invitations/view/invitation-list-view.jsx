// invitation-list-view.jsx

import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { usePathname, useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useDebounce } from 'src/hooks/use-debounce';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { getAssignedBranch } from 'src/sections/org-rollup/utils';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import {
    TableHeadCustom,
    TableNoData,
    TablePaginationCustom,
    useTable,
} from 'src/components/table';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { fDate } from 'src/utils/format-time';
import { getListStatusTabCount } from 'src/utils/table-utils';

import {
    useGetInvitationsQuery,
    useResendInvitationMutation,
    useRevokeInvitationMutation,
} from 'src/store/Reducer/invitations-api';
import { useOrganizationLookups, resolveBranchName } from 'src/hooks/use-organization-lookups';

import { INVITATION_STATUS_OPTIONS, getRoleLabel } from '../mocks/data';
import { InvitationTableRow } from '../invitation-table-row';
import InvitationLoadingSkeleton from '../invitation-loading-skeleton';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...INVITATION_STATUS_OPTIONS];

const TABLE_HEAD = [
    { id: 'sr#', label: 'Sr#', width: 60 },
    { id: 'name', label: 'Name', minWidth: 200 },
    { id: 'role', label: 'Role', minWidth: 140 },
    { id: 'site', label: 'Site', minWidth: 140 },
    { id: 'arrival', label: 'Date', minWidth: 140 },
    { id: 'status', label: 'Status', width: 130, align: 'center' },
    { id: 'actions', label: 'Actions', width: 100, align: 'center' },
];

const FILTER_FIELDS = [
    createFilterField.status({
        options: STATUS_OPTIONS,
        showCounts: true,
    }),

    createFilterField.search({
        placeholder: 'Search name or email...',
    }),
];

const DEFAULT_FILTERS = {
    status: 'all',
    search: '',
    name: '',
};

// ----------------------------------------------------------------------

export function InvitationListView() {
    const table = useTable({ defaultDense: true });
    const router = useRouter();
    const pathname = usePathname();
    const isSiteManager = pathname.startsWith(paths.siteManager.root);

    const { organizationId, user } = useCurrentOrganization();
    const { branchesMap, branches } = useOrganizationLookups({
        organizationId,
        branches: !isSiteManager,
        jobTitles: false,
        departments: false,
        members: false,
    });
    const assignedBranch = isSiteManager ? getAssignedBranch(user, organizationId) : null;

    const filters = useSetState(DEFAULT_FILTERS);
    const keyword = useDebounce(filters.state.name || filters.state.search || '', 500);

    const cancelInvitation = useBoolean();
    const resetInvitation = useBoolean();
    const [selectedInvitation, setSelectedInvitation] = useState(null);

    const statusFilterField = useMemo(() => FILTER_FIELDS.find((f) => f.type === 'status'), []);
    const toolbarFilterFields = useMemo(() => FILTER_FIELDS.filter((f) => f.type !== 'status'), []);

    // Live Invitations API query for active organization
    const {
        data: apiResponse,
        isLoading,
        isFetching,
        refetch,
    } = useGetInvitationsQuery(
        {
            organizationId,
            page: table.page + 1,
            limit: table.rowsPerPage,
            status: filters.state.status !== 'all' ? filters.state.status : undefined,
            keyword,
        },
        { skip: !organizationId }
    );

    const [resendInvitationMutation, { isLoading: isResending }] = useResendInvitationMutation();
    const [revokeInvitationMutation, { isLoading: isRevoking }] = useRevokeInvitationMutation();

    const rawInvitations = useMemo(() => apiResponse?.data ?? [], [apiResponse?.data]);
    const totalRecords = apiResponse?.meta?.totalRecords ?? rawInvitations.length;
    const statusCounts = apiResponse?.meta?.counts ?? {};

    const tableData = useMemo(
        () =>
            rawInvitations.map((invitation) => {
                // 1. Resolve site name
                let resolvedSite = '—';
                if (invitation.site && typeof invitation.site === 'object' && invitation.site.name) {
                    resolvedSite = invitation.site.name;
                } else if (invitation.branch && typeof invitation.branch === 'object' && invitation.branch.name) {
                    resolvedSite = invitation.branch.name;
                } else if (invitation.siteName) {
                    resolvedSite = invitation.siteName;
                } else if (invitation.branchName) {
                    resolvedSite = invitation.branchName;
                } else if (
                    typeof invitation.site === 'string' &&
                    invitation.site.trim() &&
                    !/^[0-9a-fA-F]{24}$/.test(invitation.site.trim())
                ) {
                    resolvedSite = invitation.site;
                } else if (
                    typeof invitation.branch === 'string' &&
                    invitation.branch.trim() &&
                    !/^[0-9a-fA-F]{24}$/.test(invitation.branch.trim())
                ) {
                    resolvedSite = invitation.branch;
                } else {
                    const possibleIds = [
                        invitation.branchId,
                        invitation.siteId,
                        typeof invitation.branch === 'string' ? invitation.branch : invitation.branch?._id,
                        typeof invitation.site === 'string' ? invitation.site : invitation.site?._id,
                    ]
                        .map((value) =>
                            typeof value === 'object' ? value?._id || value?.id : value
                        )
                        .filter(Boolean);

                    for (const id of possibleIds) {
                        if (branchesMap?.[id]?.name) {
                            resolvedSite = branchesMap[id].name;
                            break;
                        }
                    }

                    if (resolvedSite === '—' && Array.isArray(branches)) {
                        for (const id of possibleIds) {
                            const found = branches.find((b) => b._id === id || b.id === id);
                            if (found?.name) {
                                resolvedSite = found.name;
                                break;
                            }
                        }
                    }

                    if (resolvedSite === '—') {
                        const fallback = resolveBranchName(invitation, branchesMap);
                        if (fallback && fallback !== '—') {
                            resolvedSite = fallback;
                        }
                    }

                    if (resolvedSite === '—' && isSiteManager && assignedBranch?.name) {
                        if (possibleIds.includes(assignedBranch.id)) {
                            resolvedSite = assignedBranch.name;
                        }
                    } else if (
                        resolvedSite === '—' &&
                        (user?.branch?.name || (user?.branchId && branchesMap?.[user.branchId]?.name))
                    ) {
                        resolvedSite = user?.branch?.name || branchesMap?.[user.branchId]?.name;
                    }
                }

                // 2. Resolve role
                const rawRole = invitation.role || invitation.host || '';
                const resolvedRole = getRoleLabel(rawRole);

                // 3. Resolve visitor/name
                const visitorName = invitation.name || invitation.visitorName || '—';
                const visitorEmail = invitation.email || invitation.visitorEmail || '—';

                return {
                    id: invitation._id || invitation.id,
                    _id: invitation._id || invitation.id,
                    name: visitorName,
                    email: visitorEmail,
                    visitorName,
                    visitorEmail,
                    role: resolvedRole,
                    host: resolvedRole,
                    site: resolvedSite,
                    badgeType: resolvedSite,
                    arrivalTime: invitation.startDate
                        ? fDate(invitation.startDate)
                        : (invitation.arrivalTime || (invitation.createdAt ? fDate(invitation.createdAt) : '—')),
                    visitingUntil: invitation.visitingUntil || (invitation.expiresAt ? fDate(invitation.expiresAt) : '—'),
                    instructions: invitation.instructions || '',
                    additionalRecipients: invitation.additionalRecipients || '',
                    expressCheckIn: invitation.expressCheckIn || false,
                    status: invitation.status || 'pending',
                    raw: invitation,
                };
            }),
        [rawInvitations, branchesMap, branches, user, isSiteManager, assignedBranch]
    );

    const getStatusCount = useCallback(
        (status) => getListStatusTabCount(statusCounts, status, totalRecords),
        [statusCounts, totalRecords]
    );

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
        (eventOrValue) => {
            table.onResetPage();
            const val = typeof eventOrValue === 'string' ? eventOrValue : eventOrValue?.target?.value || '';
            filters.setState({ name: val, search: val });
        },
        [filters, table]
    );

    const handleResendInvite = useCallback((row) => {
        setSelectedInvitation(row);
        resetInvitation.onTrue();
    }, [resetInvitation]);

    const handleConfirmResend = useCallback(async () => {
        if (!selectedInvitation) return;
        try {
            await resendInvitationMutation({
                invitationId: selectedInvitation._id || selectedInvitation.id,
                organizationId,
            }).unwrap();
            toast.success('Invitation resent successfully!');
            resetInvitation.onFalse();
            refetch();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to resend invitation.');
        }
    }, [selectedInvitation, resendInvitationMutation, organizationId, resetInvitation, refetch]);

    const handleCancelInvite = useCallback((row) => {
        setSelectedInvitation(row);
        cancelInvitation.onTrue();
    }, [cancelInvitation]);

    const handleConfirmCancel = useCallback(async () => {
        if (!selectedInvitation) return;
        try {
            await revokeInvitationMutation({
                invitationId: selectedInvitation._id || selectedInvitation.id,
                organizationId,
            }).unwrap();
            toast.success('Invitation revoked successfully!');
            cancelInvitation.onFalse();
            refetch();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to revoke invitation.');
        }
    }, [selectedInvitation, revokeInvitationMutation, organizationId, cancelInvitation, refetch]);

    const newInvitationPath = paths.siteManager.invitations?.new || paths.siteManager.invitaions?.new || '/site-manager/invitations/new';
    const invitationsRootPath = paths.siteManager.invitations?.root || paths.siteManager.invitaions?.root || '/site-manager/invitations';

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Invitation list"
                links={[
                    { name: 'Dashboard', href: paths.siteManager.root },
                    { name: 'Invitations', href: invitationsRootPath },
                    { name: 'List' },
                ]}
                action={
                    <Stack direction={{ md: 'row', xs: 'column' }} spacing={1.5}>
                        <Button
                            variant="contained"
                            onClick={() => router.push(newInvitationPath)}
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
                                    <TableNoData notFound={!isLoading && !tableData.length} />
                                )}
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </Box>

                <ConfirmDialog
                    open={resetInvitation.value}
                    onClose={resetInvitation.onFalse}
                    title="Resend Invitation"
                    content={`Are you sure you want to resend this invitation${selectedInvitation?.email || selectedInvitation?.visitorEmail ? ` to ${selectedInvitation.email || selectedInvitation.visitorEmail}` : ''}?`}
                    action={
                        <Button variant="contained" color="success" onClick={handleConfirmResend} disabled={isResending}>
                            Resend
                        </Button>
                    }
                />
                <ConfirmDialog
                    open={cancelInvitation.value}
                    onClose={cancelInvitation.onFalse}
                    title="Cancel Invitation"
                    content="Are you sure you want to cancel / revoke this invitation?"
                    action={
                        <Button variant="contained" color="error" onClick={handleConfirmCancel} disabled={isRevoking}>
                            Cancel
                        </Button>
                    }
                />

                <TablePaginationCustom
                    page={table.page}
                    dense={table.dense}
                    count={totalRecords}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    onChangeDense={table.onChangeDense}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                />
            </Card>
        </DashboardContent>
    );
}