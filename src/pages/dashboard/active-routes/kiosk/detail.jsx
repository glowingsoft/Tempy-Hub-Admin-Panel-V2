import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

import { CONFIG } from 'src/config-global';
import { KioskDetailView } from 'src/sections/active-sections/kiosk/view/kiosk-detail-view';

// ----------------------------------------------------------------------

const metadata = { title: `Kiosk Details | Dashboard - ${CONFIG.site.name}` };

export default function Page({ ownerDashboard = false }) {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <KioskDetailView ownerDashboard={ownerDashboard} />
    </>
  );
}

Page.propTypes = {
  ownerDashboard: PropTypes.bool,
};
