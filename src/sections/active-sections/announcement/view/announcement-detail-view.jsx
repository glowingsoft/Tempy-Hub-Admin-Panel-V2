import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { fDateTime } from 'src/utils/format-time';
import { useParams, useRouter, usePathname } from 'src/routes/hooks';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import {
  useGetStaffAnnouncementDetailQuery,
  useGetAnnouncementByIdQuery,
} from 'src/store/Reducer/announcements-api';

// ----------------------------------------------------------------------

export function AnnouncementDetailView({
  ownerDashboard = false,
  siteManagerDashboard = false,
  staffDashboard = false,
}) {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { organizationId } = useCurrentOrganization();

  const isStaffRoute = staffDashboard || pathname.startsWith(`${paths.staff.root}/`) || pathname.startsWith('/staff');
  const isOwnerRoute = ownerDashboard || pathname.startsWith('/owner-dashboard');
  const isSiteManagerRoute = siteManagerDashboard || pathname.startsWith('/site-manager-dashboard');
  const isLineManagerRoute = pathname.startsWith('/line-manager');

  const isStaff = isStaffRoute && !isOwnerRoute && !isSiteManagerRoute;

  const staffQuery = useGetStaffAnnouncementDetailQuery(
    { announcementId: id, organizationId },
    { skip: !id || !organizationId || !isStaff }
  );

  const adminQuery = useGetAnnouncementByIdQuery(
    { announcementId: id, organizationId },
    { skip: !id || !organizationId || isStaff }
  );

  const {
    data: announcementData,
    isLoading,
    isError,
    error,
  } = isStaff ? staffQuery : adminQuery;

  const announcement = announcementData?.data || announcementData;

  const dashboardRoot = isStaff
    ? paths.staff.dashboard
    : isOwnerRoute
      ? paths.owner.root
      : isLineManagerRoute
        ? paths.lineManager.root
        : paths.siteManager.root;

  const announcementListRoot = isStaff
    ? paths.staff.announcements
    : isOwnerRoute
      ? paths.owner.announcements.root
      : isLineManagerRoute
        ? paths.lineManager.announcements?.root || '/line-manager/announcements'
        : paths.siteManager.announcements.root;

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(announcementListRoot);
    }
  };

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button
            color="primary"
            onClick={handleBack}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Back
          </Button>
        </Box>
        <LoadingScreen sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  if (isError) {
    const errorMessage =
      error?.data?.message ||
      error?.message ||
      'Failed to load announcement details.';

    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button
            color="primary"
            onClick={handleBack}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Back
          </Button>
        </Box>
        <EmptyContent
          filled
          title={errorMessage}
          action={
            <Button variant="contained" onClick={() => router.push(announcementListRoot)}>
              Return to Announcements
            </Button>
          }
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  if (!announcement) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button
            color="primary"
            onClick={handleBack}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Back
          </Button>
        </Box>
        <EmptyContent
          filled
          title="Announcement not found"
          action={
            <Button variant="contained" onClick={() => router.push(announcementListRoot)}>
              Return to Announcements
            </Button>
          }
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  const subject = announcement.subject || announcement.title || 'Announcement Details';
  const category = announcement.category || 'General';
  const createdAt = announcement.createdAt || announcement.date;
  const description = announcement.description || announcement.content || '<p>No content provided.</p>';
  const branchName =
    announcement.branchName ||
    (typeof announcement.branch === 'object' ? announcement.branch?.name : announcement.branch) ||
    announcement.site?.name ||
    announcement.site ||
    '';

  return (
    <DashboardContent>
      <Box sx={{ mb: 2 }}>
        <Button
          color="primary"
          onClick={handleBack}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
        >
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading="Announcement Details"
        links={[
          { name: 'Dashboard', href: dashboardRoot },
          { name: 'Announcements', href: announcementListRoot },
          { name: subject },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        {/* Card 1: Details */}
        <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Typography variant="h6">Announcement details</Typography>
          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: 'grid',
              rowGap: 2.5,
              columnGap: 3,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            }}
          >
            <DetailItem label="Subject" value={subject} />

            <DetailItem
              label="Category"
              value={
                category ? (
                  <Chip label={category} size="small" variant="soft" color="primary" />
                ) : (
                  '—'
                )
              }
            />

            <DetailItem
              label="Date Published"
              value={createdAt ? fDateTime(createdAt) : '—'}
            />

            {branchName ? <DetailItem label="Site" value={branchName} /> : null}
          </Box>
        </Card>

        {/* Card 2: Description Content */}
        <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Typography variant="h6">Description</Typography>
          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              typography: 'body1',
              color: 'text.primary',
              '& p': { mb: 2, lineHeight: 1.7 },
              '& ul, & ol': { pl: 3, mb: 2 },
              '& li': { mb: 0.5 },
              '& h1, & h2, & h3, & h4, & h5, & h6': { mb: 1.5, mt: 2 },
              '& a': { color: 'primary.main', textDecoration: 'underline' },
              '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1, my: 2 },
            }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </Card>
      </Stack>
    </DashboardContent>
  );
}

AnnouncementDetailView.propTypes = {
  ownerDashboard: PropTypes.bool,
  siteManagerDashboard: PropTypes.bool,
  staffDashboard: PropTypes.bool,
};

export const StaffAnnouncementDetailView = AnnouncementDetailView;

export default AnnouncementDetailView;

// ----------------------------------------------------------------------

function DetailItem({ label, value }) {
  return (
    <Stack spacing={0.75}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {label}
      </Typography>
      <Box sx={{ typography: 'subtitle2', fontWeight: 600 }}>
        {value}
      </Box>
    </Stack>
  );
}

DetailItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};
