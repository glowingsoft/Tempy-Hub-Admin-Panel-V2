import Grid from '@mui/material/Grid';

import { CONFIG } from 'src/config-global';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';

import { sicknessRateData } from './mocks/data';
import { SicknessRateTable } from './sickness-rate-table';

const SicknessRateTab = () => {
    const staffAffected = sicknessRateData.length;
    const totalSickDays = sicknessRateData.reduce((sum, row) => sum + row.sickDays, 0);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <CourseWidgetSummary
                    title="Sickness rate"
                    total="4.2%"
                    color="error"
                    icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-rate.svg`}
                />
            </Grid>

            <Grid item xs={12} md={4}>
                <CourseWidgetSummary
                    title="Staff affected"
                    total={staffAffected}
                    color="warning"
                    icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                />
            </Grid>

            <Grid item xs={12} md={4}>
                <CourseWidgetSummary
                    title="Total sick days"
                    total={totalSickDays}
                    color="warning"
                    icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-clock.svg`}
                />
            </Grid>

            <Grid item xs={12} md={12}>
                <SicknessRateTable data={sicknessRateData} />
            </Grid>
        </Grid>
    );
};

export default SicknessRateTab;
