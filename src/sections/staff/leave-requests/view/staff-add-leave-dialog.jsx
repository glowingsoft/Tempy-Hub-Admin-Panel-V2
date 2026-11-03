import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

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
import LoadingButton from '@mui/lab/LoadingButton';

import { LEAVE_TYPE_OPTIONS } from 'src/sections/leave-request/mocks/data';

// ----------------------------------------------------------------------

const STAFF_LEAVE_TYPE_OPTIONS = LEAVE_TYPE_OPTIONS.filter((option) => option.value === 'annual');

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
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setValues(initialValues);
            setError('');
            setFieldErrors({});
        }
    }, [initialValues, open]);

    const handleChange = (key, value) => {
        setValues((current) => {
            const nextValues = { ...current, [key]: value };
            if (
                key === 'startDate' &&
                value &&
                nextValues.endDate?.isBefore(value, 'day')
            ) {
                nextValues.endDate = null;
            }
            return nextValues;
        });
        setFieldErrors((current) => {
            const nextErrors = { ...current, [key]: '' };
            if (key === 'startDate' && value && values.endDate?.isBefore(value, 'day')) {
                nextErrors.endDate = '';
            }
            return nextErrors;
        });
        setError('');
    };

    const handleSubmit = async () => {
        const nextErrors = {
            leaveType: values.leaveType ? '' : 'Leave type is required.',
            startDate: values.startDate ? '' : 'Start date is required.',
            endDate: values.endDate ? '' : 'End date is required.',
            reason: values.reason.trim() ? '' : 'Reason is required.',
        };

        if (Object.values(nextErrors).some(Boolean)) {
            setFieldErrors(nextErrors);
            setError('');
            return;
        }

        const startDate = dayjs(values.startDate);
        const endDate = dayjs(values.endDate);
        const today = dayjs().startOf('day');
        if (!startDate.isValid() || !endDate.isValid()) {
            setFieldErrors({
                ...nextErrors,
                ...(!startDate.isValid() ? { startDate: 'Select a valid start date.' } : {}),
                ...(!endDate.isValid() ? { endDate: 'Select a valid end date.' } : {}),
            });
            setError('');
            return;
        }
        if (startDate.isBefore(today, 'day') || endDate.isBefore(today, 'day')) {
            setFieldErrors({
                ...nextErrors,
                ...(startDate.isBefore(today, 'day') ? { startDate: 'Start date cannot be in the past.' } : {}),
                ...(endDate.isBefore(today, 'day') ? { endDate: 'End date cannot be in the past.' } : {}),
            });
            setError('');
            return;
        }
        if (endDate.isBefore(startDate, 'day')) {
            setFieldErrors({ ...nextErrors, endDate: 'End date must be on or after start date.' });
            setError('');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(buildStaffLeavePayload({ ...values, startDate, endDate }));
            onClose();
        } catch (submitError) {
            setError(
                submitError?.data?.message ||
                    submitError?.message ||
                    'Unable to submit leave request. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => {
                if (!isSubmitting) onClose();
            }}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>Add Leave</DialogTitle>

            <DialogContent>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <TextField
                        select
                        label="Leave type"
                        required
                        error={Boolean(fieldErrors.leaveType)}
                        helperText={fieldErrors.leaveType}
                        value={values.leaveType}
                        onChange={(event) => handleChange('leaveType', event.target.value)}
                        fullWidth
                    >
                        {STAFF_LEAVE_TYPE_OPTIONS.map((option) => (
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
                            disablePast
                            minDate={dayjs().startOf('day')}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    required: true,
                                    error: Boolean(fieldErrors.startDate),
                                    helperText: fieldErrors.startDate,
                                },
                            }}
                        />
                        <DatePicker
                            label="End date"
                            value={values.endDate}
                            onChange={(value) => handleChange('endDate', value)}
                            disablePast
                            minDate={values.startDate || dayjs().startOf('day')}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    required: true,
                                    error: Boolean(fieldErrors.endDate),
                                    helperText: fieldErrors.endDate,
                                },
                            }}
                        />
                    </Stack>

                    <TextField
                        label="Total days"
                        value={
                            values.startDate &&
                            values.endDate &&
                            !values.endDate.isBefore(values.startDate, 'day')
                                ? values.endDate.startOf('day').diff(values.startDate.startOf('day'), 'day') + 1
                                : ''
                        }
                        required
                        InputProps={{ readOnly: true }}
                        fullWidth
                    />

                    <TextField
                        label="Reason"
                        value={values.reason}
                        onChange={(event) => handleChange('reason', event.target.value)}
                        required
                        error={Boolean(fieldErrors.reason)}
                        helperText={fieldErrors.reason}
                        multiline
                        minRows={3}
                        fullWidth
                    />

                    {error && <FormHelperText error>{error}</FormHelperText>}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <LoadingButton
                    color="primary"
                    variant="contained"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                >
                    Submit Leave
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}

StaffAddLeaveDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
};
