import { Grid } from '@mui/material'
import { CONFIG } from 'src/config-global'
import { AnalyticsConversionRates } from 'src/sections/overview/analytics/analytics-conversion-rates'
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary'
import { LateArrivalTable } from './late-arrival-table'
import { LateArrrivalData } from './mocks/data'

const LateArrivalLog = () => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <CourseWidgetSummary
                    title="On Site"
                    total={10}
                    color="warning"
                    icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-clock.svg`}
                />
            </Grid>

            <Grid item xs={12} md={4}>
                <CourseWidgetSummary
                    title="Staff"
                    total={1038}
                    color="warning"
                    icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <CourseWidgetSummary
                    title="Contractor"
                    total={214}
                    color="warning"
                    icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                />
            </Grid>


            <Grid item xs={12} md={12}>
                <LateArrivalTable title="Late Check-ins" data={LateArrrivalData} />
            </Grid>


        </Grid>
    )
}

export default LateArrivalLog