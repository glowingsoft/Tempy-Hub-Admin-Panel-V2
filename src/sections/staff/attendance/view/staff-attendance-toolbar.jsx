import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Iconify } from 'src/components/iconify';

export function StaffAttendanceToolbar({ startDate, endDate, onStartDateChange, onEndDateChange, onApply }) {
    return (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
            <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 600 }}>Attendance Records</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>Filter by date range to review check-ins and working hours</Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
                <DatePicker label="Start date" value={startDate} onChange={onStartDateChange} format="MM/DD/YYYY" slotProps={{ textField: { size: 'small', sx: { width: { xs: '100%', sm: 260 } } } }} />
                <DatePicker label="End date" value={endDate} onChange={onEndDateChange} format="MM/DD/YYYY" slotProps={{ textField: { size: 'small', sx: { width: { xs: '100%', sm: 260 } } } }} />
                <Button variant="contained" onClick={onApply} disabled={!startDate || !endDate} startIcon={<Iconify icon="solar:check-circle-bold" width={19} />} sx={{ minWidth: 112, height: 40, px: 2.25, borderRadius: 1.5, fontWeight: 700, letterSpacing: 0, boxShadow: (theme) => `0 6px 16px ${theme.vars.palette.primary.main}33`, transition: 'transform 160ms ease, box-shadow 160ms ease', '&:hover': { transform: 'translateY(-1px)', boxShadow: (theme) => `0 8px 20px ${theme.vars.palette.primary.main}4D` }, '&.Mui-disabled': { boxShadow: 'none' } }}>Apply</Button>
            </Stack>
        </Stack>
    );
}
