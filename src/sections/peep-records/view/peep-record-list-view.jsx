import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useParams, useRouter } from 'src/routes/hooks';

import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';

import { mockBranches } from 'src/sections/branch/mocks/data';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';

import { PEEP_RECORDS, PEEP_FLOOR_OPTIONS, PEEP_LEVEL_OPTIONS } from '../mocks/data';
import { PeepRecordTableRow } from '../peep-record-table-row';

const TABLE_HEAD = [
    { id: 'sr', label: 'Sr#', width: 60 },
    { id: 'resident', label: 'Resident', minWidth: 220 },
    { id: 'room', label: 'Room', width: 100 },
    { id: 'site', label: 'Site', minWidth: 140 },
    { id: 'floor', label: 'Floor', width: 130 },
    { id: 'level', label: 'PEEP level', width: 140 },
    // { id: 'supportNeeds', label: 'Support needs', minWidth: 280 },
    { id: 'actions', label: 'Actions', width: 100, align: 'center' },
];

// Floor / PEEP level options are static, so they're baked in here. The Site
// options depend on the owner's organization, so that field's `options` are
// injected at render time (see `filterFields` below).
const FILTER_FIELDS = [
    createFilterField.search({ placeholder: 'Search residents or rooms...' }),
    createFilterField.select({ key: 'branchId', label: 'Site', defaultValue: 'all' }),
    createFilterField.select({
        key: 'floor',
        label: 'Floor',
        defaultValue: 'all',
        options: [{ value: 'all', label: 'All floors' }, ...PEEP_FLOOR_OPTIONS],
    }),
    createFilterField.select({
        key: 'peepLevel',
        label: 'PEEP level',
        defaultValue: 'all',
        options: [{ value: 'all', label: 'All levels' }, ...PEEP_LEVEL_OPTIONS],
    }),
];

export function PeepRecordListView({ ownerDashboard = true }) {
    const router = useRouter();
    const table = useTable({ defaultOrderBy: 'name' });

    const { user } = useSelector((state) => state.user);
    const organizationId = getOwnerOrganizationId(user);

    const base = ownerDashboard ? paths.owner : paths.siteManager;

    // Arriving from a site drill-in (Overview -> site) carries the site id in
    // the URL, so this list opens pre-scoped to it instead of "All sites".
    const { siteId } = useParams();

    const filters = useSetState({ search: '', branchId: siteId || 'all', floor: 'all', peepLevel: 'all' });
    const keyword = useDebounce(filters.state.search, 300);

    useEffect(() => {
        filters.setState({ branchId: siteId || 'all' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteId]);

    const siteOptions = useMemo(
        () => [
            { value: 'all', label: 'All sites' },
            ...mockBranches
                .filter((branch) => !organizationId || branch.organizationId === organizationId)
                .map((branch) => ({ value: branch._id, label: branch.name })),
        ],
        [organizationId]
    );

    const currentSite = useMemo(
        () => (siteId ? mockBranches.find((branch) => branch._id === siteId) : null),
        [siteId]
    );

    const filterFields = useMemo(
        () =>
            FILTER_FIELDS.map((field) =>
                field.key === 'branchId' ? { ...field, options: siteOptions } : field
            ),
        [siteOptions]
    );

    const filteredRecords = useMemo(() => {
        const search = keyword.trim().toLowerCase();
        return PEEP_RECORDS.filter(
            (record) =>
                (filters.state.branchId === 'all' || record.branchId === filters.state.branchId) &&
                (filters.state.floor === 'all' || record.floor === filters.state.floor) &&
                (filters.state.peepLevel === 'all' || record.peepLevel === filters.state.peepLevel) &&
                (!search ||
                    record.name.toLowerCase().includes(search) ||
                    record.roomNumber.toLowerCase().includes(search))
        );
    }, [keyword, filters.state.branchId, filters.state.floor, filters.state.peepLevel]);

    const paginatedRecords = filteredRecords.slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
    );

    const handleFilterChange = useCallback(
        (key, value) => {
            table.onResetPage();
            filters.setState({ [key]: value });

            if (key === 'branchId') {
                if (value && value !== 'all') {
                    router.push(base.peepAndFloorPlans.records.bySite(value));
                } else {
                    router.push(base.peepAndFloorPlans.records.root);
                }
            }
        },
        [filters, router, table, base]
    );

    const handleSearchChange = useCallback(
        (event) => {
            table.onResetPage();
            filters.setState({ search: event.target.value });
        },
        [filters, table]
    );

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="PEEP Records"
                links={[
                    { name: 'Dashboard', href: base.root },
                    { name: 'PEEP & Floor Plans', href: base.peepAndFloorPlans.root },
                    ...(currentSite ? [{ name: currentSite.name, href: base.peepAndFloorPlans.site(currentSite._id) }] : []),
                    { name: 'PEEP Records' },
                ]}
                action={
                    <Button component={RouterLink} href={base.peepAndFloorPlans.records.new} variant="contained" startIcon={<Iconify icon="mingcute:add-line" />}>
                        New PEEP Record
                    </Button>
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Card>
                <FlexibleTableToolbar
                    filterFields={filterFields}
                    filterValues={filters.state}
                    onFilterChange={handleFilterChange}
                    onSearchChange={handleSearchChange}
                />
                <Box sx={{ position: 'relative' }}>
                    <Scrollbar>
                        <Table size={table.dense ? 'small' : 'medium'} sx={{ width: '100%' }}>
                            <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={TABLE_HEAD} />
                            <TableBody>
                                {paginatedRecords.map((row, index) => (
                                    <PeepRecordTableRow
                                        key={row.id}
                                        row={row}
                                        serialNumber={table.page * table.rowsPerPage + index + 1}
                                        ownerDashboard={ownerDashboard}
                                    />
                                ))}
                                <TableNoData notFound={!paginatedRecords.length} title="No PEEP records found" />
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </Box>
                <TablePaginationCustom
                    page={table.page}
                    dense={table.dense}
                    count={filteredRecords.length}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    onChangeDense={table.onChangeDense}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                />
            </Card>
        </DashboardContent>
    );
}
