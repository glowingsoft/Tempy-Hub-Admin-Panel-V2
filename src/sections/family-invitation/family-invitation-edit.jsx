import { useParams } from 'src/routes/hooks';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { useGetFamilyInvitationQuery } from 'src/store/Reducer/family-invitations-api';

import { FamilyInvitationForm } from './family-invitation-form';

// ----------------------------------------------------------------------

export function FamilyInvitationEditView() {
  const { id } = useParams();
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId } = useCurrentOrganization();
  const listPath = familyPaths.familyMemberships?.invitations?.root || familyPaths.familyOverview;

  const { data: invitation, isLoading, isError } = useGetFamilyInvitationQuery(
    { organizationId, familyInvitationId: id },
    { skip: !organizationId || !id }
  );

  if (isLoading && !invitation) {
    return (
      <DashboardContent maxWidth="xl">
        <LoadingScreen />
      </DashboardContent>
    );
  }

  if (!invitation || isError) {
    return (
      <DashboardContent maxWidth="xl">
        <EmptyContent filled title="Invitation not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading={invitation.name}
        links={[
          { name: 'Dashboard', href: familyPaths.dashboardRoot },
          { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.dashboardRoot },
          { name: 'Invitations', href: listPath },
          { name: invitation.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FamilyInvitationForm currentInvitation={invitation} />
    </DashboardContent>
  );
}
