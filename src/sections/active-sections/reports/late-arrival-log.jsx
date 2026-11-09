import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';

import { CONFIG } from 'src/config-global';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { useTable } from 'src/components/table';
import { useGetLateCheckInsReportQuery } from 'src/store/Reducer/reports-api';

import { LateArrivalTable } from './late-arrival-table';

// ----------------------------------------------------------------------

const LateArrivalLog = ({
    organizationId,
    branchId,
    from,
    to,
    departmentId,
    periodPreset,
    onDataLoaded,
}) => {
    const table = useTable({ defaultRowsPerPage: 10 });

    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        userType: 'all',
    });

    const handleFilterChange = useCallback((key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    const {
        data: response,
        isLoading,
        isFetching,
    } = useGetLateCheckInsReportQuery(
        {
            organizationId,
            branchId,
            page: table.page + 1,
            limit: table.rowsPerPage,
            from,
            to,
            departmentId,
            periodPreset,
            status: filters.status,
            search: filters.search,
            personType: filters.userType,
        },
        { skip: !organizationId }
    );

    const reportData = response?.data;
    const kpis = reportData?.kpis;
    const rows = reportData?.rows || [];
    const meta = response?.meta || {};

    useEffect(() => {
        if (reportData) {
            onDataLoaded?.(reportData);
        }
    }, [reportData, onDataLoaded]);

    const isBusy = isLoading || isFetching;

    return (
        <Grid container spacing={3}>
            {/* KPI 1: On Site */}
            <Grid item xs={12} md={4}>
                {isBusy ? (
                    <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                ) : (
                    <CourseWidgetSummary
                        title="On Site"
                        total={kpis?.onSite ?? 0}
                        color="warning"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-clock.svg`}
                    />
                )}
            </Grid>

            {/* KPI 2: Staff */}
            <Grid item xs={12} md={4}>
                {isBusy ? (
                    <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                ) : (
                    <CourseWidgetSummary
                        title="Staff"
                        total={kpis?.staff ?? 0}
                        color="warning"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                    />
                )}
            </Grid>

            {/* KPI 3: Contractor */}
            <Grid item xs={12} md={4}>
                {isBusy ? (
                    <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                ) : (
                    <CourseWidgetSummary
                        title="Contractor"
                        total={kpis?.contractors ?? kpis?.contractor ?? kpis?.late ?? 0}
                        color="warning"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                    />
                )}
            </Grid>

            {/* Table */}
            <Grid item xs={12} md={12}>
                <LateArrivalTable
                    data={rows}
                    meta={meta}
                    loading={isBusy}
                    table={table}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />
            </Grid>
        </Grid>
    );
};

LateArrivalLog.propTypes = {
    branchId: PropTypes.string,
    departmentId: PropTypes.string,
    from: PropTypes.string,
    onDataLoaded: PropTypes.func,
    organizationId: PropTypes.string,
    periodPreset: PropTypes.string,
    to: PropTypes.string,
};

export default LateArrivalLog;
