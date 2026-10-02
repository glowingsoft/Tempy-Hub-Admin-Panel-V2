import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { getDataUsageStats } from './mocks/data-usage';

// ----------------------------------------------------------------------

export function DataUsageLinearChart({
  title = 'Data Usage & Images Shared',
  subheader = 'Ahead of usage-based billing considerations',
  rootPath = paths.dashboard.dataUsage.root,
  sx,
  ...other
}) {
  const theme = useTheme();
  const router = useRouter();

  const stats = getDataUsageStats('all');

  const totalUsed = stats.totalUsedGb;
  const quota = stats.quotaGb;
  const overallPercentage = stats.usagePercentage;
  const remainingGb = Math.max(0, quota - totalUsed);

  const imagePercentage = Math.round((stats.imageUsageGb / totalUsed) * 100) || 0;
  const otherFilesPercentage = Math.round((stats.otherFilesGb / totalUsed) * 100) || 0;

  return (
    <Card sx={{ p: 0, ...sx }} {...other}>
      {/* Header with Title & Subheader */}
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          <Button
            size="small"
            color="inherit"
            endIcon={<Iconify icon="solar:eye-bold" width={18} />}
            onClick={() => router.push(rootPath)}
            sx={{ fontWeight: 600 }}
          >
            View Details
          </Button>
        }
        sx={{ px: 3, pt: 2.5, pb: 1 }}
      />

      <Box sx={{ p: 3 }}>
        {/* Main Platform Storage Capacity - Compact with Hover Effect */}
        <Box
          sx={{
            py: 1.5,
            px: 2,
            borderRadius: 1.5,
            bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.04),
            border: (t) => `1px solid ${varAlpha(t.vars.palette.primary.mainChannel, 0.1)}`,
            mb: 2.5,
            transition: (t) => t.transitions.create(['border-color', 'box-shadow'], {
              duration: t.transitions.duration.shorter,
            }),
            '&:hover': {
              borderColor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.28),
              boxShadow: (t) => `0 2px 12px ${varAlpha(t.vars.palette.primary.mainChannel, 0.08)}`,
            },
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 1 }}
          >
            <Stack direction="row" alignItems="baseline" spacing={1} flexWrap="wrap">
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Platform Total Storage Quota:
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {totalUsed.toLocaleString()} GB
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                / {quota.toLocaleString()} GB Total Quota
              </Typography>
            </Stack>

            <Label
              color={
                overallPercentage >= 85 ? 'error' : overallPercentage >= 60 ? 'warning' : 'primary'
              }
              variant="soft"
              sx={{ px: 1, height: 22, fontSize: '0.75rem', fontWeight: 700 }}
            >
              {overallPercentage}% Quota Used
            </Label>
          </Stack>

          {/* Primary Linear Progress Bar with Interactive Hover Effect & Tooltip */}
          <Tooltip
            title={`Platform Storage: ${totalUsed.toLocaleString()} GB used of ${quota.toLocaleString()} GB (${overallPercentage}%) • ${remainingGb.toLocaleString()} GB free`}
            arrow
            placement="top"
          >
            <Box sx={{ py: 0.5, cursor: 'pointer' }}>
              <LinearProgress
                variant="determinate"
                value={overallPercentage}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.16),
                  transition: (t) => t.transitions.create(['height', 'filter', 'box-shadow'], {
                    duration: t.transitions.duration.shorter,
                  }),
                  '&:hover': {
                    height: 12,
                    filter: 'brightness(1.15)',
                    boxShadow: (t) => `0 0 12px ${varAlpha(t.vars.palette.primary.mainChannel, 0.45)}`,
                  },
                  [`& .${linearProgressClasses.bar}`]: {
                    borderRadius: 1,
                    background: `linear-gradient(135deg, ${theme.vars.palette.primary.light} 0%, ${theme.vars.palette.primary.main} 100%)`,
                  },
                }}
              />
            </Box>
          </Tooltip>

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75, typography: 'caption' }}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main' }} />
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {totalUsed.toLocaleString()} GB Used
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'text.disabled' }} />
              <Box component="span" sx={{ color: 'text.secondary' }}>
                {remainingGb.toLocaleString()} GB Remaining Free
              </Box>
            </Stack>
          </Stack>
        </Box>

        {/* File Categories */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="solar:folder-with-files-bold-duotone" width={18} sx={{ color: 'primary.main' }} />
            Usage by File Category
          </Typography>

          <Stack spacing={2.25}>
            {/* Images */}
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                transition: (t) => t.transitions.create(['background-color'], {
                  duration: t.transitions.duration.shorter,
                }),
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: (t) => varAlpha(t.vars.palette.info.mainChannel, 0.12),
                      color: 'info.main',
                    }}
                  >
                    <Iconify icon="solar:gallery-wide-bold-duotone" width={18} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.875rem' }}>
                      Image Usage
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: -0.25 }}>
                      {stats.imageCount.toLocaleString()} images uploaded
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {stats.imageUsageGb} GB
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    ({imagePercentage}% of total)
                  </Typography>
                </Box>
              </Stack>

              {/* Images Linear Progress Bar with Hover Effect & Tooltip */}
              <Tooltip
                title={`Images: ${stats.imageUsageGb} GB (${imagePercentage}% of total storage) • ${stats.imageCount.toLocaleString()} images uploaded`}
                arrow
                placement="top"
              >
                <Box sx={{ py: 0.5, cursor: 'pointer' }}>
                  <LinearProgress
                    variant="determinate"
                    value={imagePercentage}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.12),
                      transition: (t) => t.transitions.create(['height', 'filter', 'box-shadow'], {
                        duration: t.transitions.duration.shorter,
                      }),
                      '&:hover': {
                        height: 12,
                        filter: 'brightness(1.15)',
                        boxShadow: (t) => `0 0 12px ${varAlpha(t.vars.palette.info.mainChannel, 0.45)}`,
                      },
                      [`& .${linearProgressClasses.bar}`]: {
                        borderRadius: 1,
                        background: `linear-gradient(135deg, ${theme.vars.palette.info.light} 0%, ${theme.vars.palette.info.main} 100%)`,
                      },
                    }}
                  />
                </Box>
              </Tooltip>
            </Box>

            {/* Other Files */}
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                transition: (t) => t.transitions.create(['background-color'], {
                  duration: t.transitions.duration.shorter,
                }),
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: (t) => varAlpha(t.vars.palette.secondary.mainChannel, 0.12),
                      color: 'secondary.main',
                    }}
                  >
                    <Iconify icon="solar:document-text-bold-duotone" width={18} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.875rem' }}>
                      Other Files & Documents
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: -0.25 }}>
                      {stats.documentCount.toLocaleString()} documents & audit logs
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {stats.otherFilesGb} GB
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    ({otherFilesPercentage}% of total)
                  </Typography>
                </Box>
              </Stack>

              {/* Other Files Linear Progress Bar with Hover Effect & Tooltip */}
              <Tooltip
                title={`Other Files: ${stats.otherFilesGb} GB (${otherFilesPercentage}% of total storage) • ${stats.documentCount.toLocaleString()} documents & audit logs`}
                arrow
                placement="top"
              >
                <Box sx={{ py: 0.5, cursor: 'pointer' }}>
                  <LinearProgress
                    variant="determinate"
                    value={otherFilesPercentage}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.12),
                      transition: (t) => t.transitions.create(['height', 'filter', 'box-shadow'], {
                        duration: t.transitions.duration.shorter,
                      }),
                      '&:hover': {
                        height: 12,
                        filter: 'brightness(1.15)',
                        boxShadow: (t) => `0 0 12px ${varAlpha(t.vars.palette.secondary.mainChannel, 0.45)}`,
                      },
                      [`& .${linearProgressClasses.bar}`]: {
                        borderRadius: 1,
                        background: `linear-gradient(135deg, ${theme.vars.palette.secondary.light} 0%, ${theme.vars.palette.secondary.main} 100%)`,
                      },
                    }}
                  />
                </Box>
              </Tooltip>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}
