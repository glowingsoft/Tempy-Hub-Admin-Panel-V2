import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import { useTheme } from '@mui/material/styles';

import { usePathname } from 'src/routes/hooks';
import { varAlpha } from 'src/theme/styles';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';
import { NavSectionVertical } from 'src/components/nav-section';
import { getDashboardPath } from 'src/auth/utils/get-dashboard-path';

import { NavUpgrade } from '../components/nav-upgrade';
import { Searchbar } from '../components/searchbar';

// ----------------------------------------------------------------------

const AUTH_LOGO = { width: 64, height: 52 };

export function NavMobile({ data, open, onClose, slots, sx, ...other }) {
  const theme = useTheme();
  const pathname = usePathname();
  const user = useSelector((state) => state.user?.user);
  const logoHref = getDashboardPath(user);

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          overflow: 'unset',
          bgcolor: 'var(--layout-nav-bg)',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      {slots?.topArea ?? (
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Logo href={logoHref} width={AUTH_LOGO.width} height={AUTH_LOGO.height} />
        </Box>
      )}

      <Box sx={{ px: 2, pb: 1.5 }}>
        <Searchbar
          data={data}
          showLabel
          sx={{
            width: 1,
            height: 40,
            px: 1.25,
            borderRadius: 1,
            cursor: 'pointer',
            justifyContent: 'space-between',
            border: `1px solid ${theme.vars.palette.divider}`,
            bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
            '&:hover': {
              bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            },
          }}
        />
      </Box>

      <Scrollbar fillContent>
        <NavSectionVertical data={data} sx={{ px: 2, flex: '1 1 auto' }} {...other} />
        {/* <NavUpgrade /> */}
      </Scrollbar>

      {slots?.bottomArea}
    </Drawer>
  );
}
