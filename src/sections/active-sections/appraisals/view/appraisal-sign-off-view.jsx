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
import { useGetAppraisalByIdQuery } from 'src/store/Reducer/appraisals-api';
import { SessionSignOffCard } from '../../common/session-sign-off-card';

// ----------------------------------------------------------------------

export default function AppraisalSignOffView() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { organizationId } = useCurrentOrganization();

  const {
    data: appraisalData,
    isLoading,
    isError,
    refetch,
  } = useGetAppraisalByIdQuery(
    { organizationId, appraisalId: id },
    { skip: !organizationId || !id }
  );

  const appraisal = appraisalData?.data || appraisalData;

  const dashboardRoutes = useMemo(() => {
    if (pathname.startsWith('/site-manager')) {
      return {
        dashboardName: 'Dashboard',
        dashboardHref: paths.siteManager.root,
        appraisalHref: paths.siteManager.appraisal,
        detailHref: paths.siteManager.appraisalDetail(id),
      };
    }
    if (pathname.startsWith('/owner-dashboard')) {
      return {
        dashboardName: 'Dashboard',
        dashboardHref: paths.owner.root,
        appraisalHref: paths.owner.appraisal,
        detailHref: paths.owner.appraisalDetail(id),
      };
    }
    return {
      dashboardName: 'Dashboard',
      dashboardHref: paths.lineManager.root,
      appraisalHref: paths.lineManager.appraisal,
      detailHref: paths.lineManager.appraisalDetail(id),
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

  if (isError || !appraisal) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
            Back
          </Button>
        </Box>
        <EmptyContent
          filled
          title="Appraisal record not found"
          description="Could not load the requested appraisal session."
          action={
            <Button variant="contained" onClick={() => router.push(dashboardRoutes.appraisalHref)}>
              Return to Appraisals
            </Button>
          }
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  const staff = appraisal.staff || appraisal.staffProfile || appraisal.staffUser || {};
  const staffName = staff.name || appraisal.staffName || appraisal.name || 'Staff Member';

  return (
    <DashboardContent>
      <Box sx={{ mb: 2 }}>
        <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading="Appraisal Sign-Off"
        links={[
          { name: dashboardRoutes.dashboardName, href: dashboardRoutes.dashboardHref },
          { name: 'Appraisals', href: dashboardRoutes.appraisalHref },
          { name: staffName, href: dashboardRoutes.detailHref },
          { name: 'Sign-Off' },
        ]}
        sx={{ mb: 4 }}
      />

      <SessionSignOffCard
        session={appraisal}
        organizationId={organizationId}
        type="appraisal"
        onSave={() => {
          refetch();
          router.push(dashboardRoutes.detailHref);
        }}
        onCancel={router.back}
        readOnly={Boolean(appraisal?.signedOff || appraisal?.signature)}
      />
    </DashboardContent>
  );
}