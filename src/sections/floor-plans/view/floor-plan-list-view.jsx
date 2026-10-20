import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, TableSkeleton, useTable } from 'src/components/table';

import { mockBranches } from 'src/sections/branch/mocks/data';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';
import { ALL_BRANCHES_VALUE } from 'src/sections/branch/owner-branch-select';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import {
    useGetFloorPlansQuery,
    useUpdateFloorPlanMutation,
} from 'src/store/Reducer/floor-plans-api';
import { useUploadFileMutation } from 'src/store/Reducer/upload-api';
import { UploadFloorPlanDialog } from 'src/sections/active-sections/peen-floor-plan/upload-floor-plan-dialog';
import { setFloorPlanFile } from 'src/sections/active-sections/peen-floor-plan/mocks/data';

import {
    FLOOR_STATUS_OPTIONS,
    createMockFloor,
    mockFloors,
    uploadMockFloorPlan,
} from '../mocks/data';
import { FloorCreateModal } from '../floor-create-modal';
import { FloorPlanTableRow } from '../floor-plan-table-row';

// ----------------------------------------------------------------------

const mapBranchOption = (item) => ({
    value: item._id,
    label: item.name,
});

const EXTRA_BRANCH_OPTIONS = [{ value: ALL_BRANCHES_VALUE, label: 'All sites' }];

const STATUS_OPTIONS = [{ value: 'all', label: 'All', color: 'default' }, ...FLOOR_STATUS_OPTIONS];
const STATUS_FILTER_FIELD = createFilterField.status({ options: STATUS_OPTIONS, showCounts: true });

const TABLE_HEAD = [
    { id: 'sr', label: 'Sr#', width: 60 },
    { id: 'name', label: 'Floor', minWidth: 160 },
    { id: 'branch', label: 'Site', minWidth: 140 },
    { id: 'status', label: 'Status', width: 130 },
    { id: 'version', label: 'Version', width: 90, align: 'center' },
    { id: 'pinsCount', label: 'Pins', width: 80, align: 'center' },
    { id: 'uploadedAt', label: 'Uploaded At', width: 170 },
    { id: 'actions', label: 'Actions', width: 90, align: 'center' },
];

const BASE_FILTER_FIELDS = [
    createFilterField.search({ placeholder: 'Search floors or sites...' }),
];

export function FloorPlanListView({ ownerDashboard = true }) {
    const router = useRouter();
    const table = useTable({ defaultOrderBy: 'name', defaultDense: true });

    const { user } = useSelector((state) => state.user);
    const { organizationId: currentOrgId } = useCurrentOrganization();
    const organizationId = currentOrgId || getOwnerOrganizationId(user);

    const base = ownerDashboard ? paths.owner : paths.siteManager;

    const { siteId } = useParams();

    const filters = useSetState({ search: '', status: 'all', branchId: siteId || ALL_BRANCHES_VALUE });
    const keyword = useDebounce(filters.state.search, 300);

    useEffect(() => {
        filters.setState({ branchId: siteId || ALL_BRANCHES_VALUE });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteId]);

    const [reloadKey, setReloadKey] = useState(0);
    const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

    const createOpen = useBoolean();
    const [uploadTarget, setUploadTarget] = useState(null);
    const [uploadFile] = useUploadFileMutation();
    const [updateFloorPlan] = useUpdateFloorPlanMutation();

    // Query branches for organization
    const { data: branchesData } = useGetBranchesQuery(
        { organizationId, page: 1, limit: 100 },
        { skip: !organizationId }
    );

    const branchList = useMemo(() => {
        if (Array.isArray(branchesData?.data)) {
            return branchesData.data;
        }
        return mockBranches.filter((branch) => !organizationId || branch.organizationId === organizationId);
    }, [branchesData, organizationId]);

    const selectedBranchOption = useMemo(() => {
        const currentId = filters.state.branchId;
        if (!currentId || currentId === ALL_BRANCHES_VALUE) {
            return { value: ALL_BRANCHES_VALUE, label: 'All sites' };
        }
        const found = branchList.find((b) => b._id === currentId);
        return found ? { value: found._id, label: found.name } : { value: currentId, label: 'Selected site' };
    }, [filters.state.branchId, branchList]);

    const currentSite = useMemo(
        () => (siteId ? branchList.find((branch) => branch._id === siteId) : null),
        [siteId, branchList]
    );

    // --- Query floor plans from API -----------------------------------------
    const { data: apiData, isLoading } = useGetFloorPlansQuery(
        {
            organizationId,
            page: table.page + 1,
            limit: table.rowsPerPage,
            branchId: filters.state.branchId !== ALL_BRANCHES_VALUE ? filters.state.branchId : '',
            status: filters.state.status !== 'all' ? filters.state.status : '',
            keyword: keyword || '',
        },
        { skip: !organizationId }
    );

    // Fallback to mock data if API is not available
    const allMockFloors = useMemo(() => mockFloors, [reloadKey]);

    const filteredMockFloors = useMemo(() => {
        const search = keyword.trim().toLowerCase();

        return allMockFloors.filter((floor) => {
            const matchesStatus = filters.state.status === 'all' || floor.status === filters.state.status;
            const matchesSite = filters.state.branchId === ALL_BRANCHES_VALUE || floor.branchId === filters.state.branchId;
            const matchesSearch =
                !search ||
                floor.name.toLowerCase().includes(search) ||
                floor.branch?.toLowerCase().includes(search);

            return matchesStatus && matchesSite && matchesSearch;
        });
    }, [allMockFloors, filters.state.status, filters.state.branchId, keyword]);

    const paginatedMockFloors = useMemo(() => {
        const start = table.page * table.rowsPerPage;
        return filteredMockFloors.slice(start, start + table.rowsPerPage);
    }, [filteredMockFloors, table.page, table.rowsPerPage]);

    const filteredApiFloors = useMemo(() => {
        if (!apiData || !Array.isArray(apiData.data)) return null;
        return apiData.data.map((f) => ({
            ...f,
            id: f._id || f.id,
            name: f.name || f.floorName || (f.floorNumber !== undefined ? `Floor ${f.floorNumber}` : 'Floor Plan'),
            branchId: typeof f.branch === 'object' ? f.branch?._id : (f.branchId || f.branch),
            branch: typeof f.branch === 'object' ? f.branch?.name : (f.branchName || f.branch || '—'),
            status: f.status || (f.fileUrl || f.imageUrl || f.pdfUrl ? 'uploaded' : 'pending'),
            version: f.version ?? 1,
            pinsCount: f.pinsCount ?? f.pins?.length ?? 0,
            uploadedAt: f.uploadedAt || f.createdAt || null,
        }));
    }, [apiData]);

    const records = filteredApiFloors ?? paginatedMockFloors;
    const totalCount = apiData
        ? (apiData?.meta?.totalRecords ?? apiData?.meta?.total ?? filteredApiFloors?.length ?? 0)
        : filteredMockFloors.length;

    const getStatusCount = useCallback(
        (status) => {
            if (filteredApiFloors) {
                return status === 'all'
                    ? filteredApiFloors.length
                    : filteredApiFloors.filter((floor) => floor.status === status).length;
            }
            return status === 'all'
                ? allMockFloors.length
                : allMockFloors.filter((floor) => floor.status === status).length;
        },
        [filteredApiFloors, allMockFloors]
    );

    const notFound = !isLoading && !records.length;

    // --- Handlers --------------------------------------------------------

    const handleBranchChange = useCallback(
        (option) => {
            const nextId = option?.value || ALL_BRANCHES_VALUE;
            table.onResetPage();
            filters.setState({ branchId: nextId });

            if (nextId && nextId !== ALL_BRANCHES_VALUE) {
                router.push(base.peepAndFloorPlans.floorPlans.bySite(nextId));
            } else {
                router.push(base.peepAndFloorPlans.floorPlans.root);
            }
        },
        [filters, router, table, base]
    );

    const handleFilterChange = useCallback(
        (key, value) => {
            table.onResetPage();
            filters.setState({ [key]: value });
        },
        [filters, table]
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
        async (file) => {
            if (!uploadTarget) return;

            const floorPlanId = uploadTarget._id || uploadTarget.id;
            const isApiFloorPlan = apiData?.data?.some(
                (floorPlan) => String(floorPlan._id || floorPlan.id) === String(floorPlanId)
            );

            if (isApiFloorPlan) {
                try {
                    if (!organizationId || !floorPlanId) {
                        throw new Error('Organization or floor plan context is unavailable.');
                    }

                    const uploadResult = await uploadFile(file).unwrap();
                    const fileKey = uploadResult?.key;
                    if (!fileKey) {
                        throw new Error('The file upload did not return an S3 object key.');
                    }

                    await updateFloorPlan({
                        floorPlanId,
                        organizationId,
                        name: uploadTarget.name,
                        imageUrl: fileKey,
                        pdfUrl: '',
                    }).unwrap();

                    toast.success('Floor plan updated successfully!');
                    setUploadTarget(null);
                    return;
                } catch (error) {
                    toast.error(
                        error?.data?.message ||
                            error?.message ||
                            'Unable to update the floor plan.'
                    );
                    throw error;
                }
            }

            const imagePreview = { imageUrl: URL.createObjectURL(file) };
            uploadMockFloorPlan(uploadTarget.id, file, imagePreview);
            setFloorPlanFile(file, imagePreview);
            refresh();
            toast.success('Floor plan uploaded successfully!');
        },
        [apiData, organizationId, refresh, updateFloorPlan, uploadFile, uploadTarget]
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
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                    >
                        <InfiniteAutocomplete
                            value={selectedBranchOption}
                            onChange={handleBranchChange}
                            useQuery={useGetBranchesQuery}
                            queryArgs={{ organizationId }}
                            mapOption={mapBranchOption}
                            extraOptions={EXTRA_BRANCH_OPTIONS}
                            label="Site"
                            placeholder="Search site..."
                            disabled={!organizationId}
                            size="small"
                            sx={{ minWidth: { xs: 1, sm: 260 } }}
                            textFieldProps={{
                                InputProps: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Iconify
                                                icon="solar:buildings-2-bold-duotone"
                                                width={20}
                                                sx={{ color: 'text.disabled' }}
                                            />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={createOpen.onTrue}
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            Add Floor
                        </Button>
                    </Stack>
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
                    filterFields={BASE_FILTER_FIELDS}
                    filterValues={filters.state}
                    onFilterChange={handleFilterChange}
                    onSearchChange={handleSearchChange}
                />

                <Box sx={{ position: 'relative' }}>
                    <Scrollbar>
                        <Table size={table.dense ? 'small' : 'medium'} sx={{ width: '100%', minWidth: 800 }}>
                            <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={TABLE_HEAD} />

                            <TableBody>
                                {isLoading ? (
                                    [...Array(table.rowsPerPage)].map((_, index) => (
                                        <TableSkeleton key={index} sx={{ height: 48 }} />
                                    ))
                                ) : (
                                    <>
                                        {records.map((row, index) => (
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
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </Box>

                <TablePaginationCustom
                    page={table.page}
                    dense={table.dense}
                    count={totalCount}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    onChangeDense={table.onChangeDense}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                />
            </Card>

            <FloorCreateModal
                open={createOpen.value}
                onClose={createOpen.onFalse}
                siteOptions={branchList.map((branch) => ({ value: branch._id, label: branch.name }))}
                defaultBranchId={siteId || ''}
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