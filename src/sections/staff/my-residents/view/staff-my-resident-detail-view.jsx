import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useGetResidentQuery } from 'src/store/Reducer/residents-api';
import {
  RESIDENT_ADMISSION_STATUS_OPTIONS,
  RESIDENT_CARE_LEVEL_OPTIONS,
} from 'src/sections/resident/mocks/data';

// ----------------------------------------------------------------------

function getPhotoSharingMeta(resident) {
  if (resident?.photographyConsent === false) {
    return {
      label: 'Restricted',
      color: 'error',
      description: 'Photo sharing is restricted. Do not post photos containing this resident.',
    };
  }
  if (resident?.photographyConsent === true) {
    return {
      label: 'Allowed',
      color: 'success',
      description: 'Family has consented to sharing resident photos in gazettes and community updates.',
    };
  }
  return {
    label: 'Pending',
    color: 'warning',
    description: 'Consent is currently pending. Please check with your Site Manager.',
  };
}

export function StaffMyResidentDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const { organizationId } = useCurrentOrganization();

  const { data: resident, isLoading, isFetching, isError } = useGetResidentQuery(
    { residentId: id, organizationId },
    { skip: !organizationId || !id }
  );

  const loading = (isLoading || isFetching) && !resident;
  const name = resident?.name || 'Resident';
  const photoSharing = getPhotoSharingMeta(resident);
  const admission =
    RESIDENT_ADMISSION_STATUS_OPTIONS.find((option) => option.value === resident?.admissionStatus) ||
    null;
  const careLevel =
    RESIDENT_CARE_LEVEL_OPTIONS.find((option) => option.value === resident?.careLevel) || null;
  const familyMembers = resident?.familyMembers || [];

  const handleBack = () => router.push(paths.staff.familyEngagement.myResidents);

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button onClick={handleBack} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
            Back
          </Button>
        </Box>
        <Card sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={72} height={72} />
            <Stack spacing={1} sx={{ width: 1 }}>
              <Skeleton variant="text" width="40%" height={32} />
              <Skeleton variant="text" width="25%" height={20} />
            </Stack>
          </Stack>
        </Card>
      </DashboardContent>
    );
  }

  if (!resident || isError) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button onClick={handleBack} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
            Back
          </Button>
        </Box>
        <EmptyContent filled title="Resident not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${name} | My Residents | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button onClick={handleBack} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
            Back
          </Button>
        </Box>

        <CustomBreadcrumbs
          heading={name}
          links={[
            { name: 'Dashboard', href: paths.staff.dashboard },
            { name: 'Family Engagement', href: paths.staff.familyEngagement.myResidents },
            { name: 'My Residents', href: paths.staff.familyEngagement.myResidents },
            { name },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card sx={{ p: 3, mb: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Avatar
                alt={name}
                src={resident.photoUrl || undefined}
                sx={{ width: 72, height: 72, fontSize: 28, fontWeight: 700, textTransform: 'capitalize' }}
              >
                {name?.charAt(0)}
              </Avatar>

              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                  <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>
                    {name}
                  </Typography>
                  {resident.roomNumber && (
                    <Chip
                      size="small"
                      variant="soft"
                      color="primary"
                      label={`Room ${resident.roomNumber}`}
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                  {admission && (
                    <Label variant="soft" color={admission.color}>
                      {admission.label}
                    </Label>
                  )}
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  {resident.email || '—'}
                  {resident.phone ? ` · ${resident.phone}` : ''}
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={3} sx={{ pt: { xs: 2, md: 0 } }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{careLevel?.label || '—'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Care Level
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem />

              <Box sx={{ textAlign: 'center' }}>
                <Label variant="soft" color={photoSharing.color} sx={{ mt: 0.5 }}>
                  {photoSharing.label}
                </Label>
                <Typography variant="caption" color="text.secondary" display="block">
                  Photo Sharing
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title="Linked Family Contacts"
                subheader={`${familyMembers.length} authorized contact${familyMembers.length === 1 ? '' : 's'} linked to this resident`}
                sx={{ pb: 1 }}
              />
              <CardContent>
                {familyMembers.length === 0 ? (
                  <Box
                    sx={{
                      p: 5,
                      textAlign: 'center',
                      bgcolor: 'background.neutral',
                      borderRadius: 1.5,
                    }}
                  >
                    <Iconify
                      icon="solar:users-group-rounded-linear"
                      width={56}
                      sx={{ color: 'text.secondary', mb: 1.5 }}
                    />
                    <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                      No family members linked yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Family contacts can be invited and linked by the Site Manager or Line Manager.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {familyMembers.map((member, index) => (
                      <Card key={member._id || member.id || index} variant="outlined" sx={{ p: 2.5 }}>
                        <Typography variant="subtitle1">{member.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.relationship || member.email || '—'}
                        </Typography>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                title="Photo Sharing Status"
                avatar={
                  <Iconify icon="solar:camera-square-bold" width={24} sx={{ color: 'primary.main' }} />
                }
              />
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Permission
                    </Typography>
                    <Label variant="soft" color={photoSharing.color}>
                      {photoSharing.label}
                    </Label>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {photoSharing.description}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DashboardContent>
    </>
  );
}

export default StaffMyResidentDetailView;
