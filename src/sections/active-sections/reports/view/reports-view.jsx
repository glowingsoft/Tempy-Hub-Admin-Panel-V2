import { useMemo, useState, useCallback } from 'react';

import { Box, Button, Grid, Stack, Typography, InputAdornment, Skeleton } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import dayjs from 'dayjs';
import { CONFIG } from 'src/config-global';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { useTable } from 'src/components/table';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useAuthContext } from 'src/auth/hooks';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import {
    useGetAttendanceReportQuery,
    useGetStaffHoursReportQuery,
} from 'src/store/Reducer/reports-api';
import {
    getPeriodPresetRange,
    REPORT_CONFIG,
    REPORT_TYPES,
} from '../mocks/data';
import { ReportChart } from '../report-chart';
import { ReportTable, formatWorkedTime } from '../report-table';
import { ReportToolbar } from '../report-toolbar';
import { ReportsTabs } from '../reports-tabs';
import { paths } from 'src/routes/paths';
import { toast } from 'src/components/snackbar';
import { exportToCSV } from 'src/utils/export-helper';
import VisitorsCheckTab from '../visitors-check';
import { formatMethod } from '../visitor-table';
import StaffHourSummary from '../staff-hour-summary';
import LateArrivalLog from '../late-arrival-log';
import SicknessRateTab from '../sickness-rate';

// ----------------------------------------------------------------------

const EXTRA_BRANCH_OPTIONS = [{ value: 'all', label: 'All sites' }];
const mapBranchOption = (item) => ({ value: item._id, label: item.name });
const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SAVED_REPORTS = [
    REPORT_TYPES.ATTENDANCE,
    REPORT_TYPES.VISITOR_CHECKINS,
    REPORT_TYPES.STAFF_HOURS,
    REPORT_TYPES.LATE_ARRIVALS,
    REPORT_TYPES.SICKNESS_RATE,
];

// ----------------------------------------------------------------------

export function ReportsView({ ownerDashboard = false }) {
    const { organizationId } = useCurrentOrganization();
    const { user } = useAuthContext();
    const table = useTable({ defaultDense: true, defaultRowsPerPage: 10 });

    const [selectedBranch, setSelectedBranch] = useState({ value: 'all', label: 'All sites' });
    const [selectedReport, setSelectedReport] = useState(REPORT_TYPES.ATTENDANCE);

    const [filters, setFilters] = useState(() => {
        const range = getPeriodPresetRange('this_week');
        return {
            periodPreset: 'this_week',
            startDate: range?.startDate || dayjs().startOf('week'),
            endDate: range?.endDate || dayjs().endOf('week'),
            department: 'all',
        };
    });

    const [visitorExportData, setVisitorExportData] = useState(null);
    const [sicknessExportData, setSicknessExportData] = useState(null);
    const [lateExportData, setLateExportData] = useState(null);

    const userBranchId =
        user?.branchId?._id ||
        user?.branchId ||
        (typeof user?.branch === 'object' ? user?.branch?._id : user?.branch);

    const activeBranchId = ownerDashboard
        ? (selectedBranch?.value && selectedBranch.value !== 'all' ? selectedBranch.value : undefined)
        : userBranchId;

    const fromDate = filters.startDate ? dayjs(filters.startDate).format('YYYY-MM-DD') : undefined;
    const toDate = filters.endDate ? dayjs(filters.endDate).format('YYYY-MM-DD') : undefined;
    const departmentId =
        filters.department && filters.department !== 'all' ? filters.department : undefined;

    const {
        data: attendanceResponse,
        isLoading: isReportLoading,
        isFetching: isReportFetching,
        refetch,
    } = useGetAttendanceReportQuery(
        {
            organizationId,
            branchId: activeBranchId,
            page: table.page + 1,
            limit: table.rowsPerPage,
            from: fromDate,
            to: toDate,
            departmentId,
            periodPreset: filters.periodPreset,
        },
        { skip: !organizationId || selectedReport !== REPORT_TYPES.ATTENDANCE }
    );

    const {
        data: staffHoursResponse,
        isLoading: isStaffHoursLoading,
        isFetching: isStaffHoursFetching,
        refetch: refetchStaffHours,
    } = useGetStaffHoursReportQuery(
        {
            organizationId,
            branchId: activeBranchId,
            page: 1,
            limit: 10,
            from: fromDate,
            to: toDate,
            departmentId,
            periodPreset: filters.periodPreset,
        },
        { skip: !organizationId || selectedReport !== REPORT_TYPES.STAFF_HOURS }
    );

    const reportData = attendanceResponse?.data;
    const staffHoursData = staffHoursResponse?.data;

    const selectedConfig = useMemo(
        () => REPORT_CONFIG[selectedReport],
        [selectedReport]
    );

    const handleFilterChange = (key, value) => {
        table.onResetPage();
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleBranchChange = (newBranch) => {
        table.onResetPage();
        setSelectedBranch(newBranch || { value: 'all', label: 'All sites' });
    };

    // Switching to a preset (anything but "Custom range") computes the
    // start/end date for the caller instead of requiring manual picking.
    const handlePeriodPresetChange = (preset) => {
        table.onResetPage();
        const range = getPeriodPresetRange(preset);
        setFilters((prev) => ({
            ...prev,
            periodPreset: preset,
            ...(range || {}),
        }));
        setTimeout(() => {
            if (selectedReport === REPORT_TYPES.ATTENDANCE) {
                refetch();
            } else if (selectedReport === REPORT_TYPES.STAFF_HOURS) {
                refetchStaffHours();
            }
        }, 0);
    };

    const handleExportCSV = () => {
        if (selectedReport === REPORT_TYPES.VISITOR_CHECKINS) {
            const visitorRows = visitorExportData?.rows || [];
            if (!visitorRows.length) {
                toast.info('No visitor check-in records to export');
                return;
            }

            const csvData = visitorRows.map((row, index) => {
                const person = row.person || {};
                const checkInTime = row.checkInAt || row.arrivedAt;
                const checkOutTime = row.checkOutAt;

                return {
                    'Sr#': index + 1,
                    'Name': person.name || row.hostName || 'Walk-in Visitor',
                    'Email': person.email || '—',
                    'Phone': person.phone || '—',
                    'Type':
                        row.personType === 'contractor' || person.type === 'contractor'
                            ? 'Contractor'
                            : 'Visitor',
                    'Site': row.branch?.name || '—',
                    'Host Staff': row.hostName || '—',
                    'Check In': checkInTime ? dayjs(checkInTime).format('DD/MM/YYYY h:mm a') : '—',
                    'Check Out': checkOutTime ? dayjs(checkOutTime).format('DD/MM/YYYY h:mm a') : '—',
                    'Method': formatMethod(row.method),
                    'Reason for Visit': row.purposeOfVisit || row.reasonForVisit || '—',
                    'Car Registration': person.carRegistration || '—',
                    'Status': row.status || '—',
                };
            });

            exportToCSV(csvData, `visitor-check-ins-${fromDate || 'start'}_to_${toDate || 'end'}.csv`);
            return;
        }

        if (selectedReport === REPORT_TYPES.SICKNESS_RATE) {
            const sicknessRows = sicknessExportData?.rows || [];
            if (!sicknessRows.length) {
                toast.info('No sickness records to export');
                return;
            }

            const csvData = sicknessRows.map((row, index) => {
                const staff = row.staff || {};
                const days = row.days || row.dates || [];
                const daysBreakdown = days
                    .map((d) => `${d.date}: ${d.reason || d.leaveTypeLabel || 'Sick'}`)
                    .join('; ');

                return {
                    'Sr#': index + 1,
                    'Employee Name': staff.name || row.name || '—',
                    'Employee Email': staff.email || row.email || '—',
                    'Employee Code': staff.employeeCode || row.employeeCode || '—',
                    'Department': staff.department?.name || row.department || '—',
                    'Sick Days': row.sickDays ?? 0,
                    'Leave Type': row.leaveTypeLabel || row.leaveType || '—',
                    'Days Breakdown': daysBreakdown || '—',
                };
            });

            exportToCSV(csvData, `sickness-rate-report-${fromDate || 'start'}_to_${toDate || 'end'}.csv`);
            return;
        }

        if (selectedReport === REPORT_TYPES.LATE_ARRIVALS) {
            const lateRows = lateExportData?.rows || [];
            if (!lateRows.length) {
                toast.info('No late check-in records to export');
                return;
            }

            const csvData = lateRows.map((row, index) => {
                const staff = row.staff || {};
                const workDate = row.workDate || row.date;
                const clockIn = row.clockInAt || row.checkIn;

                return {
                    'Sr#': index + 1,
                    'Name': staff.name || row.name || '—',
                    'Email': staff.email || row.email || '—',
                    'Employee Code': staff.employeeCode || row.employeeCode || '—',
                    'Type':
                        row.type === 'contractor' || row.personType === 'contractor'
                            ? 'Contractor'
                            : 'Staff',
                    'Site': row.branch?.name || '—',
                    'Date': workDate ? dayjs(workDate).format('DD/MM/YYYY') : '—',
                    'Clock In': clockIn ? dayjs(clockIn).format('DD/MM/YYYY h:mm a') : '—',
                    'Method': formatMethod(row.checkInMethod || row.method),
                    'Status': row.presenceStatus || row.punctualityStatus || row.status || '—',
                };
            });

            exportToCSV(csvData, `late-check-ins-${fromDate || 'start'}_to_${toDate || 'end'}.csv`);
            return;
        }

        if (selectedReport === REPORT_TYPES.STAFF_HOURS) {
            if (!staffHoursData) {
                toast.info('No staff hours summary data to export');
                return;
            }
            const kpisData = staffHoursData.kpis || {};
            const hoursByType = staffHoursData.hoursByPersonType || {};
            const checkIns = staffHoursData.checkInMethod || {};

            const csvData = [
                { Category: 'Date Range', Metric: 'From', Value: staffHoursData.from || fromDate || '—' },
                { Category: 'Date Range', Metric: 'To', Value: staffHoursData.to || toDate || '—' },
                {
                    Category: 'KPI',
                    Metric: 'Total Worked Hours',
                    Value: `${kpisData.workedMinutes ? (kpisData.workedMinutes / 60).toFixed(1) : 0}h`,
                },
                { Category: 'KPI', Metric: 'Visitor Sign-ins', Value: kpisData.visitorSignIns ?? 0 },
                { Category: 'KPI', Metric: 'Late Check-ins', Value: kpisData.lateCount ?? 0 },
                { Category: 'KPI', Metric: 'Sickness Rate', Value: `${kpisData.sicknessRate ?? 0}%` },
                {
                    Category: 'Hours by User Type',
                    Metric: 'Staff',
                    Value: `${((hoursByType.staff || 0) / 60).toFixed(1)}h`,
                },
                {
                    Category: 'Hours by User Type',
                    Metric: 'Visitors',
                    Value: `${((hoursByType.visitor || 0) / 60).toFixed(1)}h`,
                },
                {
                    Category: 'Hours by User Type',
                    Metric: 'Residents',
                    Value: `${((hoursByType.resident || 0) / 60).toFixed(1)}h`,
                },
                {
                    Category: 'Hours by User Type',
                    Metric: 'Contractors',
                    Value: `${((hoursByType.contractor || 0) / 60).toFixed(1)}h`,
                },
                { Category: 'Check-in Method', Metric: 'Kiosk', Value: checkIns.kiosk ?? 0 },
                { Category: 'Check-in Method', Metric: 'Phone', Value: checkIns.phone ?? 0 },
                { Category: 'Check-in Method', Metric: 'Manual', Value: checkIns.manual ?? 0 },
                { Category: 'Check-in Method', Metric: 'QR Code', Value: checkIns.qr ?? 0 },
                { Category: 'Check-in Method', Metric: 'NFC', Value: checkIns.nfc ?? 0 },
            ];

            exportToCSV(csvData, `staff-hours-summary-${fromDate || 'start'}_to_${toDate || 'end'}.csv`);
            return;
        }

        if (!attendanceList.length) {
            toast.info('No attendance records to export');
            return;
        }

        const csvData = attendanceList.map((row, index) => {
            const staff = row.staff || {};
            const scheduled = row.scheduled ?? row.shiftsScheduled ?? 0;
            const worked = row.worked ?? row.shiftsWorked ?? 0;
            const variance = row.variance ?? (worked - scheduled);
            const lateCount = row.lateCount ?? 0;
            const workedMinutes = row.workedMinutes ?? (row.hours ? row.hours * 60 : 0);

            return {
                'Sr#': index + 1,
                'Employee Name': staff.name || row.name || '—',
                'Employee Email': staff.email || row.email || '—',
                'Employee Code': staff.employeeCode || row.employeeCode || '—',
                'Department': staff.department?.name || row.department || '—',
                'Scheduled': scheduled,
                'Worked': worked,
                'Variance': variance,
                'Late Count': lateCount,
                'Worked Hours': formatWorkedTime(workedMinutes),
            };
        });

        exportToCSV(csvData, `attendance-report-${fromDate || 'start'}_to_${toDate || 'end'}.csv`);
    };

    // KPI Summary
    const kpis = reportData?.kpis;
    const hoursDisplay = useMemo(() => {
        if (typeof kpis?.workedMinutes === 'number') {
            const h = kpis.workedMinutes / 60;
            return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`;
        }
        return '0h';
    }, [kpis?.workedMinutes]);
    const lateCheckInsCount = kpis?.lateCount ?? 0;
    const sickDaysCount = kpis?.sickDays ?? 0;
    const sicknessRateDisplay = kpis?.sicknessRate != null ? `${kpis.sicknessRate}%` : '0%';

    // Dynamic Chart Title & Subheader
    const chartTitle = useMemo(() => {
        switch (filters.periodPreset) {
            case 'this_week':
                return 'Weekly attendance';
            case 'this_month':
                return 'Monthly attendance';
            case 'pay_period_4wk':
                return '4-Weekly pay period attendance';
            case 'custom':
            default: {
                if (filters.startDate && filters.endDate) {
                    const diffDays =
                        dayjs(filters.endDate).diff(dayjs(filters.startDate), 'day') + 1;
                    return `Attendance (${diffDays} day${diffDays === 1 ? '' : 's'})`;
                }
                return 'Attendance overview';
            }
        }
    }, [filters.periodPreset, filters.startDate, filters.endDate]);

    const chartSubheader = useMemo(() => {
        if (!filters.startDate || !filters.endDate) return undefined;
        return `${dayjs(filters.startDate).format('DD MMM YYYY')} – ${dayjs(filters.endDate).format('DD MMM YYYY')}`;
    }, [filters.startDate, filters.endDate]);

    // Attendance Chart
    const attendanceChart = useMemo(() => {
        const start = filters.startDate ? dayjs(filters.startDate) : dayjs().startOf('week');
        const end = filters.endDate ? dayjs(filters.endDate) : dayjs().endOf('week');

        // Build weekday lookup map from API (weekday 1=Mon ... 7=Sun)
        const weekdayMap = {};
        if (Array.isArray(reportData?.weekly)) {
            reportData.weekly.forEach((w) => {
                weekdayMap[w.weekday] = {
                    scheduled: w.scheduled ?? 0,
                    worked: w.worked ?? 0,
                };
            });
        }

        // Build explicit daily map if API returns it
        const dailyApiMap = {};
        const apiDailyList = reportData?.daily || reportData?.days;
        if (Array.isArray(apiDailyList)) {
            apiDailyList.forEach((d) => {
                const key = dayjs(d.date).format('YYYY-MM-DD');
                dailyApiMap[key] = {
                    scheduled: d.scheduled ?? 0,
                    worked: d.worked ?? 0,
                };
            });
        }

        // 1. This Week: Exactly 7 days (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
        if (filters.periodPreset === 'this_week') {
            const categories = [];
            const scheduledData = [];
            const workedData = [];

            for (let i = 0; i < 7; i += 1) {
                const date = start.add(i, 'day');
                const dayOfWeek = date.day();
                const backendWeekday = dayOfWeek === 0 ? 7 : dayOfWeek;
                const stats =
                    dailyApiMap[date.format('YYYY-MM-DD')] ||
                    weekdayMap[backendWeekday] ||
                    { scheduled: 0, worked: 0 };

                categories.push(WEEKDAY_NAMES[backendWeekday - 1] || `Day ${backendWeekday}`);
                scheduledData.push(stats.scheduled);
                workedData.push(stats.worked);
            }

            return {
                categories,
                series: [
                    { name: 'Scheduled', data: scheduledData },
                    { name: 'Worked', data: workedData },
                ],
            };
        }

        // 2. This Month, 4-Weekly Pay Period, and Custom: Show all days in the period (e.g. 30 days for a month)
        const totalDays = Math.max(1, end.diff(start, 'day') + 1);
        const count = Math.min(totalDays, 62);
        const categories = [];
        const scheduledData = [];
        const workedData = [];

        for (let i = 0; i < count; i += 1) {
            const date = start.add(i, 'day');
            const dayOfWeek = date.day();
            const backendWeekday = dayOfWeek === 0 ? 7 : dayOfWeek;
            const stats =
                dailyApiMap[date.format('YYYY-MM-DD')] ||
                weekdayMap[backendWeekday] ||
                { scheduled: 0, worked: 0 };

            const label = count <= 7 ? WEEKDAY_NAMES[backendWeekday - 1] : date.format('DD MMM');
            categories.push(label);
            scheduledData.push(stats.scheduled);
            workedData.push(stats.worked);
        }

        return {
            categories,
            series: [
                { name: 'Scheduled', data: scheduledData },
                { name: 'Worked', data: workedData },
            ],
        };
    }, [reportData, filters.periodPreset, filters.startDate, filters.endDate]);

    // Attendance Table Rows
    const attendanceList = useMemo(() => {
        if (Array.isArray(reportData?.rows)) {
            return reportData.rows;
        }
        return [];
    }, [reportData?.rows]);

    const totalRecords = attendanceResponse?.meta?.totalRecords ?? attendanceList.length;

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Reports"
                links={[
                    { name: 'Dashboard', href: ownerDashboard ? paths.owner.root : paths.siteManager.root },
                    { name: 'Reports' },
                ]}
                action={
                    ownerDashboard ? (
                        <InfiniteAutocomplete
                            value={selectedBranch}
                            onChange={handleBranchChange}
                            useQuery={useGetBranchesQuery}
                            queryArgs={{ organizationId }}
                            mapOption={mapBranchOption}
                            extraOptions={EXTRA_BRANCH_OPTIONS}
                            label="Site"
                            placeholder="Search sites..."
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
                    ) : null
                }
                sx={{ mb: 3 }}
            />

            <Stack
                spacing={2}
                alignItems="flex-start"
            >
                {/* Sidebar */}
                <ReportsTabs
                    reports={SAVED_REPORTS}
                    selectedReport={selectedReport}
                    onSelectReport={setSelectedReport}
                />

                {/* Content */}
                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        width: '100%',
                    }}
                >
                    <Stack spacing={3}>
                        {/* Header */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: "space-between",
                            alignItems: { md: "center" },
                            flexDirection: { md: "row", xs: "column" }
                        }}>
                            <Box>
                                <Typography variant="h5">
                                    {selectedConfig.label}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                    }}
                                >
                                    {selectedConfig.description}
                                </Typography>
                            </Box>

                            <Stack direction={{ sm: "row", xs: "column" }} spacing={1}>
                                <Button
                                    variant="outlined"
                                    startIcon={
                                        <Iconify icon="solar:export-bold" />
                                    }
                                    onClick={handleExportCSV}
                                >
                                    Export CSV
                                </Button>
                            </Stack>
                        </Box>

                        {/* Filters bar */}
                        <ReportToolbar
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                            department={filters.department}
                            periodPreset={filters.periodPreset}
                            organizationId={organizationId}
                            branchId={activeBranchId}
                            onStartDateChange={(value) =>
                                handleFilterChange('startDate', value)
                            }
                            onEndDateChange={(value) =>
                                handleFilterChange('endDate', value)
                            }
                            onDepartmentChange={(value) =>
                                handleFilterChange('department', value)
                            }
                            onPeriodPresetChange={handlePeriodPresetChange}
                        />

                        {/* Report content */}
                        {selectedReport === REPORT_TYPES.ATTENDANCE && (
                            <>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        {isReportLoading || isReportFetching ? (
                                            <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                                        ) : (
                                            <CourseWidgetSummary
                                                title="Total hours worked"
                                                total={hoursDisplay}
                                                color="primary"
                                                icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-job.svg`}
                                            />
                                        )}
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        {isReportLoading || isReportFetching ? (
                                            <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                                        ) : (
                                            <CourseWidgetSummary
                                                title="Late check-ins"
                                                total={lateCheckInsCount}
                                                color="warning"
                                                icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-clock.svg`}
                                                onClick={() => setSelectedReport(REPORT_TYPES.LATE_ARRIVALS)}
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        )}
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        {isReportLoading || isReportFetching ? (
                                            <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                                        ) : (
                                            <CourseWidgetSummary
                                                title="Sick days"
                                                total={sickDaysCount}
                                                color="info"
                                                icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-calendar.svg`}
                                            />
                                        )}
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        {isReportLoading || isReportFetching ? (
                                            <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                                        ) : (
                                            <CourseWidgetSummary
                                                title="Sickness rate"
                                                total={sicknessRateDisplay}
                                                color="error"
                                                icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-rate.svg`}
                                                onClick={() => setSelectedReport(REPORT_TYPES.SICKNESS_RATE)}
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        )}
                                    </Grid>
                                </Grid>

                                <ReportChart
                                    title={chartTitle}
                                    subheader={chartSubheader}
                                    chart={attendanceChart}
                                    loading={isReportLoading || isReportFetching}
                                />

                                <ReportTable
                                    data={attendanceList}
                                    title="Attendance List"
                                    icon="solar:login-2-bold-duotone"
                                    count={totalRecords}
                                    page={table.page}
                                    rowsPerPage={table.rowsPerPage}
                                    dense={table.dense}
                                    onChangePage={table.onChangePage}
                                    onChangeRowsPerPage={table.onChangeRowsPerPage}
                                    onChangeDense={table.onChangeDense}
                                    loading={isReportLoading || isReportFetching}
                                />
                            </>
                        )}

                        {selectedReport === REPORT_TYPES.VISITOR_CHECKINS && (
                            <VisitorsCheckTab
                                organizationId={organizationId}
                                branchId={activeBranchId}
                                from={fromDate}
                                to={toDate}
                                departmentId={departmentId}
                                periodPreset={filters.periodPreset}
                                onDataLoaded={setVisitorExportData}
                            />
                        )}

                        {selectedReport === REPORT_TYPES.STAFF_HOURS && (
                            <StaffHourSummary
                                data={staffHoursData}
                                loading={isStaffHoursLoading || isStaffHoursFetching}
                                dateRangeSubheader={chartSubheader}
                                onNavigate={setSelectedReport}
                            />
                        )}

                        {selectedReport === REPORT_TYPES.LATE_ARRIVALS && (
                            <LateArrivalLog
                                organizationId={organizationId}
                                branchId={activeBranchId}
                                from={fromDate}
                                to={toDate}
                                departmentId={departmentId}
                                periodPreset={filters.periodPreset}
                                onDataLoaded={setLateExportData}
                            />
                        )}

                        {selectedReport === REPORT_TYPES.SICKNESS_RATE && (
                            <SicknessRateTab
                                organizationId={organizationId}
                                branchId={activeBranchId}
                                from={fromDate}
                                to={toDate}
                                departmentId={departmentId}
                                periodPreset={filters.periodPreset}
                                onDataLoaded={setSicknessExportData}
                            />
                        )}
                    </Stack>
                </Box>
            </Stack>
        </DashboardContent>
    );
}