import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
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
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { TableBodySkeleton, TableHeadCustom, TableNoData, TablePaginationCustom, TableSkeleton, useTable } from 'src/components/table';

import { mockBranches } from 'src/sections/branch/mocks/data';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';
import { ALL_BRANCHES_VALUE } from 'src/sections/branch/owner-branch-select';
import { getAssignedBranch } from 'src/sections/org-rollup/utils';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetPeepRecordsQuery } from 'src/store/Reducer/peep-floor-plan-api';

import { PEEP_RECORDS, PEEP_LEVEL_OPTIONS } from '../mocks/data';
import { PeepRecordTableRow } from '../peep-record-table-row';

const mapBranchOption = (item) => ({
    value: item._id,
    label: item.name,
});

const EXTRA_BRANCH_OPTIONS = [{ value: ALL_BRANCHES_VALUE, label: 'All sites' }];

const TABLE_HEAD = [
    { id: 'sr', label: 'Sr#', width: 60 },
    { id: 'resident', label: 'Resident', width: '24%', minWidth: 200 },
    { id: 'room', label: 'Room', width: '16%' },
    { id: 'site', label: 'Site', width: '16%' },
    { id: 'floor', label: 'Floor', width: '16%' },
    { id: 'level', label: 'PEEP level', width: '16%' },
    { id: 'actions', label: 'Actions', width: 90, align: 'center' },
];

const FILTER_FIELDS = [
    createFilterField.search({ placeholder: 'Search residents or rooms...' }),
    createFilterField.select({
        key: 'peepLevel',
        label: 'PEEP level',
        defaultValue: 'all',
        options: [{ value: 'all', label: 'All levels' }, ...PEEP_LEVEL_OPTIONS],
    }),
];

export function PeepRecordListView({ ownerDashboard = true }) {
    const router = useRouter();
    const table = useTable({ defaultOrderBy: 'name', defaultDense: true });

    const { user } = useSelector((state) => state.user);
    const { organizationId: currentOrgId, user: currentUser } = useCurrentOrganization();
    const organizationId = currentOrgId || getOwnerOrganizationId(user);
    const assignedBranch = getAssignedBranch(currentUser || user);
    const assignedBranchId = assignedBranch?.id;

    const base = ownerDashboard ? paths.owner : paths.siteManager;

    const { siteId } = useParams();
    const siteManagerSiteAllowed =
        ownerDashboard || Boolean(assignedBranchId && (!siteId || siteId === assignedBranchId));

    const filters = useSetState({ search: '', branchId: siteId || 'all', peepLevel: 'all' });
    const queryBranchId = ownerDashboard
        ? filters.state.branchId === 'all' || filters.state.branchId === ALL_BRANCHES_VALUE
            ? ''
            : filters.state.branchId
        : assignedBranchId;
    const keyword = useDebounce(filters.state.search, 300);

    useEffect(() => {
        filters.setState({ branchId: siteId || 'all' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteId]);

    // Query branches for organization
    const { data: branchesData } = useGetBranchesQuery(
        { organizationId, page: 1, limit: 100 },
        { skip: !organizationId || !ownerDashboard }
    );

    const branchList = useMemo(() => {
        if (!ownerDashboard) return [];
        if (Array.isArray(branchesData?.data)) {
            return branchesData.data;
        }
        return mockBranches.filter((branch) => !organizationId || branch.organizationId === organizationId);
    }, [branchesData, organizationId, ownerDashboard]);

    const selectedBranchOption = useMemo(() => {
        const currentId = filters.state.branchId;
        if (!currentId || currentId === ALL_BRANCHES_VALUE) {
            return { value: ALL_BRANCHES_VALUE, label: 'All sites' };
        }
        const found = branchList.find((b) => b._id === currentId);
        return found ? { value: found._id, label: found.name } : { value: currentId, label: 'Selected site' };
    }, [filters.state.branchId, branchList]);

    const handleBranchChange = useCallback(
        (option) => {
            const nextId = option?.value || ALL_BRANCHES_VALUE;
            table.onResetPage();
            filters.setState({ branchId: nextId });

            if (nextId && nextId !== ALL_BRANCHES_VALUE) {
                router.push(base.peepAndFloorPlans.records.bySite(nextId));
            } else {
                router.push(base.peepAndFloorPlans.records.root);
            }
        },
        [filters, router, table, base]
    );


    const currentSite = useMemo(() => {
        if (!ownerDashboard) {
            return assignedBranchId && (!siteId || siteId === assignedBranchId)
                ? { _id: assignedBranchId, name: assignedBranch?.name || 'My Site' }
                : null;
        }
        return siteId ? branchList.find((branch) => branch._id === siteId) : null;
    }, [ownerDashboard, assignedBranchId, assignedBranch?.name, siteId, branchList]);

    // Query PEEP records from API
    const { data: apiData, isLoading, isFetching } = useGetPeepRecordsQuery(
        {
            organizationId,
            page: table.page + 1,
            limit: table.rowsPerPage,
            branchId: queryBranchId,
            peepLevel: filters.state.peepLevel !== 'all' ? filters.state.peepLevel : '',
            keyword: keyword || '',
        },
        { skip: !organizationId || !siteManagerSiteAllowed || (!ownerDashboard && !assignedBranchId) }
    );

    // Keep the existing mock fallback for Owner; Site Manager records are API-scoped only.
    const filteredMockRecords = useMemo(() => {
        if (!ownerDashboard) return [];
        const search = keyword.trim().toLowerCase();
        return PEEP_RECORDS.filter(
            (record) =>
                (filters.state.branchId === 'all' || record.branchId === filters.state.branchId) &&
                (filters.state.peepLevel === 'all' || record.peepLevel === filters.state.peepLevel) &&
                (!search ||
                    record.name.toLowerCase().includes(search) ||
                    record.roomNumber.toLowerCase().includes(search))
        );
    }, [ownerDashboard, keyword, filters.state.branchId, filters.state.peepLevel]);

    const paginatedMockRecords = filteredMockRecords.slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
    );

    const filteredApiRecords = useMemo(() => {
        if (!apiData || !Array.isArray(apiData.data)) return null;
        return apiData.data.map((r) => ({
            ...r,
            id: r._id || r.id,
            name:
                r.name ||
                r.residentName ||
                (r.resident ? `${r.resident.firstName || ''} ${r.resident.lastName || ''}`.trim() : '') ||
                '—',
            email: r.email || r.resident?.email || '',
            roomNumber: r.roomNumber || r.room?.number || r.room || '—',
            branch: typeof r.branch === 'object' ? r.branch?.name : r.branch || r.branchName || '—',
            floor: r.floor || r.floorNumber || r.floorPlan?.floorNumber || '—',
            peepLevel: r.peepLevel || r.level || 'low',
        }));
    }, [apiData]);

    const visibleApiRecords = siteManagerSiteAllowed ? filteredApiRecords : null;
    const records = visibleApiRecords ?? (ownerDashboard ? paginatedMockRecords : []);
    const totalCount =
        visibleApiRecords && apiData
            ? apiData.meta?.totalRecords ?? apiData.meta?.total ?? visibleApiRecords.length
            : ownerDashboard
                ? filteredMockRecords.length
                : 0;

    const notFound = !isLoading && !records.length;

    const handleFilterChange = useCallback(
        (key, value) => {
            table.onResetPage();
            if (key === 'branchId') {
                filters.setState({ branchId: value });
                if (value && value !== 'all' && value !== ALL_BRANCHES_VALUE) {
                    router.push(base.peepAndFloorPlans.records.bySite(value));
                } else {
                    router.push(base.peepAndFloorPlans.records.root);
                }
            } else {
                filters.setState({ [key]: value });
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
            <Box sx={{ mb: 2 }}>
                <Button
                    color="primary"
                    onClick={() => {
                        if (currentSite) {
                            router.push(base.peepAndFloorPlans.site(currentSite._id));
                        } else {
                            router.push(base.peepAndFloorPlans.root);
                        }
                    }}
                    startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                >
                    Back
                </Button>
            </Box>

            <CustomBreadcrumbs
                heading="PEEP Records"
                sx={{
                    mb: { xs: 3, md: 5 },
                    '& .MuiBreadcrumbs-li': { textTransform: 'capitalize' },
                }}
                links={[
                    { name: 'Dashboard', href: base.root },
                    { name: 'PEEP & Floor Plans', href: base.peepAndFloorPlans.root },
                    ...(currentSite ? [{ name: currentSite.name, href: base.peepAndFloorPlans.site(currentSite._id) }] : []),
                    { name: 'PEEP Records' },
                ]}
                action={
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                    >
                        {ownerDashboard && (
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
                        )}
                        {(ownerDashboard || (assignedBranchId && siteManagerSiteAllowed)) && (
                            <Button
                                component={RouterLink}
                                href={base.peepAndFloorPlans.records.new}
                                variant="contained"
                                color="primary"
                                startIcon={<Iconify icon="mingcute:add-line" />}
                            >
                                New PEEP Record
                            </Button>
                        )}
                    </Stack>
                }
            />

            <Card>
                <FlexibleTableToolbar
                    filterFields={FILTER_FIELDS}
                    filterValues={filters.state}
                    onFilterChange={handleFilterChange}
                    onSearchChange={handleSearchChange}
                />
                <Box sx={{ position: 'relative' }}>
                    <Scrollbar>
                        <Table size={table.dense ? 'small' : 'medium'} sx={{ width: '100%' }}>
                            <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={TABLE_HEAD} />
                            <TableBody>
                                {isLoading || isFetching ? (
                                    <TableBodySkeleton
                                        rowCount={table.rowsPerPage}
                                        cellCount={TABLE_HEAD.length}
                                        dense={table.dense}
                                    />
                                ) : (
                                    <>
                                        {records.map((row, index) => (
                                            <PeepRecordTableRow
                                                key={row.id}
                                                row={row}
                                                serialNumber={table.page * table.rowsPerPage + index + 1}
                                                ownerDashboard={ownerDashboard}
                                            />
                                        ))}
                                        <TableNoData
                                            notFound={notFound}
                                            title={
                                                !ownerDashboard && !assignedBranchId
                                                    ? 'Your assigned site could not be determined'
                                                    : !siteManagerSiteAllowed
                                                        ? 'You do not have access to this site'
                                                        : 'No PEEP records found'
                                            }
                                        />
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
        </DashboardContent>
    );
}