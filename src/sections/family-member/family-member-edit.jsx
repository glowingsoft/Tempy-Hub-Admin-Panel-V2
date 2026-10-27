import Button from '@mui/material/Button';

import { useParams, useRouter } from 'src/routes/hooks';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { useGetFamilyMemberQuery } from 'src/store/Reducer/family-members-api';

import { FamilyMemberForm } from './family-member-form';

// ----------------------------------------------------------------------

export function FamilyMemberEditView() {
  const { id } = useParams();
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId } = useCurrentOrganization();
  const listPath = familyPaths.familyMemberships?.members?.root || familyPaths.familyOverview;

  const { data: member, isLoading, isError } = useGetFamilyMemberQuery(
    { organizationId, memberId: id },
    { skip: !organizationId || !id }
  );

  if (isLoading && !member) {
    return (
      <DashboardContent maxWidth="xl">
        <LoadingScreen />
      </DashboardContent>
    );
  }

  if (!member || isError) {
    return (
      <DashboardContent maxWidth="xl">
        <Button
          onClick={() => router.push(listPath)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Family member not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading={member.name}
        links={[
          { name: 'Dashboard', href: familyPaths.dashboardRoot },
          { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.dashboardRoot },
          { name: 'Members', href: listPath },
          { name: member.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FamilyMemberForm currentMember={member} />
    </DashboardContent>
  );
}
