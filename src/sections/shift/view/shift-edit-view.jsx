import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetShiftQuery } from 'src/store/Reducer/shifts-api';

import { ShiftNewEditForm } from '../shift-new-edit-form';

// ----------------------------------------------------------------------

export function ShiftEditView({ shift: propShift }) {
  const { id } = useParams();
  const shiftId = id || propShift?._id;

  const { organizationId } = useCurrentOrganization();
  const { data: apiShift, isLoading } = useGetShiftQuery(
    { shiftId, organizationId },
    { skip: !shiftId }
  );

  const currentShift =
    apiShift?.data && typeof apiShift.data === 'object' && !Array.isArray(apiShift.data)
      ? apiShift.data
      : apiShift || propShift;

  if (isLoading) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Edit shift"
          links={[
            { name: 'Dashboard', href: paths.owner.root },
            { name: 'Rota' },
            { name: 'Shifts', href: paths.owner.shifts.root },
            { name: 'Loading...' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
      </DashboardContent>
    );
  }

  if (!currentShift) {
    return (
      <DashboardContent>
        <EmptyContent filled title="Shift not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  const shiftOrgId =
    currentShift?.organizationId?._id || currentShift?.organizationId || organizationId;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit shift"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Rota' },
          { name: 'Shifts', href: paths.owner.shifts.root },
          { name: 'Edit shift' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ShiftNewEditForm
        organizationId={shiftOrgId}
        currentShift={currentShift}
      />
    </DashboardContent>
  );
}
