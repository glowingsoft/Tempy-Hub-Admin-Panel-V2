import { useMemo, useState } from 'react';

import { Box, Button, Grid, Stack, Typography } from '@mui/material';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import dayjs from 'dayjs';
import { CONFIG } from 'src/config-global';
import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import {
    getPeriodPresetRange,
    ORG_LATE_CHECKINS,
    ORG_SICKNESS_RATE,
    REPORT_CONFIG,
    REPORT_TYPES,
    totalHoursWorked,
    weeklyAttendanceChart,
    weeklyAttendanceData,
} from '../mocks/data';
import { ReportChart } from '../report-chart';
import { ReportTable } from '../report-table';
import { ReportToolbar } from '../report-toolbar';
import { ReportsTabs } from '../reports-tabs';
import { paths } from 'src/routes/paths';
import { OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';
import VisitorsCheckTab from '../visitors-check';
import StaffHourSummary from '../staff-hour-summary';
import LateArrivalLog from '../late-arrival-log';
import SicknessRateTab from '../sickness-rate';

// ----------------------------------------------------------------------

const SAVED_REPORTS = [
    REPORT_TYPES.ATTENDANCE,
    REPORT_TYPES.VISITOR_CHECKINS,
    REPORT_TYPES.STAFF_HOURS,
    REPORT_TYPES.LATE_ARRIVALS,
    REPORT_TYPES.SICKNESS_RATE,
];

// ----------------------------------------------------------------------

export function ReportsView({ ownerDashboard = false }) {
    const { branchId, onBranchChange } = useOwnerBranchFilter();
    const [selectedReport, setSelectedReport] = useState(
        REPORT_TYPES.ATTENDANCE
    );

    const [filters, setFilters] = useState({
        periodPreset: 'custom',
        startDate: dayjs(new Date()),
        endDate: dayjs(new Date()),
        department: 'all',
    });

    const selectedConfig = useMemo(
        () => REPORT_CONFIG[selectedReport],
        [selectedReport]
    );

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Switching to a preset (anything but "Custom range") computes the
    // start/end date for the caller instead of requiring manual picking.
    const handlePeriodPresetChange = (preset) => {
        const range = getPeriodPresetRange(preset);
        setFilters((prev) => ({
            ...prev,
            periodPreset: preset,
            ...(range || {}),
        }));
    };

    const handleExportCSV = () => {
        console.log('Export CSV', selectedReport, filters);
    };

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
                        <OwnerBranchFilterActions value={branchId} onChange={onBranchChange} />
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

                        {/* Filters bar — shared across every report tab so the date
                            range / period preset / department selection carries
                            over when switching tabs. */}
                        <ReportToolbar
                            startDate={filters.startDate}
                            endDate={filters.endDate}
                            department={filters.department}
                            periodPreset={filters.periodPreset}
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
                                    <Grid item xs={12} md={4}>
                                        <CourseWidgetSummary
                                            title="Total hours worked"
                                            total={`${totalHoursWorked}h`}
                                            color="primary"
                                            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-job.svg`}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <CourseWidgetSummary
                                            title="Late check-ins"
                                            total={ORG_LATE_CHECKINS}
                                            color="warning"
                                            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-clock.svg`}
                                            onClick={() => setSelectedReport(REPORT_TYPES.LATE_ARRIVALS)}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <CourseWidgetSummary
                                            title="Sickness rate"
                                            total={`${ORG_SICKNESS_RATE}%`}
                                            color="error"
                                            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-rate.svg`}
                                            onClick={() => setSelectedReport(REPORT_TYPES.SICKNESS_RATE)}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </Grid>
                                </Grid>
                                <ReportChart chart={weeklyAttendanceChart} />
                                <ReportTable data={weeklyAttendanceData} title="Attendance List" icon="solar:login-2-bold-duotone" />
                            </>
                        )}

                        {selectedReport === REPORT_TYPES.VISITOR_CHECKINS && (
                            <VisitorsCheckTab />
                        )}

                        {selectedReport === REPORT_TYPES.STAFF_HOURS && (
                            <StaffHourSummary onNavigate={setSelectedReport} />
                        )}

                        {selectedReport === REPORT_TYPES.LATE_ARRIVALS && (
                            <LateArrivalLog />
                        )}

                        {selectedReport === REPORT_TYPES.SICKNESS_RATE && (
                            <SicknessRateTab />
                        )}

                    </Stack>
                </Box>
            </Stack>
        </DashboardContent>
    );
}