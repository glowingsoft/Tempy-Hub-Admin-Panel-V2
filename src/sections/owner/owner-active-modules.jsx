import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

import { activeModules as defaultData } from './mocks/data';

// ----------------------------------------------------------------------

export function OwnerActiveModules({
  title = 'Active modules',
  subheader = 'Currently entitled for this organization',
  data = defaultData,
  sx,
  ...other
}) {
  const theme = useTheme();

  const total = data.length || 1;
  const activeCount = data.filter((m) => m.active).length;
  const activePct = Math.round((activeCount / total) * 100);

  return (
    <Card sx={{ height: 1, display: 'flex', flexDirection: 'column', ...sx }} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ pb: 1 }} />

      <CardContent
        sx={{
          p: 3,
          pt: 1.5,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Entitlement Coverage Progress */}
        <Box sx={{ mb: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1, typography: 'caption', color: 'text.secondary' }}
          >
            <span>
              Entitlement: <strong>{activeCount} of {total}</strong> active
            </span>
            <span>{activePct}%</span>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={activePct}
            color="success"
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: 'background.neutral',
            }}
          />
        </Box>

        {/* Modules Chips Flexbox */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.25,
            py: 1,
          }}
        >
          {data.map((module) => {
            if (module.active) {
              return (
                <Box
                  key={module.name}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.75,
                    py: 0.85,
                    borderRadius: '24px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    bgcolor: varAlpha(theme.vars.palette.success.mainChannel, 0.12),
                    color: theme.vars.palette.success.darker || 'success.dark',
                    border: `1px solid ${varAlpha(theme.vars.palette.success.mainChannel, 0.24)}`,
                    transition: (t) => t.transitions.create(['transform', 'box-shadow']),
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: (t) => t.customShadows?.z4,
                    },
                  }}
                >
                  <Iconify
                    icon="eva:checkmark-fill"
                    sx={{ width: 16, height: 16, color: 'success.main', flexShrink: 0 }}
                  />
                  <span>{module.name}</span>
                </Box>
              );
            }

            return (
              <Box
                key={module.name}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.75,
                  py: 0.85,
                  borderRadius: '24px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.12),
                  color: 'text.disabled',
                  border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                }}
              >
                <span>{module.name}</span>
              </Box>
            );
          })}
        </Box>

        {/* Informative Footer Disclaimer */}
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            mt: 2,
            pt: 1.5,
            borderTop: (t) => `1px dashed ${t.vars.palette.divider}`,
            display: 'block',
          }}
        >
          Greyed-out modules aren&apos;t active yet — contact sales to add them.
        </Typography>
      </CardContent>
    </Card>
  );
}
