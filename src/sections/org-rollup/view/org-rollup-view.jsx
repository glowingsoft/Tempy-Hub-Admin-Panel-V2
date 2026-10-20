import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, TableSkeleton, useTable } from 'src/components/table';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';

import { mockBranches } from 'src/sections/branch/mocks/data';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';
import { ALL_BRANCHES_VALUE } from 'src/sections/branch/owner-branch-select';
import { PEEP_RECORDS } from 'src/sections/peep-records/mocks/data';
import { getFloorPlanCoverage, mockFloors } from 'src/sections/floor-plans/mocks/data';
import { DataUsageSummaryCard } from 'src/sections/data-usage/data-usage-summary-card';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetPeepFloorSummaryQuery, useGetPeepRecordsQuery } from 'src/store/Reducer/peep-floor-plan-api';

import { OrgRollupSiteTableRow } from '../org-rollup-site-table-row';

// ----------------------------------------------------------------------

const mapBranchOption = (item) => ({
    value: item._id,
    label: item.name,
});

const EXTRA_BRANCH_OPTIONS = [{ value: ALL_BRANCHES_VALUE, label: 'All sites' }];

const TABLE_HEAD = [
    { id: 'sr', label: 'Sr#', width: 50 },
    { id: 'site', label: 'Site', width: 120 },
    { id: 'residents', label: 'Residents', width: 120, align: 'center' },
    { id: 'low', label: 'Low', width: 120, align: 'center' },
    { id: 'medium', label: 'Medium', width: 120, align: 'center' },
    { id: 'high', label: 'High', width: 120, align: 'center' },
    { id: 'floors', label: 'Floor Plans', width: 120, align: 'center' },
    { id: 'actions', label: 'Actions', width: 80, align: 'center' },
];

// Only search is client-side here — the table already scales to many sites
// via pagination, so no other filter dimension is needed yet.
const FILTER_FIELDS = [createFilterField.search({ placeholder: 'Search sites...' })];

const EMPTY_LEVELS = { low: 0, medium: 0, high: 0, total: 0 };
const EMPTY_FLOORS = { total: 0, uploaded: 0, floors: [] };

// Site Manager only ever has one site — pin the rollup table (and its
// summary cards) to that hero site instead of the whole organization.
const SITE_MANAGER_HERO_SITE_NAME = 'Willow House';

// ----------------------------------------------------------------------

export function OrgRollupView({ ownerDashboard = true }) {
    const router = useRouter();
    const table = useTable({ defaultOrderBy: 'name', defaultDense: true });

    useEffect(() => {
        table.setDense(true);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const { user } = useSelector((state) => state.user);
    const { organizationId: currentOrgId } = useCurrentOrganization();
    const activeOrgId = currentOrgId || getOwnerOrganizationId(user);

    const base = ownerDashboard ? paths.owner : paths.siteManager;

    const [branchId, setBranchId] = useState(ALL_BRANCHES_VALUE);

    const selectedBranchOption = useMemo(() => {
        if (!branchId || branchId === ALL_BRANCHES_VALUE) {
            return { value: ALL_BRANCHES_VALUE, label: 'All sites' };
        }
        return { value: branchId, label: 'Selected site' };
    }, [branchId]);

    const handleBranchChange = useCallback(
        (option) => {
            const nextId = option?.value || ALL_BRANCHES_VALUE;
            setBranchId(nextId);
            table.onResetPage();
        },
        [table]
    );

    const filters = useSetState({ search: '' });
    const keyword = useDebounce(filters.state.search, 300);

    // --- Query PEEP & Floor Plan Summary API ---------------------------------
    const {
        data: summaryData,
        isLoading,
    } = useGetPeepFloorSummaryQuery(
        {
            organizationId: activeOrgId,
            branchId: branchId !== ALL_BRANCHES_VALUE ? branchId : undefined,
        },
        { skip: !activeOrgId }
    );

    // --- Query PEEP records API on search / filter ----------------------------
    const {
        data: peepRecordsData,
        isLoading: isRecordsLoading,
    } = useGetPeepRecordsQuery(
        {
            organizationId: activeOrgId,
            page: table.page + 1,
            limit: table.rowsPerPage,
            branchId: branchId !== ALL_BRANCHES_VALUE ? branchId : '',
            peepLevel: '',
            keyword: keyword || '',
        },
        { skip: !activeOrgId }
    );

    // --- Fallback Mock Aggregates --------------------------------------------
    const levelCountsBySite = useMemo(() => {
        const map = new Map();
        PEEP_RECORDS.forEach((record) => {
            if (!record.branchId) return;
            const entry = map.get(record.branchId) || { ...EMPTY_LEVELS };
            if (record.peepLevel && entry[record.peepLevel] !== undefined) entry[record.peepLevel] += 1;
            entry.total += 1;
            map.set(record.branchId, entry);
        });
        return map;
    }, []);

    const floorSummaryBySite = useMemo(() => {
        const map = new Map();
        mockFloors.forEach((floor) => {
            if (!floor.branchId) return;
            const entry = map.get(floor.branchId) || { total: 0, uploaded: 0, floors: [] };
            entry.total += 1;
            if (floor.status === 'uploaded') entry.uploaded += 1;
            entry.floors.push(floor);
            map.set(floor.branchId, entry);
        });
        return map;
    }, []);

    const mockSiteRows = useMemo(() => {
        const orgSites = mockBranches.filter(
            (branch) => !activeOrgId || branch.organizationId === activeOrgId
        );
        const filtered = ownerDashboard
            ? orgSites
            : orgSites.filter((branch) => branch.name === SITE_MANAGER_HERO_SITE_NAME);

        return filtered.map((site) => ({
            site,
            levels: levelCountsBySite.get(site._id) || EMPTY_LEVELS,
            floorsSummary: floorSummaryBySite.get(site._id) || EMPTY_FLOORS,
        }));
    }, [activeOrgId, ownerDashboard, levelCountsBySite, floorSummaryBySite]);

    // --- Per-site rows (API or Mock fallback) --------------------------------
    const siteRows = useMemo(() => {
        if (Array.isArray(summaryData?.sites)) {
            return summaryData.sites.map((item) => {
                const siteObj = item.branch || item.site || { _id: item._id, name: item.name };
                const low = item.levels?.low ?? 0;
                const medium = item.levels?.medium ?? 0;
                const high = item.levels?.high ?? 0;
                const total = item.levels?.total ?? (low + medium + high);

                return {
                    site: {
                        _id: siteObj._id,
                        name: siteObj.name || '—',
                        code: siteObj.code,
                    },
                    levels: { low, medium, high, total },
                    floorsSummary: item.floorsSummary || {
                        total: item.floors?.total ?? 0,
                        uploaded: item.floors?.uploaded ?? 0,
                    },
                };
            });
        }

        return mockSiteRows;
    }, [summaryData, mockSiteRows]);

    const siteFloorTotals = useMemo(
        () =>
            siteRows.reduce(
                (acc, row) => {
                    acc.total += row.floorsSummary.total;
                    acc.uploaded += row.floorsSummary.uploaded;
                    return acc;
                },
                { total: 0, uploaded: 0 }
            ),
        [siteRows]
    );

    // --- Org-wide summary cards (API or Fallback) ----------------------------
    const totals = summaryData?.totals;
    const floors = summaryData?.floors;

    const totalWithRecord = totals?.records ?? PEEP_RECORDS.length;
    const highPeepCount = totals?.high ?? PEEP_RECORDS.filter((record) => record.peepLevel === 'high').length;
    const { totalSites: mockTotalSites, sitesWithPlan: mockSitesWithPlan } =
        useMemo(() => getFloorPlanCoverage(), []);

    const totalFloors = floors?.total ?? (ownerDashboard ? mockTotalSites : siteFloorTotals.total);
    const uploadedFloors = floors?.uploaded ?? (ownerDashboard ? mockSitesWithPlan : siteFloorTotals.uploaded);

    const thirdCardTitle = ownerDashboard ? 'Sites With Plans' : 'Number of floors';
    const thirdCardTotal = ownerDashboard
        ? (totalFloors ? `${uploadedFloors} of ${totalFloors}` : '0 of 0')
        : totalFloors;

    const missingFloorPlans = Math.max(totalFloors - uploadedFloors, 0);
    const fourthCardMissing = missingFloorPlans;
    const fourthCardTitle =
        fourthCardMissing > 0
            ? fourthCardMissing === 1
                ? 'No Floor Plan'
                : 'No Floor Plans'
            : ownerDashboard
            ? 'All Plans Uploaded'
            : 'Plans Uploaded';
    const fourthCardTotal = fourthCardMissing > 0 ? fourthCardMissing : (ownerDashboard ? 0 : uploadedFloors);

    // --- All-sites table (search + pagination) --------------------------------

    const matchingSiteIdsFromRecords = useMemo(() => {
        if (!keyword.trim() || !Array.isArray(peepRecordsData?.data)) return null;
        return new Set(
            peepRecordsData.data
                .map((r) => (typeof r.branch === 'object' ? r.branch?._id : r.branchId || r.branch))
                .filter(Boolean)
        );
    }, [peepRecordsData, keyword]);

    const filteredRows = useMemo(() => {
        const search = keyword.trim().toLowerCase();
        if (!search) return siteRows;

        return siteRows.filter((row) => {
            const matchesSiteName = row.site.name.toLowerCase().includes(search);
            const matchesSiteCode = row.site.code?.toLowerCase().includes(search);
            const matchesRecords = matchingSiteIdsFromRecords?.has(row.site._id);
            return matchesSiteName || matchesSiteCode || matchesRecords;
        });
    }, [siteRows, keyword, matchingSiteIdsFromRecords]);

    const paginatedRows = useMemo(() => {
        const start = table.page * table.rowsPerPage;
        return filteredRows.slice(start, start + table.rowsPerPage);
    }, [filteredRows, table.page, table.rowsPerPage]);

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

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="PEEP & Floor Plans"
                links={[
                    { name: 'Dashboard', href: base.root },
                    { name: 'PEEP & Floor Plans' },
                ]}
                action={
                    <InfiniteAutocomplete
                        value={selectedBranchOption}
                        onChange={handleBranchChange}
                        useQuery={useGetBranchesQuery}
                        queryArgs={{ organizationId: activeOrgId }}
                        mapOption={mapBranchOption}
                        extraOptions={EXTRA_BRANCH_OPTIONS}
                        label="Site"
                        placeholder="Search site..."
                        disabled={!activeOrgId}
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
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid xs={12} sm={6} md={3}>
                    <DataUsageSummaryCard
                        component="a"
                        href={base.residents.root}
                        title="Residents With PEEP"
                        total={totalWithRecord}
                        color="success"
                        icon="solar:users-group-rounded-bold-duotone"
                        sx={{ textDecoration: 'none' }}
                    />
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                    <DataUsageSummaryCard
                        title="High PEEP"
                        total={highPeepCount}
                        color="error"
                        icon="solar:danger-triangle-bold-duotone"
                    />
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                    <DataUsageSummaryCard
                        title={thirdCardTitle}
                        total={thirdCardTotal}
                        color="success"
                        icon="solar:layers-bold-duotone"
                    />
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                    <DataUsageSummaryCard
                        title={fourthCardTitle}
                        total={fourthCardTotal}
                        color={fourthCardMissing > 0 ? 'error' : 'success'}
                        icon="solar:folder-error-bold-duotone"
                    />
                </Grid>
            </Grid>

            <Card>
                <FlexibleTableToolbar
                    filterFields={FILTER_FIELDS}
                    filterValues={filters.state}
                    onFilterChange={handleFilterChange}
                    onSearchChange={handleSearchChange}
                />

                <Box sx={{ position: 'relative' }}>
                    <Scrollbar>
                        <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 850 }}>
                            <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={TABLE_HEAD} />

                            <TableBody>
                                {isLoading || (keyword && isRecordsLoading) ? (
                                    [...Array(table.rowsPerPage)].map((_, index) => (
                                        <TableSkeleton key={index} />
                                    ))
                                ) : (
                                    <>
                                        {paginatedRows.map((row, index) => (
                                            <OrgRollupSiteTableRow
                                                key={row.site._id}
                                                row={row}
                                                serialNumber={table.page * table.rowsPerPage + index + 1}
                                                onSelect={() => router.push(base.peepAndFloorPlans.site(row.site._id))}
                                            />
                                        ))}

                                        <TableNoData notFound={!paginatedRows.length} title="No sites found" />
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </Box>

                <TablePaginationCustom
                    page={table.page}
                    dense={table.dense}
                    count={filteredRows.length}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    onChangeDense={table.onChangeDense}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                />
            </Card>
        </DashboardContent>
    );
}
