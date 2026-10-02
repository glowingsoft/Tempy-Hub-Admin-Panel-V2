import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { TableHeadCustom, TablePaginationCustom, useTable } from 'src/components/table';
// import { AttendanceStatusChip } from './attendance-status-chip';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomTabs } from 'src/components/custom-tabs';
import { paths } from 'src/routes/paths';
import { Button } from '@mui/material';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';
import { useSetState } from 'src/hooks/use-set-state';
import { useTabs } from 'src/hooks/use-tabs';
import { Scrollbar } from 'src/components/scrollbar';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { CONFIG } from 'src/config-global';
import TeamAttendanceTableRow from '../team-attendance-table-row';
import { TeamAttendanceShiftGrid } from '../team-attendance-shift-grid';
import { mockAttendanceResponse } from '../mocks/data';
import { getAttendanceSummary } from '../utils';
import { OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

const VIEW_TABS_OPTIONS = [
    { value: 'shift', label: 'Shift view', icon: 'solar:calendar-bold' },
    { value: 'table', label: 'Table', icon: 'solar:list-bold' },
];


// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'onTime', label: 'On time' },
    { value: 'late', label: 'Late' },
];

const TABLE_HEAD = [
    { id: "sr#", label: "Sr#" },
    { id: 'name', label: 'Name' },
    { id: 'date', label: 'Date', align: 'center', minWidth: 120 },
    { id: 'clockIn', label: 'Clock In', align: 'center', minWidth: 150 },
    { id: 'clockOut', label: 'Clock Out', align: 'center', minWidth: 150 },
    { id: 'breakIn', label: 'Break In', align: 'center', minWidth: 150 },
    { id: 'breakOut', label: 'Break Out', align: 'center', minWidth: 150 },
    { id: 'total', label: 'Total', align: "center", minWidth: 150 },
    { id: 'status', label: 'Status', align: "center" },
];

// ----------------------------------------------------------------------


const FILTER_FIELDS = [
    createFilterField.status({
        options: STATUS_OPTIONS,
        showCount: true
    }),

    createFilterField.search({
        placeholder: 'Search ...',
    }),

    createFilterField.dateRange({ key: 'dateRange' }),
];

// The Shift view reuses the exact same Start/End Date toolbar fields, but a
// "week" is what the grid actually renders — picking either date snaps the
// other one to keep a 7-day span.
const WEEK_RANGE_FILTER_FIELDS = [createFilterField.dateRange({ key: 'dateRange' })];

const isWithinRange = (workDate, startDate, endDate) => {
    const date = dayjs(workDate);
    if (startDate && date.isBefore(startDate, 'day')) return false;
    if (endDate && date.isAfter(endDate, 'day')) return false;
    return true;
};


export function TeamAttendanceListView({ ownerDashboard = false }) {

    const table = useTable();

    const tabs = useTabs('shift');

    const { branchId, onBranchChange } = useOwnerBranchFilter();
    const records = mockAttendanceResponse.data;
    const meta = mockAttendanceResponse.meta;
    const isLoading = false;
    const isFetching = false;
    const isError = false;

    // Mock data lives on fixed historic dates, so default both date filters to
    // the span the data actually covers instead of "today" — otherwise the
    // page would load empty. A real API would default this to "this week".
    // `records` is the same module-level array every render, so this is a
    // plain calculation rather than a memo.
    const earliestWorkDate = records
        .map((record) => dayjs(record.workDate))
        .sort((a, b) => a - b)[0] || dayjs();

    const filters = useSetState({
        name: "",
        status: 'all',
        dateRange: { startDate: null, endDate: null },
    });

    const [weekRange, setWeekRange] = useState(() => ({
        startDate: earliestWorkDate,
        endDate: earliestWorkDate.add(6, 'day'),
    }));

    const scopedRecords = useMemo(
        () => records.filter((record) => !ownerDashboard || branchId === 'all' || record.branchId === branchId),
        [branchId, ownerDashboard, records]
    );

    const summary = useMemo(() => getAttendanceSummary(scopedRecords), [scopedRecords]);

    const shiftRecords = useMemo(
        () =>
            scopedRecords.filter((record) =>
                isWithinRange(record.workDate, weekRange.startDate, weekRange.endDate)
            ),
        [scopedRecords, weekRange]
    );

    const handleWeekRangeChange = useCallback((key, value) => {
        const startChanged = value.startDate && !dayjs(value.startDate).isSame(weekRange.startDate, 'day');

        setWeekRange(
            startChanged
                ? { startDate: value.startDate, endDate: dayjs(value.startDate).add(6, 'day') }
                : { startDate: dayjs(value.endDate).subtract(6, 'day'), endDate: value.endDate }
        );
    }, [weekRange.startDate]);

    const getStatusCount = useCallback((status) => {
        return scopedRecords.filter(
            (record) => status === 'all' || record.punctualityStatus === status
        ).length;
    },
        [scopedRecords]
    );


    const statusFilterField = useMemo(() => FILTER_FIELDS.find((f) => f.type === 'status'), []);

    const toolbarFilterFields = useMemo(() => FILTER_FIELDS.filter((f) => f.type !== 'status'), []);



    const handleFilterChange = useCallback((key, value) => {
        table.onResetPage();
        filters.setState({ [key]: value });
    }, [filters, table]);

    const handleSearchChange = useCallback((event) => {
        table.onResetPage();
        filters.setState({ name: event.target.value });
    }, [filters, table]);

    const filteredRecords = useMemo(() => {
        const search = filters.state.name.trim().toLowerCase();
        const { startDate, endDate } = filters.state.dateRange;
        return scopedRecords.filter((record) => {
            const matchesStatus = filters.state.status === 'all' || record.punctualityStatus === filters.state.status;
            const matchesName = !search || record.staff?.name?.toLowerCase().includes(search) || record.staff?.email?.toLowerCase().includes(search);
            const matchesDate = isWithinRange(record.workDate, startDate, endDate);
            return matchesStatus && matchesName && matchesDate;
        });
    }, [filters.state.name, filters.state.status, filters.state.dateRange, scopedRecords]);

    // Chips for the Table view's active filters — same remove/clear-all UI the
    // rest of the app uses (FlexibleTableFiltersResult).
    const activeFilters = useMemo(() => {
        const list = [];

        if (filters.state.name) {
            list.push({ key: 'name', label: 'Search', value: filters.state.name });
        }

        if (filters.state.status !== 'all') {
            list.push({
                key: 'status',
                type: 'status',
                label: 'Status',
                value: filters.state.status,
                options: STATUS_OPTIONS,
            });
        }

        if (filters.state.dateRange.startDate || filters.state.dateRange.endDate) {
            const dateRangeField = FILTER_FIELDS.find((f) => f.type === 'dateRange');
            list.push({
                key: 'dateRange',
                type: 'dateRange',
                label: 'Dates',
                value: filters.state.dateRange,
                displayFormat: dateRangeField?.displayFormat,
            });
        }

        return list;
    }, [filters.state]);

    const canReset = activeFilters.length > 0;

    const handleRemoveFilter = useCallback((key) => {
        table.onResetPage();
        if (key === 'dateRange') {
            filters.setState({ dateRange: { startDate: null, endDate: null } });
        } else if (key === 'status') {
            filters.setState({ status: 'all' });
        } else if (key === 'name') {
            filters.setState({ name: '' });
        }
    }, [filters, table]);

    const handleResetAllFilters = useCallback(() => {
        table.onResetPage();
        filters.setState({ name: '', status: 'all', dateRange: { startDate: null, endDate: null } });
    }, [filters, table]);

    // Shift view: a week is always selected, so "resetting" it means going
    // back to the default week rather than clearing to nothing.
    const shiftActiveFilters = useMemo(() => {
        const isDefaultWeek = weekRange.startDate.isSame(earliestWorkDate, 'day');
        if (isDefaultWeek) return [];
        return [{
            key: 'dateRange',
            type: 'dateRange',
            label: 'Week',
            value: weekRange,
            displayFormat: WEEK_RANGE_FILTER_FIELDS[0].displayFormat,
        }];
    }, [weekRange, earliestWorkDate]);

    const handleResetWeekRange = useCallback(() => {
        setWeekRange({ startDate: earliestWorkDate, endDate: earliestWorkDate.add(6, 'day') });
    }, [earliestWorkDate]);

    return (

        <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>

            <CustomBreadcrumbs
                heading="Attendance"
                links={[
                    { name: 'Dashboard', href: ownerDashboard ? paths.owner.root : paths.lineManager.root },
                    { name: 'Attendance' },
                ]}
                action={
                    ownerDashboard ? (
                        <OwnerBranchFilterActions value={branchId} onChange={onBranchChange}>
                            <Button variant="outlined" startIcon={<Iconify icon="solar:export-bold" />} onClick={() => { }}>
                                Export to CSV
                            </Button>
                        </OwnerBranchFilterActions>
                    ) : (
                        <Button variant="outlined" startIcon={<Iconify icon="solar:export-bold" />} onClick={() => { }}>
                            Export to CSV
                        </Button>
                    )
                }
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid xs={12} sm={4}>
                    <CourseWidgetSummary
                        title="On time"
                        total={summary.onTime}
                        color="success"
                        icon={icon('ic-check')}
                    />
                </Grid>

                <Grid xs={12} sm={4}>
                    <CourseWidgetSummary
                        title="Late"
                        total={summary.late}
                        color="warning"
                        icon={icon('ic-clock')}
                    />
                </Grid>

                <Grid xs={12} sm={4}>
                    <CourseWidgetSummary
                        title="Attendance rate"
                        total={summary.attendanceRate === null ? '—' : `${summary.attendanceRate}%`}
                        color="info"
                        icon={icon('ic-analytics')}
                    />
                </Grid>
            </Grid>

            <CustomTabs
                value={tabs.value}
                onChange={tabs.onChange}
                sx={{ mb: 2, borderRadius: 1, maxWidth: 340 }}
            >
                {VIEW_TABS_OPTIONS.map((tab) => (
                    <Tab
                        key={tab.value}
                        value={tab.value}
                        label={tab.label}
                        icon={<Iconify icon={tab.icon} width={18} />}
                        iconPosition="start"
                    />
                ))}
            </CustomTabs>

            {tabs.value === 'shift' && (
                <Card>
                    <FlexibleTableToolbar
                        filterFields={WEEK_RANGE_FILTER_FIELDS}
                        filterValues={{ dateRange: weekRange }}
                        onFilterChange={handleWeekRangeChange}
                    />

                    {!!shiftActiveFilters.length && (
                        <FlexibleTableFiltersResult
                            activeFilters={shiftActiveFilters}
                            totalResults={shiftRecords.length}
                            onResetFilters={handleResetWeekRange}
                            onRemoveFilter={handleResetWeekRange}
                            sx={{ p: 2.5, pt: 0 }}
                        />
                    )}

                    <TeamAttendanceShiftGrid records={shiftRecords} />
                </Card>
            )}

            {tabs.value === 'table' && (
            <Card>

                <StatusTabsFilterWrapper
                    filterField={statusFilterField}
                    value={filters.state.status}
                    onChange={handleFilterChange}
                    getCount={getStatusCount}
                />

                <FlexibleTableToolbar
                    filterFields={toolbarFilterFields}
                    filterValues={filters.state}
                    onFilterChange={handleFilterChange}
                    onSearchChange={handleSearchChange}
                />

                {canReset && (
                    <FlexibleTableFiltersResult
                        activeFilters={activeFilters}
                        totalResults={filteredRecords.length}
                        onResetFilters={handleResetAllFilters}
                        onRemoveFilter={handleRemoveFilter}
                        sx={{ p: 2.5, pt: 0 }}
                    />
                )}

                <TableContainer>
                    <Scrollbar>
                        <Table size={table.dense ? 'small' : 'medium'}>

                            <TableHeadCustom headLabel={TABLE_HEAD} />

                            <TableBody>
                                {(isLoading || isFetching) ? <TableRowLoading /> : filteredRecords.map((row, index) => (
                                    <TeamAttendanceTableRow
                                        key={row._id}
                                        row={row}
                                        serialNumber={table.page * table.rowsPerPage + index + 1}
                                    />
                                ))}
                                {!isLoading && !isFetching && !filteredRecords.length && <TableRowEmpty title={isError ? 'Unable to load attendance records' : 'No attendance records found'} />}
                            </TableBody>
                        </Table>


                    </Scrollbar>
                    <TablePaginationCustom
                        page={table.page}
                        count={filteredRecords.length}
                        dense={table.dense}
                        rowsPerPage={table.rowsPerPage}
                        onPageChange={table.onChangePage}
                        onRowsPerPageChange={table.onChangeRowsPerPage}
                        onChangeDense={table.onChangeDense}
                    />
                </TableContainer>

            </Card>
            )}
        </Box>
    );
}

function TableRowLoading() {
    return <TableRow><TableCell colSpan={TABLE_HEAD.length}><Typography sx={{ py: 3, textAlign: 'center' }}>Loading attendance...</Typography></TableCell></TableRow>;
}

function TableRowEmpty({ title }) {
    return <TableRow><TableCell colSpan={TABLE_HEAD.length}><Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>{title}</Typography></TableCell></TableRow>;
}

export const TableInfo = ({ icon, color, value }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            minWidth: 90,
        }}
    >
        <Label color={color} sx={{ borderRadius: 1 }}>
            <Iconify icon={icon} width={16} />
        </Label>

        <Typography variant="body2">
            {value}
        </Typography>
    </Box>
);