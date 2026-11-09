import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Iconify } from 'src/components/iconify';
import { LEAVE_TYPE_OPTIONS } from 'src/sections/leave-request/mocks/data';

// ----------------------------------------------------------------------

export default function RotaCreateLeaveDialog({
  open,
  onClose,
  cellData,
  staffList = [],
  timezone = 'Europe/London',
  onSubmit,
}) {
  const staff = cellData?.staff;
  const day = cellData?.day;

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setSelectedStaffId(staff?.id || staff?.staffId || (staffList[0]?.id ?? ''));
      const initialDate = day?.date ? dayjs(day.date) : dayjs();
      setLeaveType('annual');
      setStartDate(initialDate);
      setEndDate(initialDate);
      setReason('');
      setError('');
    }
  }, [open, staff, day, staffList]);

  // Find effective staff object
  const currentStaff = useMemo(() => {
    if (staff) return staff;
    return staffList.find((s) => s.id === selectedStaffId) || null;
  }, [staff, staffList, selectedStaffId]);

  const handleSubmit = () => {
    if (!selectedStaffId) {
      setError('Please select a staff member.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Start date and end date are required.');
      return;
    }
    if (endDate.isBefore(startDate, 'day')) {
      setError('End date cannot be before start date.');
      return;
    }

    const payload = {
      staffId: selectedStaffId,
      leaveType,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      totalDays: endDate.diff(startDate, 'day') + 1,
      reason: reason.trim(),
      timezone,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Create Leave</span>
        {timezone && (
          <Chip
            size="small"
            variant="outlined"
            icon={<Iconify icon="solar:clock-circle-bold" width={14} />}
            label={timezone}
            sx={{ fontSize: '0.72rem', height: 22 }}
          />
        )}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {/* Staff Selection: Info banner when locked to cell, or Dropdown when called generally */}
          {staff ? (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{
                p: 1.5,
                borderRadius: 1.25,
                bgcolor: (theme) => `${theme.palette.grey[500]}12`,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'warning.lighter',
                  color: 'warning.darker',
                  fontWeight: 700,
                  width: 36,
                  height: 36,
                }}
              >
                {staff?.name
                  ? staff.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'S'}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {staff?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {day?.label || day?.date || 'Selected Cell'}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <TextField
              select
              label="Staff Member"
              value={selectedStaffId}
              onChange={(e) => {
                setSelectedStaffId(e.target.value);
                setError('');
              }}
              fullWidth
              size="small"
            >
              {staffList.map((st) => (
                <MenuItem key={st.id} value={st.id} sx={{ textTransform: 'capitalize' }}>
                  {st.name} {st.role ? `(${st.role})` : ''}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Leave Type */}
          <TextField
            select
            label="Leave Type"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            fullWidth
            size="small"
          >
            {LEAVE_TYPE_OPTIONS.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Date Pickers */}
          <Stack direction="row" spacing={2}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(value) => {
                setStartDate(value);
                setError('');
              }}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(value) => {
                setEndDate(value);
                setError('');
              }}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Stack>

          {/* Reason */}
          <TextField
            label="Reason (optional)"
            placeholder="e.g. Vacation, Doctor appointment"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={2}
            fullWidth
            size="small"
          />

          {error && <FormHelperText error>{error}</FormHelperText>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={handleSubmit}
          startIcon={<Iconify icon="solar:sun-2-bold" />}
        >
          Create Leave
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RotaCreateLeaveDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  cellData: PropTypes.object,
  staffList: PropTypes.array,
  timezone: PropTypes.string,
  onSubmit: PropTypes.func,
};
