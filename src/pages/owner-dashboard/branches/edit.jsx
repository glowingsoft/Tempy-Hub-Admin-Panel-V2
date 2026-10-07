import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';

import { useGetBranchQuery } from 'src/store/Reducer/branches-api';
import { BranchEditView } from 'src/sections/branch/view';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';

// ----------------------------------------------------------------------

const metadata = { title: `Edit site | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();
  const { user } = useSelector((state) => state.user);
  const organizationId = getOwnerOrganizationId(user);
  const { data: currentBranch, isLoading, isError, error } = useGetBranchQuery(
    { branchId: id, organizationId },
    { skip: !id || !organizationId }
  );

  if (!organizationId) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Alert severity="error">Your account does not have an organization ID.</Alert>
      </Box>
    );
  }

  if (isLoading) {
    return <LoadingScreen sx={{ py: 10 }} />;
  }

  if (isError) {
    const errorMessage =
      error?.data?.message || error?.data?.error || error?.error || 'Unable to load site details.';

    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Alert severity="error">{errorMessage}</Alert>
      </Box>
    );
  }

  if (!currentBranch) {
    return <EmptyContent filled title="Site not found" sx={{ py: 10 }} />;
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BranchEditView branch={currentBranch} />
    </>
  );
}
