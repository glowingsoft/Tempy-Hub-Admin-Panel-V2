import { useMemo } from 'react';

import Card from '@mui/material/Card';

import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';

import { WEEK_RANGE_FILTER_FIELDS } from '../constants';
import { AttendanceShiftGrid } from './shift-grid';

// ----------------------------------------------------------------------

export function AttendanceShiftView({
  weekRange,
  weeks,
  staffCount,
  loading,
  isDefaultWeek,
  onWeekRangeChange,
  onResetWeekRange,
  onViewRecord,
}) {
  const shiftActiveFilters = useMemo(() => {
    if (isDefaultWeek) return [];
    return [
      {
        key: 'dateRange',
        type: 'dateRange',
        label: 'Week',
        value: weekRange,
        displayFormat: WEEK_RANGE_FILTER_FIELDS[0]?.displayFormat,
      },
    ];
  }, [weekRange, isDefaultWeek]);

  return (
    <Card>
      <FlexibleTableToolbar
        filterFields={WEEK_RANGE_FILTER_FIELDS}
        filterValues={{ dateRange: weekRange }}
        onFilterChange={onWeekRangeChange}
      />

      {!!shiftActiveFilters.length && (
        <FlexibleTableFiltersResult
          activeFilters={shiftActiveFilters}
          totalResults={staffCount}
          onResetFilters={onResetWeekRange}
          onRemoveFilter={onResetWeekRange}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}

      <AttendanceShiftGrid weeks={weeks} onViewRecord={onViewRecord} loading={loading} />
    </Card>
  );
}
