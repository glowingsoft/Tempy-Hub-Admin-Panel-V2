import { Grid } from '@mui/material'
import { CONFIG } from 'src/config-global'
import { AnalyticsConversionRates } from 'src/sections/overview/analytics/analytics-conversion-rates'
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary'
import { ORG_LATE_CHECKINS, ORG_SICKNESS_RATE, REPORT_TYPES } from './mocks/data'

// `onNavigate` is optional — when provided, the Late check-ins / Sickness
// rate cards become clickable "select into" shortcuts to their full
// breakdown tab (Late Check-ins / Sickness Rate).
const StaffHourSummary = ({ onNavigate }) => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
                <CourseWidgetSummary
                    title="Hour worked"
                    total={11482}
                    color="primary"
                    icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-job.svg`}
                />
            </Grid>

            <Grid item xs={12} md={3}>
                <CourseWidgetSummary
                    title="Visitor sign-ins"
                    total={1038}
                    color="primary"
                    icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <CourseWidgetSummary
                    title="Late check-ins"
                    total={ORG_LATE_CHECKINS}
                    color="warning"
                    icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-clock.svg`}
                    onClick={() => onNavigate?.(REPORT_TYPES.LATE_ARRIVALS)}
                    sx={{ cursor: onNavigate ? 'pointer' : 'default' }}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <CourseWidgetSummary
                    title="Sickness rate"
                    total={ORG_SICKNESS_RATE}
                    color="error"
                    icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-rate.svg`}
                    onClick={() => onNavigate?.(REPORT_TYPES.SICKNESS_RATE)}
                    sx={{ cursor: onNavigate ? 'pointer' : 'default' }}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <AnalyticsConversionRates
                    title="Hours by user type"
                    chart={{
                        categories: ['Staff', 'Visitors', 'Residents', 'Contractors'],
                        series: [
                            {
                                name: 'Hours',
                                data: [1840, 320, 960, 540],
                            },
                        ],
                    }}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <AnalyticsConversionRates
                    title="Check in method"
                    chart={{
                        categories: ['Kiosk', 'Phone', 'Manual'],
                        series: [
                            { name: '2026', data: [53, 32, 33] },
                        ],
                    }}
                />
            </Grid>


        </Grid>
    )
}

export default StaffHourSummary