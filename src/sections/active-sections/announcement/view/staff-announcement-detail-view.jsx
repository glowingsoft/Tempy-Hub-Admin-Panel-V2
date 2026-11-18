import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { useParams, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useGetStaffAnnouncementDetailQuery } from 'src/store/Reducer/announcements-api';

// ----------------------------------------------------------------------

export function StaffAnnouncementDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const { organizationId } = useCurrentOrganization();

  const {
    data: announcement,
    isLoading,
    isError,
    error,
  } = useGetStaffAnnouncementDetailQuery(
    { announcementId: id, organizationId },
    { skip: !id || !organizationId }
  );

  const fallbackBack = () => router.push(paths.staff.announcements);

  if (isLoading) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <LoadingScreen sx={{ py: 10 }} />
      </Box>
    );
  }

  if (isError) {
    const errorMessage =
      error?.data?.message ||
      error?.data?.msg ||
      error?.data?.error ||
      error?.error ||
      'Unable to load announcement details.';

    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          color="primary"
          onClick={fallbackBack}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title={errorMessage} sx={{ py: 10 }} />
      </Box>
    );
  }

  if (!announcement) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          color="primary"
          onClick={fallbackBack}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Announcement not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  const subject = announcement.subject || announcement.title || 'Announcement Details';
  const category = announcement.category || 'General';
  const createdAt = announcement.createdAt || announcement.date;
  const description = announcement.description || announcement.content || '<p>No content provided.</p>';

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button
          color="primary"
          onClick={fallbackBack}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
        >
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        links={[
          { name: 'Dashboard', href: paths.staff.dashboard },
          { name: 'Announcements', href: paths.staff.announcements },
          { name: 'Details' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        {/* Card 1: Details */}
        <Card sx={{ p: 3 }}>
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

            <DetailItem label="Category" value={category || '—'} />

            <DetailItem
              label="Date Published"
              value={createdAt ? fDateTime(createdAt) : '—'}
            />
          </Box>
        </Card>

        {/* Card 2: Description Content */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6">Description</Typography>
          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              typography: 'body1',
              color: 'text.primary',
              '& p': { mb: 1.5, lineHeight: 1.7 },
              '& p:last-of-type': { mb: 0 },
              '& ul, & ol': { pl: 3, mb: 1.5 },
              '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
              '& a': { color: 'primary.main', textDecoration: 'underline' },
            }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </Card>
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

function DetailItem({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}
