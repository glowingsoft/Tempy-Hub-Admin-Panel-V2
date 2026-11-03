import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

export function DataUsageSummaryCard({
  title,
  total,
  subtitle,
  icon,
  color = 'primary',
  badge,
  loading = false,
  sx,
  ...other
}) {
  const theme = useTheme();

  if (loading) {
    return <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2, ...sx }} />;
  }

  return (
    <Card
      sx={{
        py: 3,
        pl: 3,
        pr: 2.5,
        height: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: (theme.customShadows && theme.customShadows.card) || theme.shadows[2],
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme.customShadows && theme.customShadows.z8) || theme.shadows[4],
        },
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ flexGrow: 1, pr: 6 }}>
        {/* Main Value */}
        <Box sx={{ typography: 'h3', fontWeight: 700, lineHeight: 1.2 }}>
          {total}
        </Box>

        {/* Title and Badge */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
          <Typography noWrap variant="subtitle2" component="div" sx={{ color: 'text.secondary' }}>
            {title}
          </Typography>

          {badge && (
            <Label
              color={badge.color || 'default'}
              variant="soft"
              sx={{ height: 20, px: 0.75, fontSize: '0.75rem', fontWeight: 600 }}
            >
              {badge.text}
            </Label>
          )}
        </Stack>

        {/* Subtitle context line */}
        {subtitle && (
          <Typography
            noWrap
            variant="caption"
            sx={{ color: 'text.disabled', display: 'block', mt: 0.25 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Top right icon */}
      {typeof icon === 'string' && icon.endsWith('.svg') ? (
        <SvgColor
          src={icon}
          sx={{
            top: 24,
            right: 20,
            width: 36,
            height: 36,
            position: 'absolute',
            background: `linear-gradient(135deg, ${theme.vars.palette[color].main} 0%, ${theme.vars.palette[color].dark} 100%)`,
          }}
        />
      ) : (
        <Box
          sx={{
            top: 24,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'flex',
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            color: `${color}.main`,
            bgcolor: varAlpha(theme.vars.palette[color].mainChannel, 0.12),
          }}
        >
          <Iconify icon={icon || 'solar:database-bold-duotone'} width={26} />
        </Box>
      )}

      {/* Decorative ambient background shape identical to dashboard main cards */}
      <Box
        sx={{
          top: -44,
          width: 160,
          zIndex: -1,
          height: 160,
          right: -104,
          opacity: 0.12,
          borderRadius: 3,
          position: 'absolute',
          transform: 'rotate(40deg)',
          background: `linear-gradient(to right, ${theme.vars.palette[color].main} 0%, ${varAlpha(theme.vars.palette[color].mainChannel, 0)} 100%)`,
        }}
      />
    </Card>
  );
}
