import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

export function AnalyticsActiveModules({
  title,
  subheader,
  modules = [],
  note,
  loading = false,
  sx,
  ...other
}) {
  const enabledCount = modules.filter((mod) => mod.enabled).length;
  const hasDisabled = enabledCount < modules.length;

  return (
    <Card sx={sx} {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={
          !loading && modules.length > 0 ? (
            <Label variant="soft" color="success">
              {enabledCount}/{modules.length} active
            </Label>
          ) : null
        }
      />

      <Box sx={{ px: 3, pb: 3, pt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} variant="rounded" width={index % 2 ? 120 : 150} height={32} sx={{ borderRadius: 1.5 }} />
            ))}
          </Box>
        ) : modules.length === 0 ? (
          <EmptyContent
            filled
            title="No modules yet"
            description="Modules this organization is entitled to will appear here."
            sx={{ py: 5 }}
            slotProps={{ img: { maxWidth: 96 } }}
          />
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {modules.map((mod) => {
              const chip = (
                <Label
                  key={mod.slug || mod.label}
                  variant={mod.enabled ? 'soft' : 'outlined'}
                  color={mod.enabled ? 'success' : 'default'}
                  startIcon={
                    <Iconify
                      icon={mod.enabled ? 'eva:checkmark-fill' : 'solar:lock-keyhole-minimalistic-bold'}
                    />
                  }
                  sx={{
                    height: 32,
                    px: 1.25,
                    fontSize: '0.8125rem',
                    transition: (theme) => theme.transitions.create(['background-color', 'border-color']),
                    ...(!mod.enabled && {
                      color: 'text.disabled',
                      borderStyle: 'dashed',
                    }),
                  }}
                >
                  {mod.label}
                </Label>
              );

              return mod.enabled ? (
                chip
              ) : (
                <Tooltip key={mod.slug || mod.label} title="Contact sales to activate this module">
                  {chip}
                </Tooltip>
              );
            })}
          </Box>
        )}

        {!loading && hasDisabled && (
          <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', mt: 2 }}>
            {note || "Greyed-out modules aren't active yet — contact sales to add them."}
          </Typography>
        )}
      </Box>
    </Card>
  );
}
