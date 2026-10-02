import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';
import { DataUsageView } from 'src/sections/data-usage/view';

// ----------------------------------------------------------------------

const metadata = { title: `Data Usage | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DataUsageView rootPath={paths.dashboard.root} />
    </>
  );
}
