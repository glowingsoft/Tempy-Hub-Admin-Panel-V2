import { useMemo } from 'react';
import { Grid, Skeleton } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { AnalyticsConversionRates } from 'src/sections/overview/analytics/analytics-conversion-rates';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';

import { REPORT_TYPES } from './mocks/data';

// ----------------------------------------------------------------------

const toHours = (mins) => Math.round(((mins || 0) / 60) * 10) / 10;

const StaffHourSummary = ({ data, loading = false, dateRangeSubheader, onNavigate }) => {
    const kpis = data?.kpis;
    const workedMinutes = kpis?.workedMinutes;

    const totalHoursWorkedFormatted = useMemo(() => {
        if (typeof workedMinutes === 'number') {
            const hoursVal = workedMinutes / 60;
            return hoursVal % 1 === 0 ? `${hoursVal}h` : `${hoursVal.toFixed(1)}h`;
        }
        return '0h';
    }, [workedMinutes]);

    const visitorSignIns = kpis?.visitorSignIns ?? 0;
    const lateCheckIns = kpis?.lateCount ?? 0;
    const sicknessRateFormatted = kpis?.sicknessRate != null ? `${kpis.sicknessRate}%` : '0%';

    const hoursByPerson = data?.hoursByPersonType ?? {};
    const userTypeCategories = useMemo(
        () => ['Staff', 'Visitors', 'Residents', 'Contractors'],
        []
    );
    const userTypeSeries = useMemo(
        () => [
            {
                name: 'Hours',
                data: [
                    toHours(hoursByPerson.staff),
                    toHours(hoursByPerson.visitor),
                    toHours(hoursByPerson.resident ?? 0),
                    toHours(hoursByPerson.contractor),
                ],
            },
        ],
        [hoursByPerson.staff, hoursByPerson.visitor, hoursByPerson.resident, hoursByPerson.contractor]
    );

    const checkInMethod = data?.checkInMethod ?? {};
    const checkInCategories = useMemo(
        () => ['Kiosk', 'Phone', 'Manual', 'QR Code', 'NFC'],
        []
    );
    const checkInSeries = useMemo(
        () => [
            {
                name: 'Check-ins',
                data: [
                    checkInMethod.kiosk ?? 0,
                    checkInMethod.phone ?? 0,
                    checkInMethod.manual ?? 0,
                    checkInMethod.qr ?? 0,
                    checkInMethod.nfc ?? 0,
                ],
            },
        ],
        [
            checkInMethod.kiosk,
            checkInMethod.phone,
            checkInMethod.manual,
            checkInMethod.qr,
            checkInMethod.nfc,
        ]
    );

    return (
        <Grid container spacing={3}>
            {/* KPI Cards */}
            <Grid item xs={12} md={3}>
                {loading ? (
                    <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                ) : (
                    <CourseWidgetSummary
                        title="Hour worked"
                        total={totalHoursWorkedFormatted}
                        color="primary"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-job.svg`}
                    />
                )}
            </Grid>

            <Grid item xs={12} md={3}>
                {loading ? (
                    <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                ) : (
                    <CourseWidgetSummary
                        title="Visitor sign-ins"
                        total={visitorSignIns}
                        color="primary"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                        onClick={() => onNavigate?.(REPORT_TYPES.VISITOR_CHECKINS)}
                        sx={{ cursor: onNavigate ? 'pointer' : 'default' }}
                    />
                )}
            </Grid>

            <Grid item xs={12} md={3}>
                {loading ? (
                    <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                ) : (
                    <CourseWidgetSummary
                        title="Late check-ins"
                        total={lateCheckIns}
                        color="warning"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-clock.svg`}
                        onClick={() => onNavigate?.(REPORT_TYPES.LATE_ARRIVALS)}
                        sx={{ cursor: onNavigate ? 'pointer' : 'default' }}
                    />
                )}
            </Grid>

            <Grid item xs={12} md={3}>
                {loading ? (
                    <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                ) : (
                    <CourseWidgetSummary
                        title="Sickness rate"
                        total={sicknessRateFormatted}
                        color="error"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-rate.svg`}
                        onClick={() => onNavigate?.(REPORT_TYPES.SICKNESS_RATE)}
                        sx={{ cursor: onNavigate ? 'pointer' : 'default' }}
                    />
                )}
            </Grid>

            {/* Hours by user type Chart */}
            <Grid item xs={12} md={6}>
                {loading ? (
                    <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 2 }} />
                ) : (
                    <AnalyticsConversionRates
                        title="Hours by user type"
                        subheader={dateRangeSubheader}
                        chart={{
                            categories: userTypeCategories,
                            series: userTypeSeries,
                        }}
                    />
                )}
            </Grid>

            {/* Check in method Chart */}
            <Grid item xs={12} md={6}>
                {loading ? (
                    <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 2 }} />
                ) : (
                    <AnalyticsConversionRates
                        title="Check in method"
                        subheader={dateRangeSubheader}
                        chart={{
                            categories: checkInCategories,
                            series: checkInSeries,
                        }}
                    />
                )}
            </Grid>
        </Grid>
    );
};

export default StaffHourSummary;
