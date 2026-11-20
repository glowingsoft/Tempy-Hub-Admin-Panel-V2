import { paths } from 'src/routes/paths';
import { useParams, usePathname } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetShiftQuery } from 'src/store/Reducer/shifts-api';

import { ShiftNewEditForm } from '../shift-new-edit-form';

// ----------------------------------------------------------------------

export function ShiftEditView({ shift: propShift }) {
  const { id } = useParams();
  const pathname = usePathname();
  const shiftId = id || propShift?._id;

  const isLineManager = pathname.startsWith(paths.lineManager.root);
  const isSiteManager = pathname.startsWith(paths.siteManager.root);
  const shiftBase = isLineManager
    ? paths.lineManager.shifts
    : isSiteManager
      ? paths.siteManager.shifts
      : paths.owner.shifts;
  const dashboardRoot = isLineManager
    ? paths.lineManager.root
    : isSiteManager
      ? paths.siteManager.root
      : paths.owner.root;

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
            { name: 'Dashboard', href: dashboardRoot },
            // { name: 'Rota' },
            { name: 'Shifts', href: shiftBase.root },
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

  const shiftOrgId = currentShift?.organizationId?._id || currentShift?.organizationId || organizationId;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit shift"
        links={[
          { name: 'Dashboard', href: dashboardRoot },
          // { name: 'Rota' },
          { name: 'Shifts', href: shiftBase.root },
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
