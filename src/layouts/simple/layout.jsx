import Alert from '@mui/material/Alert';
import { useSelector } from 'react-redux';

import { useBoolean } from 'src/hooks/use-boolean';
import { getDashboardPath, isAuthenticatedUser } from 'src/auth/utils/get-dashboard-path';

import { Main, CompactContent } from './main';
import { HeaderBase } from '../core/header-base';
import { LayoutSection } from '../core/layout-section';

// ----------------------------------------------------------------------

export function SimpleLayout({ sx, children, content }) {
  const mobileNavOpen = useBoolean();
  const user = useSelector((state) => state.user?.user);
  const logoHref = isAuthenticatedUser(user) ? getDashboardPath(user) : '/';

  const layoutQuery = 'md';

  return (
    <LayoutSection
      /** **************************************
       * Header
       *************************************** */
      headerSection={
        <HeaderBase
          layoutQuery={layoutQuery}
          logoWidth={64}
          logoHeight={52}
          logoHref={logoHref}
          onOpenNav={mobileNavOpen.onTrue}
          slotsDisplay={{
            signIn: false,
            account: false,
            helpLink: false,
            settings: false,
            purchase: false,
            contacts: false,
            searchbar: false,
            workspaces: false,
            menuButton: false,
            localization: false,
            notifications: false,
          }}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                This is an info Alert.
              </Alert>
            ),
          }}
          slotProps={{ container: { maxWidth: false } }}
        />
      }
      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
      cssVars={{
        '--layout-simple-content-compact-width': '448px',
      }}
      sx={sx}
    >
      <Main>{content?.compact ? <CompactContent>{children}</CompactContent> : children}</Main>
    </LayoutSection>
  );
}
