import { useCallback, useState } from 'react';

import Box from '@mui/material/Box';

import { useBoolean } from 'src/hooks/use-boolean';
import { useTabs } from 'src/hooks/use-tabs';
import { API_ROUTES } from 'src/store/apiRoutes';
import { downloadCsvFromApi } from 'src/utils/export-helper';

import { AttendanceHeader } from '../components/attendance-header';
import { AttendanceSummaryWidgets } from '../components/attendance-summary-widgets';
import { AttendanceViewTabs } from '../components/attendance-view-tabs';
import { AttendanceDetailDrawer } from '../detail-drawer';
import { useAttendanceRota } from '../hooks/use-attendance-rota';
import { useTeamAttendance } from '../hooks/use-team-attendance';
import { AttendanceShiftView } from '../shift-view';
import { AttendanceTableView } from '../table-view';

// ----------------------------------------------------------------------

export function TeamAttendanceListView({ ownerDashboard = false }) {
  const tabs = useTabs('shift');
  const detailDrawer = useBoolean();
  const [selectedRecord, setSelectedRecord] = useState(null);

  const {
    organizationId,
    branchId,
    onBranchChange,
    table,
    filters,
    records,
    summary: tableSummary,
    totalRecords,
    isAttendanceLoading,
    isError,
    getStatusCount,
    handleFilterChange,
    handleSearchChange,
    handleRemoveFilter,
    handleResetAllFilters,
  } = useTeamAttendance({ ownerDashboard, skip: tabs.value !== 'table' });

  const {
    weekRange,
    weeks,
    summary: rotaSummary,
    staffCount,
    loading: isRotaLoading,
    isDefaultWeek,
    handleWeekRangeChange,
    handleResetWeekRange,
  } = useAttendanceRota({
    organizationId,
    branchId,
    ownerDashboard,
    skip: tabs.value !== 'shift',
  });

  const summary = tabs.value === 'table' ? tableSummary : rotaSummary;
  const widgetsLoading = tabs.value === 'table' ? isAttendanceLoading : isRotaLoading;

  const handleViewRecord = useCallback(
    (dayIdOrRecord, maybeRecord) => {
      const record = maybeRecord || (typeof dayIdOrRecord === 'object' ? dayIdOrRecord : null);
      if (!record || record.kind === 'leave') return;
      setSelectedRecord(record);
      detailDrawer.onTrue();
    },
    [detailDrawer]
  );

  const handleExportCSV = useCallback(() => {
    if (!organizationId) return;
    downloadCsvFromApi(
      API_ROUTES.ORGANIZATION_ATTENDANCE(organizationId),
      'attendance.csv',
      {
        branchId: branchId && branchId !== 'all' ? branchId : undefined,
        punctualityStatus: filters?.status && filters.status !== 'all' ? filters.status : undefined,
        keyword: filters?.search || undefined,
        from: filters?.from || undefined,
        to: filters?.to || undefined,
      },
      organizationId
    );
  }, [organizationId, branchId, filters]);

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <AttendanceHeader
        ownerDashboard={ownerDashboard}
        branchId={branchId}
        onBranchChange={onBranchChange}
        onExportCSV={handleExportCSV}
      />

      <AttendanceSummaryWidgets summary={summary} loading={widgetsLoading} />

      <AttendanceViewTabs value={tabs.value} onChange={tabs.onChange} />

      {tabs.value === 'shift' && (
        <AttendanceShiftView
          weekRange={weekRange}
          weeks={weeks}
          staffCount={staffCount}
          loading={isRotaLoading}
          isDefaultWeek={isDefaultWeek}
          onWeekRangeChange={handleWeekRangeChange}
          onResetWeekRange={handleResetWeekRange}
          onViewRecord={handleViewRecord}
        />
      )}

      {tabs.value === 'table' && (
        <AttendanceTableView
          table={table}
          filters={filters}
          records={records}
          totalRecords={totalRecords}
          loading={isAttendanceLoading}
          isError={isError}
          getStatusCount={getStatusCount}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          onRemoveFilter={handleRemoveFilter}
          onResetFilters={handleResetAllFilters}
          onViewRecord={handleViewRecord}
        />
      )}

      <AttendanceDetailDrawer
        open={detailDrawer.value}
        onClose={() => {
          detailDrawer.onFalse();
          setSelectedRecord(null);
        }}
        record={selectedRecord}
      />
    </Box>
  );
}
