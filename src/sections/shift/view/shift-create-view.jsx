import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { ShiftNewEditForm } from '../shift-new-edit-form';

// ----------------------------------------------------------------------

export function ShiftCreateView() {
  const { organizationId } = useCurrentOrganization();

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add shift"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Rota' },
          { name: 'Shifts', href: paths.owner.shifts.root },
          { name: 'New shift' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ShiftNewEditForm organizationId={organizationId} />
    </DashboardContent>
  );
}
