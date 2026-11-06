import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Grid, Skeleton } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { useTable } from 'src/components/table';
import { useGetVisitorCheckInsReportQuery } from 'src/store/Reducer/reports-api';

import { VisitorCheckInTable } from './visitor-table';

// ----------------------------------------------------------------------

const VisitorsCheckTab = ({
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
    } = useGetVisitorCheckInsReportQuery(
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
            {/* 3 KPI Cards */}
            <Grid item xs={12} md={4}>
                {isBusy ? (
                    <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                ) : (
                    <CourseWidgetSummary
                        title="On Site"
                        total={kpis?.onSite ?? 0}
                        color="primary"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                    />
                )}
            </Grid>

            <Grid item xs={12} md={4}>
                {isBusy ? (
                    <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                ) : (
                    <CourseWidgetSummary
                        title="Visitors"
                        total={kpis?.visitors ?? 0}
                        color="primary"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                    />
                )}
            </Grid>

            <Grid item xs={12} md={4}>
                {isBusy ? (
                    <Skeleton variant="rectangular" height={124} sx={{ borderRadius: 2 }} />
                ) : (
                    <CourseWidgetSummary
                        title="Contractor"
                        total={kpis?.contractors ?? 0}
                        color="primary"
                        icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-users.svg`}
                    />
                )}
            </Grid>

            {/* Table */}
            <Grid item xs={12} md={12}>
                <VisitorCheckInTable
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

VisitorsCheckTab.propTypes = {
    branchId: PropTypes.string,
    departmentId: PropTypes.string,
    from: PropTypes.string,
    onDataLoaded: PropTypes.func,
    organizationId: PropTypes.string,
    periodPreset: PropTypes.string,
    to: PropTypes.string,
};

export default VisitorsCheckTab;
