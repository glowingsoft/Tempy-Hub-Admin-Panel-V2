import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { SvgColor } from 'src/components/svg-color';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';

const QUICK_ACTIONS = [
  { label: 'Rota', path: paths.lineManager.teamRota, icon: 'ic-rota' },
  { label: 'Residents & Passwords', path: paths.lineManager.residents, icon: 'ic-user' },
  { label: 'Team Attendance', path: paths.lineManager.teamAttendance, icon: 'ic-clock' },
  { label: 'Team Compliance', path: paths.lineManager.teamCompliance, icon: 'ic-compliance' },
  { label: 'Fire Drills', path: paths.lineManager.fireDrills, icon: 'ic-compliance' },
  { label: 'Leave Requests', path: paths.lineManager.leaveApproval.root, icon: 'ic-check' },
  { label: 'Client Feedback', path: paths.lineManager.feedback, icon: 'ic-feedback' },
];

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

export function LineManagerQuickActions() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1.5 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={1.5}>
        {QUICK_ACTIONS.map((action) => (
          <Grid key={action.path} xs={12} sm={6} md={4}>
            <Card
              component={RouterLink}
              href={action.path}
              sx={{
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
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'common.white',
                  bgcolor: 'primary.main',
                }}
              >
                <SvgColor src={icon(action.icon)} sx={{ width: 22, height: 22 }} />
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
