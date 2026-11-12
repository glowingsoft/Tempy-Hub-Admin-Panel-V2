import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { toast } from 'src/components/snackbar';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Scrollbar } from 'src/components/scrollbar';
import {
    TableBodySkeleton,
    TableHeadCustom,
    TableNoData,
    TablePaginationCustom,
    useTable,
} from 'src/components/table';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useBoolean } from 'src/hooks/use-boolean';

import { useGetResidentsQuery, useCreateResidentMutation } from 'src/store/Reducer/residents-api';
import { RESIDENT_ADMISSION_STATUS_OPTIONS } from '../mocks/data';
import { ResidentTableRow } from '../resident-table-row';
import { ResidentImportDialog } from '../resident-import-dialog';
import { ResidentSecurityDialog } from '../resident-security-dialog';
import { ResidentAddEditDialog } from '../resident-add-edit-dialog';
import { ResidentRestrictionDialog } from '../resident-restriction-dialog';
import { ResidentOutDialog } from '../resident-out-dialog';

const TABLE_HEAD = [
    { id: 'sr', label: 'Sr#', width: 50 },
    { id: 'resident', label: 'Resident', minWidth: 220 },
    { id: 'branch', label: 'Site', minWidth: 150 },
    { id: 'room', label: 'Room', width: 90 },
    { id: 'careLevel', label: 'Care Level', width: 120, align: 'center' },
    { id: 'securityPassword', label: 'Security Password', minWidth: 190, align: 'center' },
    { id: 'status', label: 'Status', width: 110, align: 'center' },
    { id: 'actions', label: 'Actions', width: 90, align: 'center' },
];

const ADMISSION_TAB_OPTIONS = [
    { value: 'all', label: 'All', color: 'default' },
    ...RESIDENT_ADMISSION_STATUS_OPTIONS.filter((option) =>
        ['admitted', 'discharged'].includes(option.value)
    ),
];

const FILTER_FIELDS = [
    createFilterField.status({
        key: 'admissionStatus',
        options: ADMISSION_TAB_OPTIONS,
        showCounts: true,
    }),
    createFilterField.search({ placeholder: 'Search resident, room, or password...' }),
];

export function ResidentListView({ ownerDashboard = false }) {
    const table = useTable({
        defaultDense: true,
        defaultRowsPerPage: 10,
    });
    const { organizationId, user } = useCurrentOrganization();
    const { branchId, onBranchChange } = useOwnerBranchFilter();

    const importDialog = useBoolean();
    const securityDialog = useBoolean();
    const addEditDialog = useBoolean();
    const restrictionDialog = useBoolean();
    const outDialog = useBoolean();

    const [selectedResident, setSelectedResident] = useState(null);
    const [selectedResidentForEdit, setSelectedResidentForEdit] = useState(null);

    const [createResident] = useCreateResidentMutation();

    const filters = useSetState({ search: '', admissionStatus: 'all' });
    const keyword = useDebounce(filters.state.search, 500);
    const trimmedKeyword = keyword.trim();
    const { admissionStatus } = filters.state;

    const {
        currentData: liveData,
        isLoading: isLiveLoading,
        isFetching: isLiveFetching,
        isError: isLiveError,
        error: liveError,
    } = useGetResidentsQuery(
        {
            organizationId,
            page: table.page + 1,
            limit: table.rowsPerPage,
            ...(branchId && branchId !== 'all' ? { branchId } : {}),
            ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
            ...(admissionStatus && admissionStatus !== 'all' ? { admissionStatus } : {}),
        },
        { skip: !organizationId }
    );

    const statusFilterField = useMemo(() => FILTER_FIELDS.find((field) => field.type === 'status'), []);
    const toolbarFilterFields = useMemo(() => FILTER_FIELDS.filter((field) => field.type !== 'status'), []);

    // Source residents: Live data from the database
    const sourceResidents = useMemo(() => liveData?.data ?? [], [liveData?.data]);

    const handleImport = useCallback(
        async (rows) => {
            const defaultBranchId = branchId !== 'all' ? branchId : undefined;
            let successCount = 0;
            for (const row of rows) {
                try {
                    await createResident({
                        organizationId,
                        name: row.name,
                        email: row.email,
                        phone: row.phone || '',
                        roomNumber: row.roomNumber,
                        careLevel: ['low', 'medium', 'high'].includes(row.careLevel) ? row.careLevel : 'low',
                        admissionStatus: ['active', 'admitted'].includes(row.status) ? 'admitted' : 'discharged',
                        branchId: row.branchId || defaultBranchId,
                        visitorPasscode: `PASS-${Math.floor(1000 + Math.random() * 9000)}`,
                    }).unwrap();
                    successCount += 1;
                } catch (err) {
                    console.error('Import resident failed for row:', row, err);
                }
            }
            if (successCount > 0) {
                toast.success(`Successfully imported ${successCount} resident${successCount > 1 ? 's' : ''}!`);
                table.onResetPage();
            }
        },
        [branchId, createResident, organizationId, table]
    );

    const handleSaveSecurity = useCallback(() => {
        // Redux RTK Query automatically invalidates tags on visitor passcode update
    }, []);

    const handleOpenSecurity = useCallback((resident) => {
        setSelectedResident(resident);
        securityDialog.onTrue();
    }, [securityDialog]);

    const handleOpenAdd = useCallback(() => {
        setSelectedResidentForEdit(null);
        addEditDialog.onTrue();
    }, [addEditDialog]);

    const handleOpenEdit = useCallback((resident) => {
        setSelectedResidentForEdit(resident);
        addEditDialog.onTrue();
    }, [addEditDialog]);

    const handleOpenRestriction = useCallback((resident) => {
        setSelectedResident(resident);
        restrictionDialog.onTrue();
    }, [restrictionDialog]);

    const handleOpenOut = useCallback((resident) => {
        setSelectedResident(resident);
        outDialog.onTrue();
    }, [outDialog]);

    const handleSaveResident = useCallback(() => {
        table.onResetPage();
    }, [table]);

    const displayResidents = sourceResidents;
    const meta = liveData?.meta ?? {};
    const admittedCount = Number(meta.admitted) || 0;
    const dischargedCount = Number(meta.discharged) || 0;
    const totalRecords = Number.isFinite(meta.totalRecords) ? meta.totalRecords : displayResidents.length;

    const getStatusCount = useCallback(
        (status) => {
            if (status === 'admitted') return admittedCount;
            if (status === 'discharged') return dischargedCount;
            return admittedCount + dischargedCount || totalRecords;
        },
        [admittedCount, dischargedCount, totalRecords]
    );

    const notFound = !isLiveLoading && !isLiveFetching && displayResidents.length === 0;

    const handleFilterChange = useCallback((key, value) => {
        table.onResetPage();
        filters.setState({ [key]: value });
    }, [filters, table]);

    const handleSearchChange = useCallback((event) => {
        table.onResetPage();
        filters.setState({ search: event.target.value });
    }, [filters, table]);

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Residents"
                links={[
                    {
                        name: 'Dashboard',
                        href: ownerDashboard
                            ? paths.owner.root
                            : user?.permission === 3
                                ? paths.lineManager.root
                                : paths.siteManager.root,
                    },
                    { name: 'Residents' },
                ]}
                action={
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                        <OwnerBranchFilterActions value={branchId} onChange={onBranchChange} />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleOpenAdd}
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            Add Resident
                        </Button>
                    </Stack>
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Card>
                {isLiveError && (
                    <Alert severity="error" sx={{ m: 2 }}>
                        {liveError?.data?.message || liveError?.error || 'Failed to load residents.'}
                    </Alert>
                )}

                <StatusTabsFilterWrapper filterField={statusFilterField} value={admissionStatus} onChange={handleFilterChange} getCount={getStatusCount} />
                <FlexibleTableToolbar filterFields={toolbarFilterFields} filterValues={filters.state} onFilterChange={handleFilterChange} onSearchChange={handleSearchChange} />

                <Box sx={{ position: 'relative' }}>
                    <Scrollbar>
                        <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 980 }}>
                            <TableHeadCustom headLabel={TABLE_HEAD} />
                            <TableBody>
                                {(isLiveLoading || isLiveFetching) ? (
                                    <TableBodySkeleton
                                        rowCount={table.rowsPerPage}
                                        cellCount={TABLE_HEAD.length}
                                        dense={table.dense}
                                    />
                                ) : (
                                    <>
                                        {displayResidents.map((row, index) => (
                                            <ResidentTableRow
                                                key={row._id}
                                                row={row}
                                                serialNumber={table.page * table.rowsPerPage + index + 1}
                                                onEditSecurity={handleOpenSecurity}
                                                onEdit={handleOpenEdit}
                                                onRestriction={handleOpenRestriction}
                                                onOut={handleOpenOut}
                                            />
                                        ))}
                                        <TableNoData notFound={notFound} title="No residents found" />
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </Box>

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

            <ResidentImportDialog open={importDialog.value} onClose={importDialog.onFalse} onImport={handleImport} />

            <ResidentSecurityDialog
                open={securityDialog.value}
                resident={selectedResident}
                onClose={securityDialog.onFalse}
                onSave={handleSaveSecurity}
                organizationId={organizationId}
            />

            <ResidentAddEditDialog
                open={addEditDialog.value}
                currentResident={selectedResidentForEdit}
                onClose={addEditDialog.onFalse}
                onSave={handleSaveResident}
                ownerDashboard={ownerDashboard}
                organizationId={organizationId}
            />

            <ResidentRestrictionDialog
                open={restrictionDialog.value}
                resident={selectedResident}
                onClose={restrictionDialog.onFalse}
                onSave={handleSaveResident}
                organizationId={organizationId}
            />

            <ResidentOutDialog
                open={outDialog.value}
                resident={selectedResident}
                onClose={outDialog.onFalse}
                onSave={handleSaveResident}
                organizationId={organizationId}
            />
        </DashboardContent>
    );
}