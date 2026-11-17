import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/config-global';
import { varAlpha, bgGradient } from 'src/theme/styles';

// ----------------------------------------------------------------------

export function AnnouncementHero({
  title = 'Announcements & Updates',
  coverUrl,
  sx,
  ...other
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        ...bgGradient({
          color: `0deg, ${varAlpha(theme.vars.palette.grey['900Channel'], 0.65)}, ${varAlpha(theme.vars.palette.grey['900Channel'], 0.65)}`,
          imgUrl: coverUrl || `${CONFIG.site.basePath}/assets/images/about/hero.webp`,
        }),
        height: { xs: 180, md: 240 },
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        px: { xs: 3, md: 5 },
        mb: 3,
        ...sx,
      }}
      {...other}
    >
      <Typography
        variant="h3"
        component="h1"
        sx={{
          color: 'common.white',
          fontWeight: 700,
          letterSpacing: -0.5,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
}

AnnouncementHero.propTypes = {
  title: PropTypes.string,
  coverUrl: PropTypes.string,
  sx: PropTypes.object,
};
