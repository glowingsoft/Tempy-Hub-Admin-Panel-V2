import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';

import { FamilyInvitationForm } from './family-invitation-form';

// ----------------------------------------------------------------------

export function FamilyInvitationCreateView() {
  const familyPaths = useFamilyEngagementPaths();
  const listPath = familyPaths.familyMemberships?.invitations?.root || familyPaths.familyOverview;

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="New Family Invitation"
        links={[
          { name: 'Dashboard', href: familyPaths.dashboardRoot },
          { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.dashboardRoot },
          { name: 'Invitations', href: listPath },
          { name: 'New Invitation' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FamilyInvitationForm />
    </DashboardContent>
  );
}
