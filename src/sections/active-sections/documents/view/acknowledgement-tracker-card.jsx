import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { useRouter } from 'src/routes/hooks';

export function AcknowledgementTrackerCard({ document, trackerPath }) {
    const router = useRouter();
    const acknowledgementStats = document.acknowledgementStats || {};
    const acknowledgedCount = acknowledgementStats.acknowledged || 0;
    const assignedCount = acknowledgementStats.assigned || 0;
    const pendingCount = Math.max(assignedCount - acknowledgedCount, 0);
    const overdueCount = Math.min(
        acknowledgementStats.overdue || 0,
        pendingCount
    );
    const acknowledgementProgress = assignedCount
        ? Math.min((acknowledgedCount / assignedCount) * 100, 100)
        : 0;

    return (
        <Card
            role="link"
            tabIndex={0}
            aria-label={`View acknowledgement tracker for ${document.name}`}
            onClick={() => router.push(trackerPath)}
            onKeyDown={(event) => {
                if (event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) {
                    event.preventDefault();
                    router.push(trackerPath);
                }
            }}
            sx={{
                p: 2.5,
                minWidth: 0,
                maxWidth: '100%',
                flexGrow: { xs: 0, lg: 1 },
                display: 'flex',
                cursor: 'pointer',
            }}
        >
            <Stack spacing={2.5} sx={{ width: 1, minWidth: 0, flex: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Stack spacing={0.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Iconify icon="solar:check-read-bold" width={20} sx={{ color: 'success.main' }} />
                            <Typography variant="subtitle1">Acknowledgement</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            Staff response progress
                        </Typography>
                    </Stack>
                    {assignedCount > 0 && (
                        <Typography variant="h6" color="success.main" sx={{ flexShrink: 0 }}>
                            {Math.round(acknowledgementProgress)}%
                        </Typography>
                    )}
                </Stack>

                {assignedCount > 0 ? (
                    <>
                        <Stack spacing={1}>
                            <Typography variant="body2" color="text.secondary">
                                {acknowledgedCount} of {assignedCount} staff acknowledged
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={acknowledgementProgress}
                                color="success"
                                sx={{ height: 7, borderRadius: 1 }}
                            />
                        </Stack>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                                py: 1.5,
                                '& > div:not(:last-of-type)': {
                                    borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                                },
                            }}
                        >
                            <Box sx={{ px: 1, minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Acknowledged
                                </Typography>
                                <Typography variant="subtitle1" color="success.main" fontWeight={700}>
                                    {acknowledgedCount}
                                </Typography>
                            </Box>
                            <Box sx={{ px: 1, minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Pending
                                </Typography>
                                <Typography variant="subtitle1" color="warning.dark" fontWeight={700}>
                                    {pendingCount}
                                </Typography>
                            </Box>
                            <Box sx={{ px: 1, minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Overdue
                                </Typography>
                                <Typography variant="subtitle1" color="error.main" fontWeight={700}>
                                    {overdueCount}
                                </Typography>
                            </Box>
                        </Box>
                    </>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No acknowledgement data yet
                    </Typography>
                )}

                <Button
                    component="span"
                    fullWidth
                    variant="outlined"
                    size="small"
                    endIcon={<Iconify icon="solar:arrow-right-linear" />}
                    sx={{ mt: 'auto' }}
                >
                    View tracker
                </Button>
            </Stack>
        </Card>
    );
}