import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';

import { ShiftNewEditForm } from '../shift-new-edit-form';

// ----------------------------------------------------------------------

export function ShiftEditView({ shift: currentShift }) {
  if (!currentShift) {
    return (
      <DashboardContent>
        <EmptyContent filled title="Shift not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

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
        organizationId={currentShift.organizationId}
        currentShift={currentShift}
      />
    </DashboardContent>
  );
}
