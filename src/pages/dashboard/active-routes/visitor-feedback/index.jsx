import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import VisitorFeedbackListView from 'src/sections/active-sections/visitor-feedback/view/visitor-feedback-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Visitor Feedback | Dashboard - ${CONFIG.site.name}` };

export default function Page({ ownerDashboard = false }) {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <VisitorFeedbackListView ownerDashboard={ownerDashboard} />
    </>
  );
}
