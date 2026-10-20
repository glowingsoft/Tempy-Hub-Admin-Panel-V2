import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';

import { useGetOrganizationAttendanceRotaQuery } from 'src/store/Reducer/attendance-api';

// ----------------------------------------------------------------------

export function getCurrentWeekRange() {
  const startDate = dayjs().startOf('week');
  return { startDate, endDate: startDate.add(6, 'day') };
}

export function useAttendanceRota({
  organizationId,
  branchId,
  ownerDashboard = false,
  skip = false,
} = {}) {
  const [weekRange, setWeekRange] = useState(getCurrentWeekRange);

  const from = weekRange.startDate
    ? dayjs(weekRange.startDate).format('YYYY-MM-DD')
    : undefined;
  const to = weekRange.endDate ? dayjs(weekRange.endDate).format('YYYY-MM-DD') : undefined;

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useGetOrganizationAttendanceRotaQuery(
    {
      organizationId,
      from,
      to,
      ...(ownerDashboard && branchId && branchId !== 'all' ? { branchId } : {}),
    },
    { skip: skip || !organizationId }
  );

  const weeks = data?.weeks ?? [];
  const apiSummary = data?.summary ?? {};

  const summary = useMemo(
    () => ({
      onTime: apiSummary.onTimeCount ?? 0,
      late: apiSummary.lateCount ?? 0,
      attendanceRate: apiSummary.attendanceRate ?? null,
    }),
    [apiSummary]
  );

  const staffCount = useMemo(() => {
    const ids = new Set();
    weeks.forEach((week) => {
      (week?.staff || []).forEach((row) => {
        if (row?.staff?._id) ids.add(row.staff._id);
      });
    });
    return ids.size;
  }, [weeks]);

  const isDefaultWeek = useMemo(() => {
    const current = getCurrentWeekRange();
    return (
      weekRange.startDate?.isSame(current.startDate, 'day') &&
      weekRange.endDate?.isSame(current.endDate, 'day')
    );
  }, [weekRange]);

  const handleWeekRangeChange = useCallback((key, value) => {
    setWeekRange((prev) => {
      const startChanged =
        value.startDate && !dayjs(value.startDate).isSame(prev.startDate, 'day');

      return startChanged
        ? { startDate: value.startDate, endDate: dayjs(value.startDate).add(6, 'day') }
        : { startDate: dayjs(value.endDate).subtract(6, 'day'), endDate: value.endDate };
    });
  }, []);

  const handleResetWeekRange = useCallback(() => {
    setWeekRange(getCurrentWeekRange());
  }, []);

  return {
    weekRange,
    weeks,
    summary,
    staffCount,
    loading: isLoading || isFetching,
    isError,
    isDefaultWeek,
    handleWeekRangeChange,
    handleResetWeekRange,
  };
}
