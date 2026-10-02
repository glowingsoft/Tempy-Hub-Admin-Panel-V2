import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

export function StaffEmergencyAlertBanner({ alert, acknowledged, onAcknowledge }) {
    if (!alert?.active || acknowledged) return null;
    const isEmergency = alert.mode === 'emergency';

    return (
        <Alert severity="error" icon={<Iconify icon="solar:fire-bold" width={28} />} sx={{ mb: 3, alignItems: 'flex-start', border: 1, borderColor: isEmergency ? '#E5AAA3' : '#E8C98A', bgcolor: isEmergency ? '#FFF4F2' : '#FFF9ED', color: isEmergency ? '#5D1A16' : '#5B4212', boxShadow: '0 2px 8px rgba(91, 32, 24, 0.08)', '& .MuiAlert-icon': { color: isEmergency ? '#B42318' : '#A15C07', pt: 0.5 }, '& .MuiAlert-message': { width: 1 } }}>
            <Stack spacing={1.5}>
                <Box>
                    <AlertTitle sx={{ mb: 0.5, fontWeight: 800 }}>{isEmergency ? 'Emergency evacuation alert' : 'Fire evacuation drill'}</AlertTitle>
                    <Typography variant="body2" sx={{ color: 'inherit', opacity: 0.86 }}>{alert.instruction}</Typography>
                </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Assembly point: {alert.assemblyPoint}</Typography>
                    <Button color="inherit" variant="outlined" onClick={onAcknowledge} startIcon={<Iconify icon="solar:shield-check-bold" />} sx={{ borderColor: isEmergency ? '#C96B63' : '#C08A2E', color: 'inherit', '&:hover': { borderColor: isEmergency ? '#8F2119' : '#7C570E', bgcolor: isEmergency ? 'rgba(180, 35, 24, 0.06)' : 'rgba(161, 92, 7, 0.06)' } }}>
                        I&apos;m safe / accounted for
                    </Button>
                </Stack>
            </Stack>
        </Alert>
    );
}
