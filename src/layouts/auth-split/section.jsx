import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/config-global';
import { varAlpha, bgGradient } from 'src/theme/styles';

// ----------------------------------------------------------------------

export function Section({
  sx,
  layoutQuery = 'md',
  title = 'Hi, Welcome back',
  imgUrl = `${CONFIG.site.basePath}/assets/illustrations/tempy-login-illustration.jpg`,
  subtitle = 'Streamline care home operations, rotas, and staff attendance with real-time clarity.',
  ...other
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        ...bgGradient({
          color: `180deg, ${varAlpha(
            theme.vars.palette.background.defaultChannel,
            0.88
          )} 0%, ${varAlpha(theme.vars.palette.primary.lighterChannel, 0.2)} 100%`,
          imgUrl: `${CONFIG.site.basePath}/assets/background/background-3-blur.webp`,
        }),
        display: 'none',
        position: 'relative',
        borderRight: (t) => `1px solid ${varAlpha(t.vars.palette.grey['500Channel'], 0.12)}`,
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
          flex: '0 0 50%',
          width: '50%',
          maxWidth: '50%',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: { md: 5, lg: 7, xl: 9 },
          pt: 'calc(var(--layout-header-desktop-height) + 24px)',
        },
        ...sx,
      }}
      {...other}
    >
      <Box
        sx={{
          width: 1,
          maxWidth: 580,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 3.5,
        }}
      >
        <div>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: -0.5,
              color: 'text.primary',
              mb: 1.5,
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.6,
                maxWidth: 460,
                mx: 'auto',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </div>

        <Box
          sx={{
            width: 1,
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: 'background.paper',
            boxShadow: (t) => `0 24px 48px -12px ${varAlpha(t.vars.palette.primary.darkerChannel, 0.18)}`,
            border: (t) => `1px solid ${varAlpha(t.vars.palette.grey['500Channel'], 0.16)}`,
            transition: 'transform 0.35s ease, box-shadow 0.35s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: (t) => `0 32px 64px -16px ${varAlpha(t.vars.palette.primary.darkerChannel, 0.26)}`,
            },
          }}
        >
          <Box
            component="img"
            alt="Tempy Hub Login Illustration"
            src={imgUrl}
            sx={{
              width: 1,
              height: 'auto',
              aspectRatio: '4/3',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
