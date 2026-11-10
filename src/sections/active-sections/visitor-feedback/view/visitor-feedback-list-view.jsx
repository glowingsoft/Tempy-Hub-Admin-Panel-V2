import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { VisitorFeedbackTable } from '../visitor-feedback-table';

// ----------------------------------------------------------------------

function VisitorFeedbackListView() {
  const pathname = usePathname();
  const isLineManager = pathname.includes('/line-manager');
  const dashboardRoot = isLineManager ? paths.lineManager.root : paths.siteManager.root;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Visitor Feedback"
        links={[
          { name: 'Dashboard', href: dashboardRoot },
          { name: 'Visitor Feedback' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <VisitorFeedbackTable />
    </DashboardContent>
  );
}

export default VisitorFeedbackListView;
