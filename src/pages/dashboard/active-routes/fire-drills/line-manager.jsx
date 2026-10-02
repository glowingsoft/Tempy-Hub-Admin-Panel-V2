import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';
import { FireDrillsView } from 'src/sections/active-sections/fire-drills/view/fire-drills-view';

// ----------------------------------------------------------------------
// Line Manager entry point — same view as Site Manager, scoped to the
// manager's own site (no site filter).

const metadata = { title: `Fire Drills | Dashboard - ${CONFIG.site.name}` };

export default function Page({ rootPath }) {
  const { user } = useSelector((state) => state.user);
  const defaultRoot = user?.permission === 1 ? paths.dashboard.root : paths.lineManager.root;

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <FireDrillsView rootPath={rootPath || defaultRoot} />
    </>
  );
}
