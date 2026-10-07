import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { layoutClasses } from 'src/layouts/classes';

// ----------------------------------------------------------------------

export function Main({ sx, children, layoutQuery, ...other }) {
  const theme = useTheme();

  return (
    <Box
      component="main"
      className={layoutClasses.main}
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        width: 1,
        minHeight: '100vh',
        flexDirection: 'column',
        [theme.breakpoints.up(layoutQuery)]: {
          flexDirection: 'row',
        },
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}

// ----------------------------------------------------------------------

export function Content({ sx, children, layoutQuery, ...other }) {
  const theme = useTheme();

  const renderContent = (
    <Box
      sx={{
        width: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 'var(--layout-auth-content-width)',
        px: { xs: 2.5, sm: 3, md: 4 },
      }}
    >
      {children}
    </Box>
  );

  return (
    <Box
      className={layoutClasses.content}
      sx={{
        px: 2,
        py: 5,
        display: 'flex',
        flex: '1 1 auto',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh',
        [theme.breakpoints.up(layoutQuery)]: {
          width: '50%',
          maxWidth: '50%',
          flex: '0 0 50%',
          px: { md: 4, lg: 7 },
          py: 'calc(var(--layout-header-desktop-height) + 24px)',
        },
        ...sx,
      }}
      {...other}
    >
      {renderContent}
    </Box>
  );
}
