import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import FeedbackListView from 'src/sections/active-sections/feedback/view/feedback-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Client Feedback | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <FeedbackListView />
    </>
  );
}
