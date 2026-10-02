import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { LEAVE_TYPE_OPTIONS } from 'src/sections/leave-request/mocks/data';

// ----------------------------------------------------------------------

export function buildStaffLeavePayload({ leaveType, startDate, endDate, reason }) {
    const totalDays = endDate.diff(startDate, 'day') + 1;
    const toUtcDate = (value) => `${value.format('YYYY-MM-DD')}T00:00:00.000Z`;

    return {
        leaveType,
        startDate: toUtcDate(startDate),
        endDate: toUtcDate(endDate),
        totalDays,
        reason: reason.trim(),
    };
}

// ----------------------------------------------------------------------

export function StaffAddLeaveDialog({ open, onClose, onSubmit }) {
    const initialValues = useMemo(
        () => ({
            leaveType: LEAVE_TYPE_OPTIONS[0]?.value || 'annual',
            startDate: null,
            endDate: null,
            reason: '',
        }),
        []
    );

    const [values, setValues] = useState(initialValues);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setValues(initialValues);
            setError('');
        }
    }, [initialValues, open]);

    const handleChange = (key, value) => {
        setValues((current) => ({ ...current, [key]: value }));
        setError('');
    };

    const handleSubmit = () => {
        if (!values.startDate || !values.endDate || !values.reason.trim()) {
            setError('Leave type, dates, and reason are required.');
            return;
        }
        if (values.endDate.isBefore(values.startDate, 'day')) {
            setError('End date must be on or after start date.');
            return;
        }
        onSubmit(buildStaffLeavePayload(values));
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Add Leave</DialogTitle>

            <DialogContent>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <TextField
                        select
                        label="Leave type"
                        value={values.leaveType}
                        onChange={(event) => handleChange('leaveType', event.target.value)}
                        fullWidth
                    >
                        {LEAVE_TYPE_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <DatePicker
                            label="Start date"
                            value={values.startDate}
                            onChange={(value) => handleChange('startDate', value)}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                        <DatePicker
                            label="End date"
                            value={values.endDate}
                            onChange={(value) => handleChange('endDate', value)}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Stack>

                    <TextField
                        label="Reason"
                        value={values.reason}
                        onChange={(event) => handleChange('reason', event.target.value)}
                        multiline
                        minRows={3}
                        fullWidth
                    />

                    {error && <FormHelperText error>{error}</FormHelperText>}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleSubmit}>
                    Submit Leave
                </Button>
            </DialogActions>
        </Dialog>
    );
}

StaffAddLeaveDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
};
