import dayjs from 'dayjs';
import { useCallback, useMemo } from 'react';

import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useTable } from 'src/components/table';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';
import { getListStatusTabCount } from 'src/utils/table-utils';
import { useGetOrganizationAttendanceQuery } from 'src/store/Reducer/attendance-api';

// ----------------------------------------------------------------------

export function useTeamAttendance({ ownerDashboard = false, skip = false } = {}) {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });
  const { organizationId } = useCurrentOrganization();
  const { branchId, onBranchChange } = useOwnerBranchFilter();

  const filters = useSetState({
    name: '',
    status: 'all',
    dateRange: { startDate: null, endDate: null },
  });

  const trimmedSearch = useDebounce(filters.state.name, 400).trim();
  const from = filters.state.dateRange?.startDate
    ? dayjs(filters.state.dateRange.startDate).format('YYYY-MM-DD')
    : undefined;
  const to = filters.state.dateRange?.endDate
    ? dayjs(filters.state.dateRange.endDate).format('YYYY-MM-DD')
    : undefined;

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetOrganizationAttendanceQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(filters.state.status && filters.state.status !== 'all'
        ? { punctualityStatus: filters.state.status }
        : {}),
      ...(trimmedSearch ? { keyword: trimmedSearch } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(ownerDashboard && branchId && branchId !== 'all' ? { branchId } : {}),
    },
    { skip: skip || !organizationId }
  );

  const isAttendanceLoading = isLoading || isFetching;
  const records = useMemo(() => apiResponse?.data ?? [], [apiResponse]);
  const apiSummary = apiResponse?.summary ?? {};
  const meta = apiResponse?.meta ?? {};
  const statusCounts = meta.counts ?? {};
  const totalRecords = meta.totalRecords ?? records.length;

  const summary = useMemo(
    () => ({
      onTime: apiSummary.onTimeCount ?? 0,
      late: apiSummary.lateCount ?? 0,
      attendanceRate: apiSummary.attendanceRate ?? null,
    }),
    [apiSummary]
  );

  const getStatusCount = useCallback(
    (tabStatus) => getListStatusTabCount(statusCounts, tabStatus, totalRecords),
    [statusCounts, totalRecords]
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      table.onResetPage();
      filters.setState({ [key]: value });
    },
    [filters, table]
  );

  const handleSearchChange = useCallback(
    (event) => {
      table.onResetPage();
      filters.setState({ name: event.target.value });
    },
    [filters, table]
  );

  const handleRemoveFilter = useCallback(
    (key) => {
      table.onResetPage();
      if (key === 'dateRange') {
        filters.setState({ dateRange: { startDate: null, endDate: null } });
      } else if (key === 'status') {
        filters.setState({ status: 'all' });
      } else if (key === 'name') {
        filters.setState({ name: '' });
      }
    },
    [filters, table]
  );

  const handleResetAllFilters = useCallback(() => {
    table.onResetPage();
    filters.setState({ name: '', status: 'all', dateRange: { startDate: null, endDate: null } });
  }, [filters, table]);

  return {
    organizationId,
    branchId,
    onBranchChange,
    table,
    filters,
    records,
    summary,
    totalRecords,
    isAttendanceLoading,
    isError,
    getStatusCount,
    handleFilterChange,
    handleSearchChange,
    handleRemoveFilter,
    handleResetAllFilters,
  };
}
