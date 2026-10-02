import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { BranchEditView } from 'src/sections/branch/view';
import { getMockBranchById } from 'src/sections/branch/mocks/data';

// ----------------------------------------------------------------------

const metadata = { title: `Edit site | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();

  const currentBranch = getMockBranchById(id);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BranchEditView branch={currentBranch} />
    </>
  );
}
