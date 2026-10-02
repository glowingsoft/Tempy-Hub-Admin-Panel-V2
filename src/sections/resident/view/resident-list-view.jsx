import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useBoolean } from 'src/hooks/use-boolean';

import { mockResidentsResponse, RESIDENT_STATUS_OPTIONS } from '../mocks/data';
import { ResidentTableRow } from '../resident-table-row';
import { ResidentImportDialog } from '../resident-import-dialog';
import { ResidentSecurityDialog } from '../resident-security-dialog';
import { ResidentAddEditDialog } from '../resident-add-edit-dialog';

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

const FILTER_FIELDS = [
    createFilterField.status({ options: [{ value: 'all', label: 'All', color: 'default' }, ...RESIDENT_STATUS_OPTIONS], showCounts: true }),
    createFilterField.search({ placeholder: 'Search resident, room, or password...' }),
];

export function ResidentListView({ ownerDashboard = false }) {
    const table = useTable({ defaultOrderBy: 'name', defaultOrder: 'asc' });
    const { user } = useSelector((state) => state.user);
    const organizationId = ownerDashboard ? getOwnerOrganizationId(user) : null;
    const { branchId, onBranchChange } = useOwnerBranchFilter();

    const importDialog = useBoolean();
    const securityDialog = useBoolean();
    const addEditDialog = useBoolean();
    const deleteDialog = useBoolean();

    const [selectedResident, setSelectedResident] = useState(null);
    const [selectedResidentForEdit, setSelectedResidentForEdit] = useState(null);
    const [selectedResidentForDelete, setSelectedResidentForDelete] = useState(null);

    const [residents, setResidents] = useState(mockResidentsResponse.data);
    const filters = useSetState({ search: '', status: 'all' });
    const keyword = useDebounce(filters.state.search, 500);

    const statusFilterField = useMemo(() => FILTER_FIELDS.find((field) => field.type === 'status'), []);
    const toolbarFilterFields = useMemo(() => FILTER_FIELDS.filter((field) => field.type !== 'status'), []);
    const allResidents = useMemo(
        () => residents.filter((resident) => !organizationId || resident.organizationId === organizationId),
        [organizationId, residents]
    );

    const handleImport = useCallback((rows) => {
        const defaultBranchId = branchId !== 'all' ? branchId : allResidents[0]?.branchId;
        const importedResidents = rows.map((row, index) => ({
            _id: `resident-import-${Date.now()}-${index}`,
            name: row.name,
            email: row.email,
            phone: row.phone || '',
            roomNumber: row.roomNumber,
            careLevel: ['low', 'medium', 'high'].includes(row.careLevel) ? row.careLevel : 'low',
            status: ['active', 'inactive'].includes(row.status) ? row.status : 'active',
            image: '',
            organizationId,
            branchId: row.branchId || defaultBranchId,
            branch: row.branch || '—',
            securityPassword: `PASS-${Math.floor(1000 + Math.random() * 9000)}`,
            hasRestrictions: false,
            approvedCallers: [],
            restrictionNotes: '',
        }));

        setResidents((current) => [...current, ...importedResidents]);
    }, [allResidents, branchId, organizationId]);

    const handleSaveSecurity = useCallback((updatedResident) => {
        setResidents((current) =>
            current.map((resident) =>
                resident._id === updatedResident._id ? updatedResident : resident
            )
        );
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

    const handleSaveResident = useCallback((residentData) => {
        setResidents((current) => {
            const exists = current.some((r) => r._id === residentData._id);
            if (exists) {
                return current.map((r) => (r._id === residentData._id ? residentData : r));
            }
            return [residentData, ...current];
        });
    }, []);

    const filteredResidents = useMemo(() => {
        const search = keyword.trim().toLowerCase();
        return allResidents
            .filter((resident) => {
                const matchesBranch = !ownerDashboard || branchId === 'all' || resident.branchId === branchId;
                const matchesStatus = filters.state.status === 'all' || resident.status === filters.state.status;
                const matchesSearch = !search || [
                    resident.name,
                    resident.email,
                    resident.roomNumber,
                    resident.branch,
                    resident.securityPassword,
                ].some((value) => value?.toLowerCase().includes(search));
                return matchesBranch && matchesStatus && matchesSearch;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [allResidents, branchId, filters.state.status, keyword, ownerDashboard]);

    const getStatusCount = useCallback(
        (status) => {
            const branchResidents = allResidents.filter((resident) => !ownerDashboard || branchId === 'all' || resident.branchId === branchId);
            return status === 'all' ? branchResidents.length : branchResidents.filter((resident) => resident.status === status).length;
        },
        [allResidents, branchId, ownerDashboard]
    );

    const paginatedResidents = useMemo(() => {
        const start = table.page * table.rowsPerPage;
        return filteredResidents.slice(start, start + table.rowsPerPage);
    }, [filteredResidents, table.page, table.rowsPerPage]);

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
                links={[{ name: 'Dashboard', href: ownerDashboard ? paths.owner.root : user?.permission === 3 ? paths.lineManager.root : paths.siteManager.root }, { name: 'Residents' }]}
                action={
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                        {ownerDashboard && <OwnerBranchFilterActions value={branchId} onChange={onBranchChange} />}
                        <Button variant="outlined" onClick={importDialog.onTrue} startIcon={<Iconify icon="solar:upload-bold" />}>
                            Import CSV
                        </Button>
                        <Button variant="contained" onClick={handleOpenAdd} startIcon={<Iconify icon="mingcute:add-line" />}>
                            Add Resident
                        </Button>
                    </Stack>
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />
            <Card>
                <StatusTabsFilterWrapper filterField={statusFilterField} value={filters.state.status} onChange={handleFilterChange} getCount={getStatusCount} />
                <FlexibleTableToolbar filterFields={toolbarFilterFields} filterValues={filters.state} onFilterChange={handleFilterChange} onSearchChange={handleSearchChange} />
                <Box sx={{ position: 'relative' }}>
                    <Scrollbar>
                        <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 980 }}>
                            <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={TABLE_HEAD} />
                            <TableBody>
                                {paginatedResidents.map((row, index) => (
                                    <ResidentTableRow
                                        key={row._id}
                                        row={row}
                                        serialNumber={table.page * table.rowsPerPage + index + 1}
                                        onEditSecurity={handleOpenSecurity}
                                        onEdit={handleOpenEdit}
                                    />
                                ))}
                                <TableNoData notFound={!paginatedResidents.length} title="No residents found" />
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </Box>
                <TablePaginationCustom page={table.page} dense={table.dense} count={filteredResidents.length} rowsPerPage={table.rowsPerPage} onPageChange={table.onChangePage} onChangeDense={table.onChangeDense} onRowsPerPageChange={table.onChangeRowsPerPage} />
            </Card>
            <ResidentImportDialog open={importDialog.value} onClose={importDialog.onFalse} onImport={handleImport} />
            <ResidentSecurityDialog
                open={securityDialog.value}
                resident={selectedResident}
                onClose={securityDialog.onFalse}
                onSave={handleSaveSecurity}
            />
            <ResidentAddEditDialog
                open={addEditDialog.value}
                currentResident={selectedResidentForEdit}
                onClose={addEditDialog.onFalse}
                onSave={handleSaveResident}
            />
        </DashboardContent>
    );
}
