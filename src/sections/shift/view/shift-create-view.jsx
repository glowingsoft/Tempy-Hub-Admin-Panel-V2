import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { ShiftNewEditForm } from '../shift-new-edit-form';

// ----------------------------------------------------------------------

export function ShiftCreateView() {
  const { organizationId } = useCurrentOrganization();
  const pathname = usePathname();

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

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add shift"
        links={[
          { name: 'Dashboard', href: dashboardRoot },
          // { name: 'Rota' },
          { name: 'Shifts', href: shiftBase.root },
          { name: 'New shift' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ShiftNewEditForm organizationId={organizationId} />
    </DashboardContent>
  );
}
