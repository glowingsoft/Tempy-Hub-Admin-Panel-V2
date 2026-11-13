import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';
import { usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { VisitorFeedbackTable } from '../visitor-feedback-table';

// ----------------------------------------------------------------------

function VisitorFeedbackListView({ ownerDashboard = false }) {
  const pathname = usePathname();
  const isOwnerDashboard = ownerDashboard || pathname.includes('/owner-dashboard');
  const isLineManager = pathname.includes('/line-manager');
  const dashboardRoot = isOwnerDashboard
    ? paths.owner.root
    : isLineManager
      ? paths.lineManager.root
      : paths.siteManager.root;
  const { branchId, onBranchChange } = useOwnerBranchFilter();

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Visitor Feedback"
        links={[
          { name: 'Dashboard', href: dashboardRoot },
          { name: 'Visitor Feedback' },
        ]}
        action={
          isOwnerDashboard ? (
            <OwnerBranchFilterActions value={branchId} onChange={onBranchChange} />
          ) : null
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <VisitorFeedbackTable ownerDashboard={isOwnerDashboard} selectedBranchId={branchId} />
    </DashboardContent>
  );
}

export default VisitorFeedbackListView;
