import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import TrainingListView from 'src/sections/active-sections/training/view/training-list-view';

const metadata = { title: `Training Records | Line Manager - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <TrainingListView />
    </>
  );
}
