import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';

import { VisitorFeedbackTable } from '../visitor-feedback-table';

// ----------------------------------------------------------------------

function VisitorFeedbackListView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Visitor Feedback"
        links={[
          { name: 'Dashboard', href: paths.siteManager.root },
          { name: 'Visitor Feedback' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <VisitorFeedbackTable />
    </DashboardContent>
  );
}

export default VisitorFeedbackListView;
