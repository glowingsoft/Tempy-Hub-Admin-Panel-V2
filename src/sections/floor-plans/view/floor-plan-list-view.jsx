import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';

import { mockBranches } from 'src/sections/branch/mocks/data';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';
import { UploadFloorPlanDialog } from 'src/sections/active-sections/peen-floor-plan/upload-floor-plan-dialog';
import { setFloorPlanFile } from 'src/sections/active-sections/peen-floor-plan/mocks/data';
import { convertPdfToImage } from 'src/utils/pdf-to-image';

import {
    FLOOR_STATUS_OPTIONS,
    createMockFloor,
    mockFloors,
    uploadMockFloorPlan,
} from '../mocks/data';
import { FloorCreateModal } from '../floor-create-modal';
import { FloorPlanTableRow } from '../floor-plan-table-row';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All', color: 'default' }, ...FLOOR_STATUS_OPTIONS];
const STATUS_FILTER_FIELD = createFilterField.status({ options: STATUS_OPTIONS, showCounts: true });

const TABLE_HEAD = [
    { id: 'sr', label: 'Sr#', width: 60 },
    { id: 'name', label: 'Floor', minWidth: 180 },
    { id: 'branch', label: 'Site', minWidth: 160 },
    { id: 'status', label: 'Status', width: 150 },
    { id: 'version', label: 'Version', width: 90, align: 'center' },
    { id: 'pinsCount', label: 'Pins', width: 80, align: 'center' },
    { id: 'uploadedAt', label: 'Uploaded At', width: 160 },
    { id: 'actions', label: 'Actions', width: 100, align: 'center' },
];

// TODO: confirm whether the list endpoint supports status/site/keyword params —
// all three are client-side only against the mock data here.
const BASE_FILTER_FIELDS = [
    createFilterField.search({ placeholder: 'Search floors or sites...' }),
    createFilterField.select({ key: 'branchId', label: 'Site', defaultValue: 'all' }),
];

export function FloorPlanListView({ ownerDashboard = true }) {
    const router = useRouter();
    const table = useTable({ defaultOrderBy: 'name' });

    const { user } = useSelector((state) => state.user);
    const organizationId = getOwnerOrganizationId(user);

    const base = ownerDashboard ? paths.owner : paths.siteManager;

    // Arriving from a site drill-in (Overview -> site) carries the site id in
    // the URL, so this list opens pre-scoped to it instead of "All sites".
    const { siteId } = useParams();

    const filters = useSetState({ search: '', status: 'all', branchId: siteId || 'all' });
    const keyword = useDebounce(filters.state.search, 300);

    useEffect(() => {
        filters.setState({ branchId: siteId || 'all' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteId]);

    const [reloadKey, setReloadKey] = useState(0);
    const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

    const createOpen = useBoolean();
    const [uploadTarget, setUploadTarget] = useState(null);

    // --- Filter options -----------------------------------------------------

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
            BASE_FILTER_FIELDS.map((field) =>
                field.key === 'branchId' ? { ...field, options: siteOptions } : field
            ),
        [siteOptions]
    );

    // --- Data source ---------------------------------------------------------
    // `mockFloors` is already scoped to the owner's sites at the mock-data
    // layer — `reloadKey` just forces a re-read after a create/upload mutation.
    const allFloors = useMemo(() => mockFloors, [reloadKey]);

    const filteredFloors = useMemo(() => {
        const search = keyword.trim().toLowerCase();

        return allFloors.filter((floor) => {
            const matchesStatus = filters.state.status === 'all' || floor.status === filters.state.status;
            const matchesSite = filters.state.branchId === 'all' || floor.branchId === filters.state.branchId;
            const matchesSearch =
                !search ||
                floor.name.toLowerCase().includes(search) ||
                floor.branch?.toLowerCase().includes(search);

            return matchesStatus && matchesSite && matchesSearch;
        });
    }, [allFloors, filters.state.status, filters.state.branchId, keyword]);

    const paginatedFloors = useMemo(() => {
        const start = table.page * table.rowsPerPage;
        return filteredFloors.slice(start, start + table.rowsPerPage);
    }, [filteredFloors, table.page, table.rowsPerPage]);

    const getStatusCount = useCallback(
        (status) =>
            status === 'all' ? allFloors.length : allFloors.filter((floor) => floor.status === status).length,
        [allFloors]
    );

    const notFound = !paginatedFloors.length;

    // --- Handlers --------------------------------------------------------

    const handleFilterChange = useCallback(
        (key, value) => {
            table.onResetPage();
            filters.setState({ [key]: value });

            if (key === 'branchId') {
                if (value && value !== 'all') {
                    router.push(base.peepAndFloorPlans.floorPlans.bySite(value));
                } else {
                    router.push(base.peepAndFloorPlans.floorPlans.root);
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

    const handleCreateSuccess = useCallback(
        (payload) => {
            createMockFloor(payload);
            table.onResetPage();
            refresh();
        },
        [refresh, table]
    );

    const handleUploadSubmit = useCallback(
        async (file, imageResult) => {
            if (!uploadTarget) return;

            let converted = imageResult;
            if (!converted && file) {
                try {
                    converted = await convertPdfToImage(file);
                } catch (err) {
                    console.warn('PDF conversion error in floor plan list view:', err);
                }
            }

            uploadMockFloorPlan(uploadTarget.id, file, converted);
            setFloorPlanFile(file, converted);
            refresh();
            toast.success('Floor plan uploaded successfully!');
        },
        [refresh, uploadTarget]
    );

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Floor Plans"
                links={[
                    { name: 'Dashboard', href: base.root },
                    { name: 'PEEP & Floor Plans', href: base.peepAndFloorPlans.root },
                    ...(currentSite ? [{ name: currentSite.name, href: base.peepAndFloorPlans.site(currentSite._id) }] : []),
                    { name: 'Floor Plans' },
                ]}
                action={
                    <Button
                        variant="contained"
                        onClick={createOpen.onTrue}
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        disabled={!siteOptions.length || siteOptions.length === 1}
                    >
                        Add Floor
                    </Button>
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Card>
                <StatusTabsFilterWrapper
                    filterField={STATUS_FILTER_FIELD}
                    value={filters.state.status}
                    onChange={handleFilterChange}
                    getCount={getStatusCount}
                />

                <FlexibleTableToolbar
                    filterFields={filterFields}
                    filterValues={filters.state}
                    onFilterChange={handleFilterChange}
                    onSearchChange={handleSearchChange}
                />

                <Box sx={{ position: 'relative' }}>
                    <Scrollbar>
                        <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1080 }}>
                            <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={TABLE_HEAD} />

                            <TableBody>
                                {paginatedFloors.map((row, index) => (
                                    <FloorPlanTableRow
                                        key={row.id}
                                        row={row}
                                        serialNumber={table.page * table.rowsPerPage + index + 1}
                                        onUpload={setUploadTarget}
                                        ownerDashboard={ownerDashboard}
                                        clickable
                                    />
                                ))}

                                <TableNoData notFound={notFound} title="No floors found" />
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </Box>

                <TablePaginationCustom
                    page={table.page}
                    dense={table.dense}
                    count={filteredFloors.length}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    onChangeDense={table.onChangeDense}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                />
            </Card>

            <FloorCreateModal
                open={createOpen.value}
                onClose={createOpen.onFalse}
                siteOptions={siteOptions.filter((option) => option.value !== 'all')}
                onSuccess={handleCreateSuccess}
            />

            <UploadFloorPlanDialog
                open={!!uploadTarget}
                onClose={() => setUploadTarget(null)}
                onUpload={handleUploadSubmit}
                title={uploadTarget ? `Upload plan — ${uploadTarget.name} (${uploadTarget.branch})` : undefined}
            />
        </DashboardContent>
    );
}
