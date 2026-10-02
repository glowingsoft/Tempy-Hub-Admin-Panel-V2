import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';

import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { mockBranches } from 'src/sections/branch/mocks/data';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';
import {
    ALL_BRANCHES_VALUE,
    OwnerBranchFilterActions,
} from 'src/sections/branch/owner-branch-select';
import { PEEP_RECORDS } from 'src/sections/peep-records/mocks/data';
import { getFloorPlanCoverage, mockFloors } from 'src/sections/floor-plans/mocks/data';
import { DataUsageSummaryCard } from 'src/sections/data-usage/data-usage-summary-card';

import { OrgRollupSiteTableRow } from '../org-rollup-site-table-row';

// ----------------------------------------------------------------------

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

const TABLE_HEAD = [
    { id: 'sr', label: 'Sr#', width: 60 },
    { id: 'site', label: 'Site', minWidth: 200 },
    { id: 'residents', label: 'Residents', width: 100, align: 'center' },
    { id: 'low', label: 'Low', width: 80, align: 'center' },
    { id: 'medium', label: 'Medium', width: 90, align: 'center' },
    { id: 'high', label: 'High', width: 80, align: 'center' },
    { id: 'floors', label: 'Floor Plans', minWidth: 160 },
    { id: 'actions', label: 'Actions', width: 90, align: 'center' },
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
    const table = useTable({ defaultOrderBy: 'name' });

    const { user } = useSelector((state) => state.user);
    const organizationId = getOwnerOrganizationId(user);

    const base = ownerDashboard ? paths.owner : paths.siteManager;

    const handleSiteChange = useCallback(
        (nextBranchId) => {
            if (nextBranchId && nextBranchId !== ALL_BRANCHES_VALUE) {
                router.push(base.peepAndFloorPlans.site(nextBranchId));
            }
        },
        [router, base]
    );

    const filters = useSetState({ search: '' });
    const keyword = useDebounce(filters.state.search, 300);

    // --- Org-wide summary cards ----------------------------------------------

    const totalWithRecord = PEEP_RECORDS.length;
    const highPeepCount = PEEP_RECORDS.filter((record) => record.peepLevel === 'high').length;
    const { totalSites, sitesWithPlan, sitesWithoutPlan } = useMemo(() => getFloorPlanCoverage(), []);

    // --- Per-site aggregates (residents by level, floor-plan status) ---------

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

    const sites = useMemo(() => {
        const orgSites = mockBranches.filter(
            (branch) => !organizationId || branch.organizationId === organizationId
        );
        return ownerDashboard
            ? orgSites
            : orgSites.filter((branch) => branch.name === SITE_MANAGER_HERO_SITE_NAME);
    }, [organizationId, ownerDashboard]);

    const siteRows = useMemo(
        () =>
            sites.map((site) => ({
                site,
                levels: levelCountsBySite.get(site._id) || EMPTY_LEVELS,
                floorsSummary: floorSummaryBySite.get(site._id) || EMPTY_FLOORS,
            })),
        [sites, levelCountsBySite, floorSummaryBySite]
    );

    // Site Manager cards 3 & 4 report floors for their hero site rather than
    // "sites with a plan" (which is meaningless once the table is one site).
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

    const thirdCardTitle = ownerDashboard ? 'Sites With Plans' : 'No of floors';
    const thirdCardTotal = ownerDashboard
        ? (totalSites ? `${sitesWithPlan} of ${totalSites}` : '0 of 0')
        : siteFloorTotals.total;

    const missingFloorPlans = Math.max(siteFloorTotals.total - siteFloorTotals.uploaded, 0);
    const fourthCardMissing = ownerDashboard ? sitesWithoutPlan : missingFloorPlans;
    const fourthCardTitle = fourthCardMissing > 0
        ? (fourthCardMissing === 1 ? 'No Floor Plan' : 'No Floor Plans')
        : (ownerDashboard ? 'All Plans Uploaded' : 'Plan uploaded'); 1
    const fourthCardTotal = fourthCardMissing > 0 ? fourthCardMissing : (ownerDashboard ? 0 : siteFloorTotals.uploaded);

    // --- All-sites table (search + pagination) --------------------------------

    const filteredRows = useMemo(() => {
        const search = keyword.trim().toLowerCase();
        return siteRows.filter((row) => !search || row.site.name.toLowerCase().includes(search));
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
                action={<OwnerBranchFilterActions value={ALL_BRANCHES_VALUE} onChange={handleSiteChange} />}
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
                        title={ownerDashboard ? 'Sites With Plans' : 'Number of floors'}
                        total={ownerDashboard
                            ? (totalSites ? `${sitesWithPlan} of ${totalSites}` : '0 of 0')
                            : siteFloorTotals.total}
                        color="success"
                        icon="solar:layers-bold-duotone"
                    />
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                    <DataUsageSummaryCard
                        title={ownerDashboard
                            ? (sitesWithoutPlan > 0
                                ? sitesWithoutPlan === 1
                                    ? 'No Floor Plan'
                                    : 'No Floor Plans'
                                : 'All Plans Uploaded')
                            : 'Plans Uploaded'}
                        total={ownerDashboard ? sitesWithoutPlan : siteFloorTotals.uploaded}
                        color={ownerDashboard ? (sitesWithoutPlan > 0 ? 'error' : 'success') : 'success'}
                        icon="solar:folder-error-bold-duotone"
                        sx={
                            ownerDashboard && sitesWithoutPlan > 0
                                ? { bgcolor: 'error.lighter', border: '1px solid', borderColor: 'error.light' }
                                : undefined
                        }
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
                        <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1020 }}>
                            <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={TABLE_HEAD} />

                            <TableBody>
                                {paginatedRows.map((row, index) => (
                                    <OrgRollupSiteTableRow
                                        key={row.site._id}
                                        row={row}
                                        serialNumber={table.page * table.rowsPerPage + index + 1}
                                        onSelect={() => router.push(base.peepAndFloorPlans.site(row.site._id))}
                                    />
                                ))}

                                <TableNoData notFound={!paginatedRows.length} title="No sites found" />
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
