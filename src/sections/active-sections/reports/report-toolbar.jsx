import {
    MenuItem,
    Stack,
    TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { PERIOD_PRESET_OPTIONS } from './mocks/data';

// ----------------------------------------------------------------------

// `periodPreset` / `onPeriodPresetChange` are optional — pass both to show the
// preset dropdown and lock the date pickers to a computed range; omit them to
// keep this a plain custom date-range + department toolbar.
export function ReportToolbar({
    startDate,
    endDate,
    department,
    periodPreset,
    onStartDateChange,
    onEndDateChange,
    onDepartmentChange,
    onPeriodPresetChange,
}) {
    const isCustomRange = !onPeriodPresetChange || periodPreset === 'custom';

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

            <TextField
                select
                label="Department"
                value={department}
                onChange={(event) =>
                    onDepartmentChange(event.target.value)
                }
                fullWidth
            >
                <MenuItem value="all">All departments</MenuItem>
                <MenuItem value="care">Care</MenuItem>
                <MenuItem value="nursing">Nursing</MenuItem>
                <MenuItem value="kitchen">Kitchen & Catering</MenuItem>
                <MenuItem value="housekeeping">Housekeeping</MenuItem>
                <MenuItem value="admin">Administration</MenuItem>
            </TextField>


        </Stack>
    );
}