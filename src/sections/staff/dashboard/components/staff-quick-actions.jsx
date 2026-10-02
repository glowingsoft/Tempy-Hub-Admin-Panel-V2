import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { SvgColor } from 'src/components/svg-color';
import { Label } from 'src/components/label';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';
import { mockShiftsResponse } from 'src/sections/shift/mocks/data';

// Same source the Shift Claims tile links to (the Shifts list page), so this
// count can never disagree with what the staff member sees after clicking in.
const availableShiftsCount = mockShiftsResponse.data.filter((shift) => shift.status === 'open').length;

const QUICK_ACTIONS = [
    {
        label: 'Shift Claims',
        path: paths.staff.shifts,
        icon: 'ic-plan',
        count: availableShiftsCount,
    },
    {
        label: 'Documents',
        path: paths.staff.documents.root,
        icon: 'ic-document',
    },
    {
        label: 'My Attendance',
        path: paths.staff.attendance,
        icon: 'ic-clock',
    },
];

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

export function StaffQuickActions() {
    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 1.5 }}>
                Quick Actions
            </Typography>
            <Grid container spacing={1.5}>
                {QUICK_ACTIONS.map((action) => (
                    <Grid key={action.path} xs={12} sm={4}>
                        <Card
                            component={RouterLink}
                            href={action.path}
                            sx={{
                                position: 'relative',
                                minHeight: 96,
                                p: 1.5,
                                gap: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                color: 'text.primary',
                                textDecoration: 'none',
                                transition: 'transform 160ms ease, box-shadow 160ms ease',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: (theme) => theme.customShadows?.z8,
                                },
                            }}
                        >
                            {action.count ? (
                                <Label
                                    color="info"
                                    variant="filled"
                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                >
                                    {action.count}
                                </Label>
                            ) : null}

                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    display: 'grid',
                                    placeItems: 'center',
                                    color: 'common.white',
                                    bgcolor: action.fileType ? 'transparent' : 'primary.main',
                                }}
                            >
                                {action.fileType ? (
                                    <FileThumbnail file={action.fileType} sx={{ width: 32, height: 32 }} />
                                ) : (
                                    <SvgColor src={icon(action.icon)} sx={{ width: 22, height: 22 }} />
                                )}
                            </Box>
                            <Typography variant="body2" fontWeight={600}>
                                {action.label}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
