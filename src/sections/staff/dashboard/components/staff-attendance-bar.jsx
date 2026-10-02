import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// `canBreak` is the site's "Enable breaks" setting — client feedback: some
// organizations don't use breaks at all, so the Break In/Out button needs to
// be removable, not always on. `breakNote` is an optional one-line caption
// (e.g. the unpaid break entitlement for today's shift).
export function StaffAttendanceBar({
    clock,
    onClockIn,
    onClockOut,
    onStartBreak,
    onEndBreak,
    canBreak = true,
    breakNote,
}) {
    const status = clock?.status ?? 'notStarted';

    const renderActions = () => {
        if (status === 'notStarted') {
            return <Button color="success" variant="contained" startIcon={<Iconify icon="solar:login-3-bold" />} onClick={onClockIn}>Check In</Button>;
        }
        if (status === 'checkedOut') return <Button color="inherit" variant="contained" disabled>Checked out</Button>;
        return <>
            {canBreak && (
                status === 'onBreak' ? (
                    <Button color="warning" variant="contained" startIcon={<Iconify icon="solar:play-bold" />} onClick={onEndBreak}>Break Out</Button>
                ) : (
                    <Button color="warning" variant="contained" startIcon={<Iconify icon="solar:cup-hot-bold" />} onClick={onStartBreak}>Break In</Button>
                )
            )}
            <Button color="error" variant="contained" startIcon={<Iconify icon="solar:logout-3-bold" />} onClick={onClockOut}>Check Out</Button>
        </>;
    };

    return (
        <Card variant="outlined" sx={{ p: 3, gap: 2, display: 'flex', bgcolor: 'background.neutral', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' } }}>
            <div>
                <Typography variant="h6">Today&apos;s Attendance</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {canBreak ? 'Mark your check-in, break, or check-out.' : 'Mark your check-in or check-out.'}
                </Typography>
                {canBreak && breakNote && (
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {breakNote}
                    </Typography>
                )}
            </div>
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} sx={{ width: { xs: 1, md: 'auto' } }}>
                <Stack direction="row" spacing={1.5}>{renderActions()}</Stack>
            </Stack>
        </Card>
    );
}
