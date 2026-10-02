import { Grid } from '@mui/material'
import React from 'react'
import { CONFIG } from 'src/config-global'
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary'
import { VisitorCheckInTable } from './visitor-table'
import { visitorCheckInData } from './mocks/data'

const VisitorsCheckTab = () => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <CourseWidgetSummary
                    title=" On Site"
                    total={6}
                    color="primary"
                    icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <CourseWidgetSummary
                    title="Visitors"
                    total={6}
                    color="primary"
                    icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <CourseWidgetSummary
                    title="Contractor"
                    total={6}
                    color="primary"
                    icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                />
            </Grid>
            <Grid item xs={12} md={12}>
                <VisitorCheckInTable title="Visitor Check In" data={visitorCheckInData} />
            </Grid>
        </Grid>
    )
}

export default VisitorsCheckTab