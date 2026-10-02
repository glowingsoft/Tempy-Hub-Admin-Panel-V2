import { useSelector } from 'react-redux';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ShiftNewEditForm } from '../shift-new-edit-form';
import { getOwnerOrganizationId } from '../utils';

// ----------------------------------------------------------------------

export function ShiftCreateView() {
  const { user } = useSelector((state) => state.user);
  const organizationId = getOwnerOrganizationId(user);

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
