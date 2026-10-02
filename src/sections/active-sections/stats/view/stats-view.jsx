import Grid from '@mui/material/Grid';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';
import { AppCurrentDownload } from 'src/sections/overview/app/app-current-download';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { EcommerceYearlySales } from 'src/sections/overview/e-commerce/ecommerce-yearly-sales';
import { WorkforceMovement } from '../workforce-movement';

// ----------------------------------------------------------------------

export function StatsView({ ownerDashboard = false }) {
    const router = useRouter();
    const { branchId, onBranchChange } = useOwnerBranchFilter();

    return (
        <DashboardContent maxWidth="xl">
            {ownerDashboard && (
                <CustomBreadcrumbs
                    heading="Statistics"
                    links={[
                        { name: 'Dashboard', href: paths.owner.root },
                        { name: 'Statistics' },
                    ]}
                    action={<OwnerBranchFilterActions value={branchId} onChange={onBranchChange} />}
                    sx={{ mb: { xs: 3, md: 5 } }}
                />
            )}

            <Grid container spacing={3} sx={{ '& .MuiGrid-item': { display: 'flex' } }}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <CourseWidgetSummary
                        title="Visitors"
                        total={6}
                        color="primary"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                        onClick={() => router.push(paths.siteManager.directory.root)}
                        sx={{ cursor: 'pointer', width: '100%' }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <CourseWidgetSummary
                        title="Residents"
                        total={6}
                        color="primary"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                        onClick={() => router.push(paths.siteManager.directory.root)}
                        sx={{ cursor: 'pointer', width: '100%' }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <CourseWidgetSummary
                        title="Contractor"
                        total={6}
                        color="primary"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                        onClick={() => router.push(paths.siteManager.directory.root)}
                        sx={{ cursor: 'pointer', width: '100%' }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <CourseWidgetSummary
                        title="Staff"
                        total={6}
                        color="primary"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                        onClick={() => router.push(paths.siteManager.directory.root)}
                        sx={{ cursor: 'pointer', width: '100%' }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                    <CourseWidgetSummary
                        title="Professionals"
                        total={8}
                        color="primary"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                        onClick={() => router.push(paths.siteManager.directory.root)}
                        sx={{ cursor: 'pointer', width: '100%' }}
                    />
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                    <AppCurrentDownload
                        title="Employees by Role"
                        subheader="Employee distribution across roles"
                        chart={{
                            colors: [
                                '#5054E8', // Deputy          — primary.main
                                '#8E33FF', // Head of Care    — secondary.main
                                '#00B8D9', // Senior Care     — info.main
                                '#22C55E', // Lead Care Asst  — success.main
                                '#FFAB00', // Care Assistant  — warning.main
                                '#FF5630', // Maintenance     — error.main
                                '#8B8FF2', // Administrator   — primary.light
                                '#C684FF', // Head Cook       — secondary.light
                                '#61F3F3', // Cook            — info.light
                                '#77ED8B', // Kitchen Asst    — success.light
                                '#FFD666', // Head Housekeeper — warning.light
                                '#FFAC82', // Domestic Asst   — error.light
                                '#3B3EB5', // Lead Activities — primary.dark
                                '#5119B7', // Activities      — secondary.dark
                            ],
                            series: [
                                { label: 'Deputy', value: 4 },
                                { label: 'Head of Care', value: 2 },
                                { label: 'Senior Care', value: 6 },
                                { label: 'Lead Care Assistant', value: 4 },
                                { label: 'Care Assistant', value: 18 },
                                { label: 'Maintenance', value: 3 },
                                { label: 'Administrator', value: 2 },
                                { label: 'Head Cook', value: 1 },
                                { label: 'Cook', value: 2 },
                                { label: 'Kitchen Assistant', value: 3 },
                                { label: 'Head Housekeeper', value: 1 },
                                { label: 'Domestic Assistant', value: 5 },
                                { label: 'Lead Activities', value: 2 },
                                { label: 'Activities', value: 3 },
                            ],
                        }}
                    />
                </Grid>


                <Grid item xs={12} md={8} lg={8}>
                    <EcommerceYearlySales
                        title="Employees over time"
                        height={540}
                        chart={{
                            colors: [
                                '#5054E8', // Care Assistant  — primary.main
                                '#00B8D9', // Senior Care     — info.main
                                '#22C55E', // Lead Care Asst  — success.main
                                '#FFAB00', // Head of Care    — warning.main
                                '#FF5630', // Administrator   — error.main
                                '#8E33FF', // Kitchen         — secondary.main
                                '#006C9C', // Housekeeping    — info.dark
                                '#118D57', // Activities      — success.dark
                            ],
                            categories: [
                                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                            ],
                            series: [
                                {
                                    name: '2026',
                                    data: [
                                        {
                                            name: 'Care Assistant',
                                            data: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
                                        },
                                        {
                                            name: 'Senior Care',
                                            data: [5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9],
                                        },
                                        {
                                            name: 'Lead Care Assistant',
                                            data: [3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6],
                                        },
                                        {
                                            name: 'Head of Care',
                                            data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                                        },
                                        {
                                            name: 'Administrator',
                                            data: [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3],
                                        },
                                        {
                                            name: 'Kitchen',
                                            data: [4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6],
                                        },
                                        {
                                            name: 'Housekeeping',
                                            data: [4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7],
                                        },
                                        {
                                            name: 'Activities',
                                            data: [2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3],
                                        },
                                    ],
                                },
                            ],
                        }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <WorkforceMovement
                        ownerDashboard={ownerDashboard}
                        branchId={branchId}
                    />
                </Grid>

            </Grid>
        </DashboardContent>
    );
}
