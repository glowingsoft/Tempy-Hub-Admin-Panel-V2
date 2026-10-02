import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';

import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export function DataUsageBreakdownDrawer({ open, onClose, organization }) {
  const theme = useTheme();

  if (!organization) return null;

  const {
    name,
    ownerName,
    ownerEmail,
    status,
    totalUsedGb,
    imageUsageGb,
    otherFilesGb,
    quotaGb,
    usagePercentage,
    imageCount,
    documentCount,
    billingTier,
    billingStatus,
    tierMonthlyCost,
    sites = [],
    categories = [],
  } = organization;

  const quotaColor = usagePercentage >= 90 ? 'error' : usagePercentage >= 70 ? 'warning' : 'primary';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: { invisible: true },
      }}
      PaperProps={{
        sx: {
          width: { xs: 1, sm: 460 },
          boxShadow: theme.customShadows?.z24 || theme.shadows[24],
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5, pb: 2 }}>
        <Typography variant="h6">Storage Breakdown</Typography>
        <IconButton onClick={onClose} edge="end">
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </Stack>

      <Divider />

      <Scrollbar sx={{ p: 3 }}>
        {/* Organization Info Header */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {name}
            </Typography>
            <Label color={status === 'active' ? 'success' : 'warning'} variant="soft">
              {status}
            </Label>
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Owner: {ownerName} ({ownerEmail})
          </Typography>
        </Box>

        {/* Quota Progress Banner */}
        <Card sx={{ p: 2, mb: 3, bgcolor: varAlpha(theme.vars.palette.background.neutralChannel, 0.8) }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Plan Quota Utilization
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {totalUsedGb} GB / {quotaGb} GB ({usagePercentage}%)
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, usagePercentage)}
            color={quotaColor}
            sx={{ height: 8, borderRadius: 1 }}
          />
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Tier: <strong>{billingTier}</strong>
            </Typography>
            <Label color={billingStatus === 'Within Plan' ? 'success' : 'warning'} variant="soft">
              {billingStatus}
            </Label>
          </Stack>
        </Card>

        {/* High-level Storage Split */}
        <Typography
          variant="subtitle2"
          sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}
        >
          Storage Split
        </Typography>

        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: `1px solid ${theme.vars.palette.divider}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                  bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
                }}
              >
                <Iconify icon="solar:gallery-wide-bold-duotone" width={22} />
              </Box>
              <div>
                <Typography variant="subtitle2">Images & Visuals</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {imageCount?.toLocaleString()} items uploaded
                </Typography>
              </div>
            </Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {imageUsageGb} GB
            </Typography>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: `1px solid ${theme.vars.palette.divider}`,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'info.main',
                  bgcolor: varAlpha(theme.vars.palette.info.mainChannel, 0.12),
                }}
              >
                <Iconify icon="solar:document-text-bold-duotone" width={22} />
              </Box>
              <div>
                <Typography variant="subtitle2">Other Files & Documents</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {documentCount?.toLocaleString()} files archived
                </Typography>
              </div>
            </Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'info.main' }}>
              {otherFilesGb} GB
            </Typography>
          </Stack>
        </Stack>

        {/* Content Category Breakdown */}
        {categories.length > 0 && (
          <>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}
            >
              Category Breakdown
            </Typography>
            <Stack spacing={1.25} sx={{ mb: 3 }}>
              {categories.map((cat, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {cat.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      {cat.sizeGb} GB ({cat.count?.toLocaleString()} items)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.round((cat.sizeGb / totalUsedGb) * 100)}
                    color={cat.type === 'image' ? 'primary' : 'info'}
                    sx={{ height: 4, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Stack>
          </>
        )}

        {/* Site / Branch Storage */}
        {sites.length > 0 && (
          <>
            <Typography
              variant="subtitle2"
              sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}
            >
              Site & Branch Storage
            </Typography>
            <Stack spacing={1} sx={{ mb: 3 }}>
              {sites.map((site, index) => (
                <Stack
                  key={index}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderRadius: 1,
                    bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify icon="solar:buildings-bold-duotone" sx={{ color: 'text.secondary' }} width={18} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {site.name}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {site.totalGb} GB{' '}
                    <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                      ({site.imageGb} GB images)
                    </Typography>
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </>
        )}

        {/* Billing Readiness Note */}
        <Card
          sx={{
            p: 2,
            border: `1px dashed ${theme.vars.palette.warning.main}`,
            bgcolor: varAlpha(theme.vars.palette.warning.mainChannel, 0.04),
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Iconify icon="solar:card-2-bold-duotone" sx={{ color: 'warning.main', mt: 0.25 }} width={22} />
            <div>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Billing Projection
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                Monthly base plan: £{tierMonthlyCost}/mo. Overage pricing: £0.15/GB above {quotaGb} GB. Current
                projection: £0 overage.
              </Typography>
            </div>
          </Stack>
        </Card>
      </Scrollbar>
    </Drawer>
  );
}
