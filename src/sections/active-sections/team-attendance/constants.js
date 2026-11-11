import { createFilterField } from 'src/components/generic-table/table-filter-fields';

// ----------------------------------------------------------------------

export const VIEW_TABS = [
  { value: 'shift', label: 'Shift view', icon: 'solar:calendar-bold' },
  { value: 'table', label: 'Table', icon: 'solar:list-bold' },
];

export const PUNCTUALITY_STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'onTime', label: 'On time', color: 'success' },
  { value: 'late', label: 'Late', color: 'warning' },
  { value: 'unscheduled', label: 'Unscheduled', color: 'info' },
];

export const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'name', label: 'Name', minWidth: 200 },
  { id: 'date', label: 'Date', align: 'center', minWidth: 120 },
  { id: 'clockIn', label: 'Clock In', align: 'center', minWidth: 150 },
  { id: 'clockOut', label: 'Clock Out', align: 'center', minWidth: 150 },
  { id: 'breakIn', label: 'Break In', align: 'center', minWidth: 150 },
  { id: 'breakOut', label: 'Break Out', align: 'center', minWidth: 150 },
  { id: 'total', label: 'Total', align: 'center', minWidth: 150 },
  { id: 'status', label: 'Status', align: 'center', minWidth: 110 },
  { id: 'actions', label: 'Actions', width: 60, align: 'start' },
];

export const TABLE_FILTER_FIELDS = [
  createFilterField.status({
    options: PUNCTUALITY_STATUS_OPTIONS,
    showCount: true,
  }),
  createFilterField.search({
    placeholder: 'Search staff name or email...',
  }),
  createFilterField.dateRange({ key: 'dateRange' }),
];

export const WEEK_RANGE_FILTER_FIELDS = [createFilterField.dateRange({ key: 'dateRange' })];
