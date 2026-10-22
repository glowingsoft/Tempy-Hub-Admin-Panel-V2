import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
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
import { TableBodySkeleton, TableHeadCustom, TableNoData, TablePaginationCustom, TableSkeleton, useTable } from 'src/components/table';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';

import { mockBranches } from 'src/sections/branch/mocks/data';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';
import { ALL_BRANCHES_VALUE } from 'src/sections/branch/owner-branch-select';
import { PEEP_RECORDS } from 'src/sections/peep-records/mocks/data';
import { mockFloors } from 'src/sections/floor-plans/mocks/data';
import { DataUsageSummaryCard } from 'src/sections/data-usage/data-usage-summary-card';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetPeepFloorSummaryQuery } from 'src/store/Reducer/peep-floor-plan-api';

import { OrgRollupSiteTableRow } from '../org-rollup-site-table-row';
import { getAssignedBranch } from '../utils';

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

// ----------------------------------------------------------------------

export function OrgRollupView({ ownerDashboard = true }) {
    const router = useRouter();
    const table = useTable({ defaultOrderBy: 'name', defaultDense: true });

    useEffect(() => {
        table.setDense(true);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const { user } = useSelector((state) => state.user);
    const { organizationId: currentOrgId, user: currentUser } = useCurrentOrganization();
    const activeOrgId = currentOrgId || getOwnerOrganizationId(user);
    const assignedBranch = getAssignedBranch(currentUser || user);
    const assignedBranchId = assignedBranch?.id;

    const base = ownerDashboard ? paths.owner : paths.siteManager;

    const [selectedBranch, setSelectedBranch] = useState({
        value: ALL_BRANCHES_VALUE,
        label: 'All sites',
    });
    const branchId = selectedBranch?.value || ALL_BRANCHES_VALUE;
    const queryBranchId = ownerDashboard
        ? branchId !== ALL_BRANCHES_VALUE
            ? branchId
            : undefined
        : assignedBranchId;

    const selectedBranchOption = selectedBranch;

    const handleBranchChange = useCallback(
        (option) => {
            const nextOption = option && typeof option === 'object'
                ? { value: option.value, label: option.label || 'Selected site' }
                : { value: ALL_BRANCHES_VALUE, label: 'All sites' };
            setSelectedBranch(nextOption);
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
        isFetching,
    } = useGetPeepFloorSummaryQuery(
        {
            organizationId: activeOrgId,
            branchId: queryBranchId,
        },
        { skip: !activeOrgId || (!ownerDashboard && !queryBranchId) }
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
        if (!ownerDashboard) return [];

        const orgSites = mockBranches.filter(
            (branch) => !activeOrgId || branch.organizationId === activeOrgId
        );

        return orgSites.map((site) => ({
            site,
            levels: levelCountsBySite.get(site._id) || EMPTY_LEVELS,
            floorsSummary: floorSummaryBySite.get(site._id) || EMPTY_FLOORS,
        }));
    }, [activeOrgId, ownerDashboard, levelCountsBySite, floorSummaryBySite]);

    // --- Per-site rows (API or Mock fallback) --------------------------------
    const siteRows = useMemo(() => {
        if (Array.isArray(summaryData?.sites)) {
            const sites = ownerDashboard
                ? summaryData.sites
                : summaryData.sites.filter((item) => {
                      const site = item.branch || item.site || item;
                      return !assignedBranchId || site._id === assignedBranchId;
                  });

            return sites.map((item) => {
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

        if (!ownerDashboard && assignedBranchId && summaryData) {
            const site = summaryData.site || assignedBranch;
            const low = summaryData.levels?.low ?? 0;
            const medium = summaryData.levels?.medium ?? 0;
            const high = summaryData.levels?.high ?? 0;

            return [
                {
                    site: {
                        _id: assignedBranchId,
                        name: site?.name || assignedBranch?.name || 'Assigned site',
                        code: site?.code,
                    },
                    levels: {
                        low,
                        medium,
                        high,
                        total: summaryData.levels?.total ?? (low + medium + high),
                    },
                    floorsSummary: summaryData.floorsSummary || {
                        total: summaryData.floors?.total ?? 0,
                        uploaded: summaryData.floors?.uploaded ?? 0,
                    },
                },
            ];
        }

        if (ownerDashboard) {
            return mockSiteRows;
        }

        // Fallback for Site Manager if summaryData is not yet loaded or on mock
        if (!ownerDashboard && assignedBranchId) {
            const assignedMockSite = mockBranches.find((b) => b._id === assignedBranchId);
            const mockFloorSummary = floorSummaryBySite.get(assignedBranchId) || EMPTY_FLOORS;
            return [
                {
                    site: assignedMockSite || {
                        _id: assignedBranchId,
                        name: assignedBranch?.name || 'Assigned site',
                    },
                    levels: levelCountsBySite.get(assignedBranchId) || EMPTY_LEVELS,
                    floorsSummary: mockFloorSummary,
                },
            ];
        }

        return [];
    }, [
        summaryData,
        ownerDashboard,
        assignedBranchId,
        assignedBranch,
        mockSiteRows,
        levelCountsBySite,
        floorSummaryBySite,
    ]);

    const siteFloorTotals = useMemo(
        () =>
            siteRows.reduce(
                (acc, row) => {
                    acc.total += row.floorsSummary?.total ?? 0;
                    acc.uploaded += row.floorsSummary?.uploaded ?? 0;
                    return acc;
                },
                { total: 0, uploaded: 0 }
            ),
        [siteRows]
    );

    // --- Org-wide / Site-specific summary cards ------------------------------
    const totals = summaryData?.totals;
    const floors = summaryData?.floors;

    const apiSiteSummaries = Array.isArray(summaryData?.sites)
        ? ownerDashboard
            ? summaryData.sites
            : summaryData.sites.filter(
                  (s) => !assignedBranchId || (s.branch?._id || s.site?._id || s._id) === assignedBranchId
              )
        : [];

    const apiSiteTotals = apiSiteSummaries.reduce(
        (counts, row) => ({
            total: counts.total + (row.levels?.total ?? (row.levels?.low ?? 0) + (row.levels?.medium ?? 0) + (row.levels?.high ?? 0)),
            high: counts.high + (row.levels?.high ?? 0),
            floors: counts.floors + (row.floors?.total ?? row.floorsSummary?.total ?? 0),
            uploadedFloors: counts.uploadedFloors + (row.floors?.uploaded ?? row.floorsSummary?.uploaded ?? 0),
        }),
        { total: 0, high: 0, floors: 0, uploadedFloors: 0 }
    );
    const summaryLevels = summaryData?.levels || {};
    const hasSummaryData = Boolean(summaryData);
    const isSummaryCardsLoading = Boolean(activeOrgId && !hasSummaryData && (isLoading || isFetching));

    const resolvedTotalWithRecord = !ownerDashboard
        ? (siteRows[0]?.levels?.total ??
           summaryData?.levels?.total ??
           (apiSiteSummaries[0]?.levels?.low ?? 0) + (apiSiteSummaries[0]?.levels?.medium ?? 0) + (apiSiteSummaries[0]?.levels?.high ?? 0) ??
           0)
        : (totals?.records ??
           summaryLevels.total ??
           (apiSiteSummaries.length ? apiSiteTotals.total : hasSummaryData ? 0 : '—'));

    const highPeepCount = !ownerDashboard
        ? (siteRows[0]?.levels?.high ??
           summaryData?.levels?.high ??
           apiSiteSummaries[0]?.levels?.high ??
           0)
        : (totals?.high ??
           summaryLevels.high ??
           (apiSiteSummaries.length ? apiSiteTotals.high : hasSummaryData ? 0 : '—'));

    const totalFloors = siteRows.length > 0
        ? siteFloorTotals.total
        : (ownerDashboard ? (floors?.total ?? summaryData?.floorsSummary?.total) : null) ??
          (apiSiteSummaries.length ? apiSiteTotals.floors : hasSummaryData ? 0 : null);

    const uploadedFloors = siteRows.length > 0
        ? siteFloorTotals.uploaded
        : (ownerDashboard ? (floors?.uploaded ?? summaryData?.floorsSummary?.uploaded) : null) ??
          (apiSiteSummaries.length ? apiSiteTotals.uploadedFloors : hasSummaryData ? 0 : null);

    const sitesWithPlansCount = useMemo(
        () => siteRows.filter((r) => (r.floorsSummary?.uploaded ?? 0) > 0).length,
        [siteRows]
    );

    const thirdCardTitle = ownerDashboard ? 'Sites With Plans' : 'Number of floors';
    const thirdCardTotal =
        totalFloors === null || uploadedFloors === null
            ? '—'
            : ownerDashboard
                ? `${sitesWithPlansCount} of ${siteRows.length}`
                : totalFloors;

    const missingFloorPlans =
        totalFloors === null || uploadedFloors === null
            ? null
            : Math.max(totalFloors - uploadedFloors, 0);

    const fourthCardMissing = missingFloorPlans;
    const fourthCardTitle =
        fourthCardMissing === null
            ? 'Floor Plan Status'
            : totalFloors === 0
            ? 'No Floor Plans'
            : fourthCardMissing > 0
            ? fourthCardMissing === 1
                ? 'Missing Floor Plan'
                : 'Missing Floor Plans'
            : 'All Plans Uploaded';

    const fourthCardTotal =
        fourthCardMissing === null
            ? '—'
            : totalFloors === 0
            ? 0
            : fourthCardMissing > 0
            ? fourthCardMissing
            : uploadedFloors;

    const fourthCardColor =
        fourthCardMissing === null
            ? 'default'
            : totalFloors === 0
            ? 'warning'
            : fourthCardMissing > 0
            ? 'error'
            : 'success';

    const fourthCardIcon =
        fourthCardMissing === null
            ? 'solar:folder-error-bold-duotone'
            : fourthCardMissing > 0 || totalFloors === 0
            ? 'solar:folder-error-bold-duotone'
            : 'solar:check-circle-bold-duotone';

    // --- All-sites table (search + pagination) --------------------------------

    const filteredRows = useMemo(() => {
        const search = keyword.trim().toLowerCase();
        if (!search) return siteRows;

        return siteRows.filter((row) => {
            const matchesSiteName = row.site.name.toLowerCase().includes(search);
            const matchesSiteCode = row.site.code?.toLowerCase().includes(search);
            return matchesSiteName || matchesSiteCode;
        });
    }, [siteRows, keyword]);

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
                        )}

                        <Button
                            component={RouterLink}
                            href={
                                branchId && branchId !== ALL_BRANCHES_VALUE
                                    ? base.peepAndFloorPlans.floorPlans.bySite(branchId)
                                    : !ownerDashboard && assignedBranchId
                                      ? base.peepAndFloorPlans.floorPlans.bySite(assignedBranchId)
                                      : base.peepAndFloorPlans.floorPlans.root
                            }
                            variant="contained"
                            color="primary"
                            startIcon={<Iconify icon="solar:layers-bold" />}
                        >
                            View Floor Plans
                        </Button>
                    </Stack>
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid xs={12} sm={6} md={3}>
                    {isSummaryCardsLoading ? (
                        <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
                    ) : (
                        <DataUsageSummaryCard
                            component="a"
                            href={base.residents.root}
                            title="Residents With PEEP"
                            total={resolvedTotalWithRecord}
                            color="success"
                            icon="solar:users-group-rounded-bold-duotone"
                            sx={{ textDecoration: 'none' }}
                        />
                    )}
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                    {isSummaryCardsLoading ? (
                        <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
                    ) : (
                        <DataUsageSummaryCard
                            title="High PEEP"
                            total={highPeepCount}
                            color="error"
                            icon="solar:danger-triangle-bold-duotone"
                        />
                    )}
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                    {isSummaryCardsLoading ? (
                        <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
                    ) : (
                        <DataUsageSummaryCard
                            title={thirdCardTitle}
                            total={thirdCardTotal}
                            color="success"
                            icon="solar:layers-bold-duotone"
                        />
                    )}
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                    {isSummaryCardsLoading ? (
                        <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
                    ) : (
                        <DataUsageSummaryCard
                            title={fourthCardTitle}
                            total={fourthCardTotal}
                            color={fourthCardColor}
                            icon={fourthCardIcon}
                        />
                    )}
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
                                {isLoading || isFetching ? (
                                    <TableBodySkeleton
                                        rowCount={table.rowsPerPage}
                                        cellCount={TABLE_HEAD.length}
                                        dense={table.dense}
                                    />
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

                                        <TableNoData
                                            notFound={!paginatedRows.length}
                                            title={
                                                !ownerDashboard && !assignedBranchId
                                                    ? 'Your assigned site could not be determined'
                                                    : 'No sites found'
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