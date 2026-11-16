import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import VisitorFeedbackDetailView from 'src/sections/active-sections/visitor-feedback/view/visitor-feedback-detail-view';

// ----------------------------------------------------------------------

const metadata = { title: `Visitor Feedback Details | Dashboard - ${CONFIG.site.name}` };

export default function Page({ ownerDashboard = false }) {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <VisitorFeedbackDetailView ownerDashboard={ownerDashboard} />
    </>
  );
}

