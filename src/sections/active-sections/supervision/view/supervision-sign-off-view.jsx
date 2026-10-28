import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { useParams, useRouter, usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useGetSupervisionByIdQuery } from 'src/store/Reducer/supervision-api';
import { SessionSignOffCard } from '../../common/session-sign-off-card';

// ----------------------------------------------------------------------

export default function SupervisionSignOffView() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { organizationId } = useCurrentOrganization();

  const {
    data: supervisionData,
    isLoading,
    isError,
    refetch,
  } = useGetSupervisionByIdQuery(
    { organizationId, supervisionId: id },
    { skip: !organizationId || !id }
  );

  const supervision = supervisionData?.data || supervisionData;

  const dashboardRoutes = useMemo(() => {
    if (pathname.startsWith('/site-manager')) {
      return {
        dashboardName: 'Dashboard',
        dashboardHref: paths.siteManager.root,
        supervisionHref: paths.siteManager.supervision,
        detailHref: paths.siteManager.supervisionDetail(id),
      };
    }
    if (pathname.startsWith('/owner-dashboard')) {
      return {
        dashboardName: 'Dashboard',
        dashboardHref: paths.owner.root,
        supervisionHref: paths.owner.supervision,
        detailHref: paths.owner.supervisionDetail(id),
      };
    }
    return {
      dashboardName: 'Dashboard',
      dashboardHref: paths.lineManager.root,
      supervisionHref: paths.lineManager.supervision,
      detailHref: paths.lineManager.supervisionDetail(id),
    };
  }, [pathname, id]);

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
            Back
          </Button>
        </Box>
        <LoadingScreen sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  if (isError || !supervision) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
            Back
          </Button>
        </Box>
        <EmptyContent
          filled
          title="Supervision session not found"
          description="Could not load the requested supervision session."
          action={
            <Button variant="contained" onClick={() => router.push(dashboardRoutes.supervisionHref)}>
              Return to Supervisions
            </Button>
          }
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  const staff = supervision.staff || supervision.staffProfile || supervision.staffUser || {};
  const staffName = staff.name || supervision.staffName || supervision.name || 'Staff Member';

  return (
    <DashboardContent>
      <Box sx={{ mb: 2 }}>
        <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading="Supervision Sign-Off"
        links={[
          { name: dashboardRoutes.dashboardName, href: dashboardRoutes.dashboardHref },
          { name: 'Supervision', href: dashboardRoutes.supervisionHref },
          { name: staffName, href: dashboardRoutes.detailHref },
          { name: 'Sign-Off' },
        ]}
        sx={{ mb: 4 }}
      />

      <SessionSignOffCard
        session={supervision}
        organizationId={organizationId}
        type="supervision"
        onSave={() => {
          refetch();
          router.push(dashboardRoutes.detailHref);
        }}
        onCancel={router.back}
        readOnly={Boolean(supervision?.signedOff || supervision?.signature)}
      />
    </DashboardContent>
  );
}