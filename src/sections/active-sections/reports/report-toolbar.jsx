import { useMemo } from 'react';
import {
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { useGetDepartmentsQuery } from 'src/store/Reducer/departments-api';
import { PERIOD_PRESET_OPTIONS } from './mocks/data';

// ----------------------------------------------------------------------

const EXTRA_DEPARTMENT_OPTIONS = [{ value: 'all', label: 'All departments' }];
const mapDepartmentOption = (item) => ({ value: item._id, label: item.name });

export function ReportToolbar({
    startDate,
    endDate,
    department,
    periodPreset,
    onStartDateChange,
    onEndDateChange,
    onDepartmentChange,
    onPeriodPresetChange,
    organizationId,
    branchId,
}) {
    const isCustomRange = !onPeriodPresetChange || periodPreset === 'custom';

    const departmentValue = useMemo(() => {
        if (!department || department === 'all') {
            return { value: 'all', label: 'All departments' };
        }
        if (typeof department === 'object') return department;
        return { value: department, label: department };
    }, [department]);

    return (
        <Stack
            direction={{
                xs: 'column',
                md: 'row',
            }}
            spacing={2}
        >
            {onPeriodPresetChange && (
                <TextField
                    select
                    label="Period preset"
                    value={periodPreset}
                    onChange={(event) => onPeriodPresetChange(event.target.value)}
                    fullWidth
                >
                    {PERIOD_PRESET_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
            )}

            <DatePicker
                label="Start date"
                value={startDate}
                onChange={onStartDateChange}
                disabled={!isCustomRange}
                sx={{ width: 1 }}
            />

            <DatePicker
                label="End date"
                value={endDate}
                onChange={onEndDateChange}
                disabled={!isCustomRange}
                sx={{ width: 1 }}
            />

            {organizationId ? (
                <InfiniteAutocomplete
                    value={departmentValue}
                    onChange={(opt) => onDepartmentChange(opt?.value || 'all')}
                    useQuery={useGetDepartmentsQuery}
                    queryArgs={{
                        organizationId,
                        ...(branchId && branchId !== 'all' ? { branchId } : {}),
                    }}
                    mapOption={mapDepartmentOption}
                    extraOptions={EXTRA_DEPARTMENT_OPTIONS}
                    label="Department"
                    placeholder="Search departments..."
                    disabled={!organizationId}
                    fullWidth
                />
            ) : (
                <TextField
                    select
                    label="Department"
                    value={typeof department === 'object' ? department.value : department}
                    onChange={(event) => onDepartmentChange(event.target.value)}
                    fullWidth
                >
                    <MenuItem value="all">All departments</MenuItem>
                    <MenuItem value="care">Care</MenuItem>
                    <MenuItem value="nursing">Nursing</MenuItem>
                    <MenuItem value="kitchen">Kitchen & Catering</MenuItem>
                    <MenuItem value="housekeeping">Housekeeping</MenuItem>
                    <MenuItem value="admin">Administration</MenuItem>
                </TextField>
            )}
        </Stack>
    );
}