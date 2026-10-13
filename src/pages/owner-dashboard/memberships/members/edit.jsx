import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { LoadingScreen } from 'src/components/loading-screen';
import { EmptyContent } from 'src/components/empty-content';

import { MemberEditView } from 'src/sections/member/view';
import { getMockMemberById } from 'src/sections/member/mocks/data';
import { useGetMemberQuery } from 'src/store/Reducer/members-api';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';

// ----------------------------------------------------------------------

const metadata = { title: `Edit membership | Owner Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  const { id = '' } = useParams();
  const { user } = useSelector((state) => state.user);
  const organizationId = getOwnerOrganizationId(user);

  const {
    data: apiMember,
    isLoading,
    isError,
    error,
  } = useGetMemberQuery(
    { membershipId: id, organizationId },
    { skip: !id || !organizationId }
  );

  const mockMember = useMemo(() => getMockMemberById(id), [id]);
  const currentMember = apiMember || mockMember;

  if (isLoading) {
    return <LoadingScreen sx={{ py: 10 }} />;
  }

  if (isError) {
    const errorMessage =
      error?.data?.message || error?.data?.error || error?.error || 'Unable to load member details.';

    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Alert severity="error">{errorMessage}</Alert>
      </Box>
    );
  }

  if (!currentMember) {
    return <EmptyContent filled title="Member not found" sx={{ py: 10 }} />;
  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <MemberEditView member={currentMember} />
    </>
  );
}
