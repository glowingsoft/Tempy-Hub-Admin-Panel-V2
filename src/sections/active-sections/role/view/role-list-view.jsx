import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Stack from '@mui/material/Stack';

import { paths } from 'src/routes/paths';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

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

import { RoleTableRow } from '../role-table-row';
import QuickAddRoleModal from '../quick-add-role-modal';
import { MOCK_ROLES } from '../mocks/data';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'approved', label: 'Approved', color: 'success' },
    { value: 'rejected', label: 'Rejected', color: 'error' },
];

const TABLE_HEAD = [
    { id: 'sr#', label: 'Sr#', width: 60 },
    { id: 'name', label: 'Role Name', minWidth: 220 },
    { id: 'description', label: 'Description', minWidth: 200 },
    { id: 'permissions', label: 'Permissions', minWidth: 180 },
    { id: 'createdAt', label: 'Created At', minWidth: 140 },
    { id: 'status', label: 'Status', width: 130, align: 'center' },
    { id: 'actions', label: 'Actions', width: 120, align: 'center' },
];

const FILTER_FIELDS = [
    createFilterField.status({
        options: STATUS_OPTIONS,
        showCounts: true,
    }),

    createFilterField.search({
        placeholder: 'Search roles...',
    }),
];

const DEFAULT_FILTERS = FILTER_FIELDS.reduce((acc, field) => {
    acc[field.key] = field.defaultValue;

    return acc;
}, {});

function RoleListView() {
    const table = useTable();

    const filters = useSetState({ ...DEFAULT_FILTERS });

    const [currentRole, setCurrentRole] = useState(null);

    const openRoleModal = useBoolean();

    const openApprovalModal = useBoolean();

    const openRejectModal = useBoolean();

    const statusFilterField = useMemo(
        () => FILTER_FIELDS.find((field) => field.type === 'status'),
        []
    );

    const toolbarFilterFields = useMemo(
        () => FILTER_FIELDS.filter((field) => field.type !== 'status'),
        []
    );

    // ----------------------------------------------------------------------
    // Filter data
    // ----------------------------------------------------------------------

    const filteredRoles = useMemo(() => {
        let data = [...MOCK_ROLES];

        return data;
    }, [filters.state]);

    // ----------------------------------------------------------------------
    // Status counts
    // ----------------------------------------------------------------------

    const getStatusCount = useCallback(
        (status) => {
            if (status === 'all') {
                return MOCK_ROLES.length;
            }

            return MOCK_ROLES.filter(
                (role) => role.status === status
            ).length;
        },
        []
    );

    // ----------------------------------------------------------------------
    // Handlers
    // ----------------------------------------------------------------------

    const handleAddRole = useCallback(() => {
        setCurrentRole(null);
        openRoleModal.onTrue();
    }, [openRoleModal]);

    const handleEditRole = useCallback(
        (role) => {
            setCurrentRole(role);
            openRoleModal.onTrue();
        },
        [openRoleModal]
    );

    const handleApproval = useCallback((role) => {
        console.log("role", role);
        setCurrentRole(role);
        openApprovalModal.onTrue();
    },
        [openApprovalModal]
    );

    const handleReject = useCallback((role) => {
        setCurrentRole(role);
        openRejectModal.onTrue();
    },
        [openRejectModal]
    );

    const handleCloseRoleModal = useCallback(() => {
        openRoleModal.onFalse();
        setCurrentRole(null);
    }, [openRoleModal]);

    const handleCloseApprovalModal = useCallback(() => {
        openApprovalModal.onFalse();
        setCurrentRole(null);
    }, [openApprovalModal]);

    const handleCloseRejectModal = useCallback(() => {
        openRejectModal.onFalse();
        setCurrentRole(null);
    }, [openRejectModal]);


    const handleFilterStatus = useCallback(
        (event, newValue) => {
            table.onResetPage();

            filters.setState({
                status: newValue,
            });
        },
        [filters, table]
    );

    const handleFilterChange = useCallback((key, value) => {
        table.onResetPage();

        filters.setState({
            [key]: value,
        });
    },
        [filters, table]
    );

    const handleSearchChange = useCallback(
        (value) => {
            table.onResetPage();

            filters.setState({
                name: value,
            });
        },
        [filters, table]
    );

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Roles"
                links={[
                    {
                        name: 'Dashboard',
                        href: paths.siteManager.root,
                    },
                    {
                        name: 'Roles',
                    },
                ]}
                action={
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1.5}
                    >
                        <Button
                            variant="outlined"
                            startIcon={
                                <Iconify icon="solar:export-bold" />
                            }
                            onClick={() => { }}
                        >
                            Export to CSV
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleAddRole}
                            startIcon={
                                <Iconify icon="mingcute:add-line" />
                            }
                        >
                            Add Role
                        </Button>
                    </Stack>
                }
                sx={{
                    mb: { xs: 3, md: 5 },
                }}
            />

            <Card>
                {/* Status tabs */}

                <StatusTabsFilterWrapper
                    filterField={statusFilterField}
                    value={filters.state.status}
                    onChange={handleFilterStatus}
                    getCount={getStatusCount}
                />

                {/* Filters */}

                <FlexibleTableToolbar
                    filterFields={toolbarFilterFields}
                    filterValues={filters.state}
                    onFilterChange={handleFilterChange}
                    onSearchChange={handleSearchChange}
                />


                <Box sx={{ position: 'relative' }}>
                    <Scrollbar>
                        <Table
                            size={table.dense ? 'small' : 'medium'}
                            sx={{
                                minWidth: 1200,
                            }}
                        >
                            <TableHeadCustom
                                order={table.order}
                                orderBy={table.orderBy}
                                headLabel={TABLE_HEAD}
                                numSelected={table.selected.length}
                            />

                            <TableBody>
                                {filteredRoles.length > 0 ? (
                                    filteredRoles
                                        .slice(
                                            table.page * table.rowsPerPage,
                                            table.page * table.rowsPerPage +
                                            table.rowsPerPage
                                        )
                                        .map((row, index) => (
                                            <RoleTableRow
                                                key={row.id}
                                                row={row}
                                                serialNumber={
                                                    index +
                                                    1 +
                                                    table.page * table.rowsPerPage
                                                }
                                                selected={table.selected.includes(
                                                    row.id
                                                )}
                                                onEditRow={() =>
                                                    handleEditRole(row)
                                                }
                                                onApproval={() =>
                                                    handleApproval(row)
                                                }
                                                onReject={() => handleReject(row)}
                                            />
                                        ))
                                ) : (
                                    <TableNoData notFound />
                                )}
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </Box>

                {/* Pagination */}

                <TablePaginationCustom
                    page={table.page}
                    dense={table.dense}
                    count={filteredRoles.length}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    onChangeDense={table.onChangeDense}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                />
            </Card>

            {/* Add / Edit Role */}

            <QuickAddRoleModal
                open={openRoleModal.value}
                onClose={handleCloseRoleModal}
                currentRole={currentRole}
            />
            <ConfirmDialog
                open={openApprovalModal.value}
                onClose={handleCloseApprovalModal}
                title="Approve Role"
                content="Are you sure you want to approve this role?"
                action={<Button variant="contained" color="success" onClick={() => { }}>Approve</Button>}
            />
            <ConfirmDialog
                open={openRejectModal.value}
                onClose={handleCloseRejectModal}
                title="Reject Role"
                content="Are you sure you want to reject this role?"
                action={<Button variant="contained" color="error" onClick={() => { }}>Reject</Button>}
            />
        </DashboardContent>
    );
}

export default RoleListView;