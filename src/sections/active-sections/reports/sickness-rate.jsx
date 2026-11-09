import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

import { CONFIG } from 'src/config-global';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { useTable } from 'src/components/table';
import { useGetSicknessRateReportQuery } from 'src/store/Reducer/reports-api';

import { SicknessRateTable } from './sickness-rate-table';

// ----------------------------------------------------------------------

const SicknessRateTab = ({
    organizationId,
    branchId,
    from,
    to,
    departmentId,
    periodPreset,
    onDataLoaded,
}) => {
    const table = useTable({ defaultRowsPerPage: 10 });

    const {
        data: response,
        isLoading,
        isFetching,
    } = useGetSicknessRateReportQuery(
        {
            organizationId,
            branchId,
            page: table.page + 1,
            limit: table.rowsPerPage,
            from,
            to,
            departmentId,
            periodPreset,
        },
        { skip: !organizationId }
    );

    const reportData = response?.data;
    const kpis = reportData?.kpis;
    const rows = reportData?.rows || [];
    const meta = response?.meta || {};
    const totalRecords = meta?.totalRecords ?? rows.length;

    useEffect(() => {
        if (reportData) {
            onDataLoaded?.(reportData);
        }
    }, [reportData, onDataLoaded]);

    const isBusy = isLoading || isFetching;

    return (
        <Grid container spacing={3}>
            {/* KPI 1: Sickness rate */}
            <Grid item xs={12} md={4}>
                {isBusy ? (
                    <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                ) : (
                    <CourseWidgetSummary
                        title="Sickness rate"
                        total={kpis?.sicknessRate != null ? `${kpis.sicknessRate}%` : '0%'}
                        color="error"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-rate.svg`}
                    />
                )}
            </Grid>

            {/* KPI 2: Staff affected */}
            <Grid item xs={12} md={4}>
                {isBusy ? (
                    <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                ) : (
                    <CourseWidgetSummary
                        title="Staff affected"
                        total={kpis?.staffAffected ?? 0}
                        color="warning"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                    />
                )}
            </Grid>

            {/* KPI 3: Total sick days */}
            <Grid item xs={12} md={4}>
                {isBusy ? (
                    <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                ) : (
                    <CourseWidgetSummary
                        title="Total sick days"
                        total={kpis?.totalSickDays ?? 0}
                        color="warning"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-clock.svg`}
                    />
                )}
            </Grid>

            {/* Table */}
            <Grid item xs={12} md={12}>
                <SicknessRateTable
                    data={rows}
                    loading={isBusy}
                    table={table}
                    totalRecords={totalRecords}
                />
            </Grid>
        </Grid>
    );
};

SicknessRateTab.propTypes = {
    branchId: PropTypes.string,
    departmentId: PropTypes.string,
    from: PropTypes.string,
    onDataLoaded: PropTypes.func,
    organizationId: PropTypes.string,
    periodPreset: PropTypes.string,
    to: PropTypes.string,
};

export default SicknessRateTab;
