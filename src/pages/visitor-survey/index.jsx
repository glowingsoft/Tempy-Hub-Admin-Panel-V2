import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { VisitorSurveySubmitView } from 'src/sections/active-sections/visitor-feedback/view/visitor-survey-submit-view';

// ----------------------------------------------------------------------

const metadata = { title: `Visitor Survey - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <VisitorSurveySubmitView />
    </>
  );
}
