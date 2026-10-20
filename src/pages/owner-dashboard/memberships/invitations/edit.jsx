import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { LoadingScreen } from 'src/components/loading-screen';
import { EmptyContent } from 'src/components/empty-content';

import { MembershipEditView } from 'src/sections/membership/view';
import { useGetInvitationQuery } from 'src/store/Reducer/invitations-api';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

// ----------------------------------------------------------------------

const metadata = { title: `Edit invitation | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();
  const { organizationId } = useCurrentOrganization();

  const {
    data: currentMembership,
    isLoading,
    isError,
    error,
  } = useGetInvitationQuery(
    { invitationId: id, organizationId },
    { skip: !id || !organizationId }
  );

  if (isLoading) {
    return <LoadingScreen sx={{ py: 10 }} />;
  }

  if (isError) {
    const errorMessage =
      error?.data?.message || error?.data?.error || error?.error || 'Unable to load invitation details.';

    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Alert severity="error">{errorMessage}</Alert>
      </Box>
    );
  }

  if (!currentMembership) {
    return <EmptyContent filled title="Invitation not found" sx={{ py: 10 }} />;
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <MembershipEditView membership={currentMembership} />
    </>
  );
}
