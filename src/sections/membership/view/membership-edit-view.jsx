import { useEffect } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { MembershipNewEditForm } from '../membership-new-edit-form';

// ----------------------------------------------------------------------

export function MembershipEditView({ membership: currentMembership }) {
  const router = useRouter();

  useEffect(() => {
    if (currentMembership?._id && currentMembership.status !== 'pending') {
      router.replace(paths.owner.memberships.invitations.detail(currentMembership._id));
    }
  }, [currentMembership, router]);

  if (currentMembership && currentMembership.status !== 'pending') {
    return null;
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit invitation"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Invitations', href: paths.owner.memberships.invitations.root },
          { name: currentMembership?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 }, textTransform: 'capitalize' }}
      />

      <MembershipNewEditForm
        organizationId={currentMembership?.organizationId}
        currentMembership={currentMembership}
      />
    </DashboardContent>
  );
}
