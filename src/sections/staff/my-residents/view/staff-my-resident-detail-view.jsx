import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';

import { CONFIG } from 'src/config-global';
import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

import { FamilyWallPostDialog } from 'src/sections/family-engagement/family-wall-post-dialog';
import { GazettePreviewDialog } from 'src/sections/gazettes/gazette-preview-dialog';
import { getResidentById } from '../mocks/data';

// ----------------------------------------------------------------------

export function StaffMyResidentDetailView() {
  const { id } = useParams();
  const router = useRouter();

  const resident = getResidentById(id);

  const wallPostDialog = useBoolean();
  const previewGazetteDialog = useBoolean();

  const getPhotoSharingColor = (status) => {
    switch (status) {
      case 'allowed':
        return 'success';
      case 'restricted':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleDownloadGazette = useCallback(() => {
    if (!resident?.pdfUrl) {
      toast.info('No gazette PDF available for this resident yet.');
      return;
    }
    toast.success(`Downloading Gazette PDF for ${resident.resident}...`);
    window.open(resident.pdfUrl, '_blank');
  }, [resident]);

  const handlePostCreated = useCallback(() => {
    toast.success(`Photo post created and queued for ${resident?.resident}'s gazette!`);
  }, [resident]);

  if (!resident) {
    return (
      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button
            onClick={() => router.push(paths.staff.familyEngagement.myResidents)}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Back
          </Button>
        </Box>

        <CustomBreadcrumbs
          heading="Resident Not Found"
          links={[
            { name: 'Dashboard', href: paths.staff.dashboard },
            { name: 'My Residents', href: paths.staff.familyEngagement.myResidents },
            { name: 'Details' },
          ]}
          sx={{ mb: 3 }}
        />
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Resident not found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Could not find any resident matching ID &quot;{id}&quot;.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            onClick={() => router.push(paths.staff.familyEngagement.myResidents)}
          >
            Back to My Residents
          </Button>
        </Card>
      </DashboardContent>
    );
  }

  const familyMembers = resident.familyMembers || [];

  return (
    <>
      <Helmet>
        <title>{`${resident.resident} | My Residents | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent>
        <Box sx={{ mb: 2 }}>
          <Button
            onClick={() => router.push(paths.staff.familyEngagement.myResidents)}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Back
          </Button>
        </Box>

        <CustomBreadcrumbs
          heading={resident.resident}
          links={[
            { name: 'Dashboard', href: paths.staff.dashboard },
            { name: 'Family Engagement', href: paths.staff.familyEngagement.myResidents },
            { name: 'My Residents', href: paths.staff.familyEngagement.myResidents },
            { name: resident.resident },
          ]}
          action={
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:eye-bold" />}
                onClick={previewGazetteDialog.onTrue}
              >
                Preview Gazette
              </Button>

              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:file-download-bold" />}
                onClick={handleDownloadGazette}
              >
                Download PDF
              </Button>

              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:camera-add-bold" />}
                onClick={wallPostDialog.onTrue}
              >
                Add Wall Post
              </Button>
            </Stack>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* Hero Card */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              <Avatar
                alt={resident.resident}
                src={resident.avatarUrl}
                sx={{ width: 72, height: 72, fontSize: 28, fontWeight: 700 }}
              >
                {resident.resident?.charAt(0)}
              </Avatar>

              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                  <Typography variant="h5">{resident.resident}</Typography>
                  <Chip
                    size="small"
                    variant="soft"
                    color="primary"
                    label={`Room ${resident.room}`}
                    sx={{ fontWeight: 600 }}
                  />
                  <Label
                    variant="soft"
                    color={resident.status === 'with_family' ? 'success' : 'warning'}
                  >
                    {resident.status === 'with_family' ? 'With Family' : 'No Family Linked'}
                  </Label>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Primary Contact:{' '}
                  <strong>{resident.nextOfKin?.name || 'None linked'}</strong>
                  {resident.nextOfKin?.relationship && (
                    <span> ({resident.nextOfKin.relationship})</span>
                  )}
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={3} sx={{ pt: { xs: 2, md: 0 } }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{familyMembers.length}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Family Contacts
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{resident.photoSharing?.photosCount || 0}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Photos Shared
                </Typography>
              </Box>

              <Divider orientation="vertical" flexItem />

              <Box sx={{ textAlign: 'center' }}>
                <Label
                  variant="soft"
                  color={getPhotoSharingColor(resident.photoSharing?.status)}
                  sx={{ mt: 0.5 }}
                >
                  {resident.photoSharing?.label || 'Allowed'}
                </Label>
                <Typography variant="caption" color="text.secondary" display="block">
                  Photo Sharing
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Card>

        {/* Content Grid */}
        <Grid container spacing={3}>
          {/* Family Directory */}
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
                      <Card
                        key={member.id || index}
                        variant="outlined"
                        sx={{
                          p: 2.5,
                          borderRadius: 1.5,
                          bgcolor: member.isNok ? 'background.neutral' : 'background.paper',
                        }}
                      >
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={2}
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          justifyContent="space-between"
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              sx={{
                                width: 48,
                                height: 48,
                                bgcolor: member.isNok ? 'primary.main' : 'grey.600',
                                fontWeight: 600,
                              }}
                            >
                              {member.name?.charAt(0)}
                            </Avatar>

                            <Stack spacing={0.5}>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Typography variant="subtitle1">{member.name}</Typography>
                                {member.isNok && (
                                  <Label variant="filled" color="primary">
                                    Next of Kin
                                  </Label>
                                )}
                                <Chip
                                  size="small"
                                  label={member.relationship}
                                  variant="outlined"
                                  sx={{ fontSize: 12, height: 22 }}
                                />
                                {member.role && (
                                  <Typography variant="caption" color="text.secondary">
                                    · {member.role}
                                  </Typography>
                                )}
                              </Stack>

                              <Typography variant="caption" color="text.secondary">
                                Relationship: <strong>{member.relationship}</strong>
                              </Typography>
                            </Stack>
                          </Stack>

                          {/* Contact Details */}
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: { xs: 1, sm: 0 } }}>
                            {member.phone && (
                              <Button
                                component="a"
                                href={`tel:${member.phone}`}
                                size="small"
                                variant="soft"
                                color="inherit"
                                startIcon={<Iconify icon="solar:phone-bold" />}
                                sx={{ textDecoration: 'none' }}
                              >
                                {member.phone}
                              </Button>
                            )}

                            {member.email && (
                              <Button
                                component="a"
                                href={`mailto:${member.email}`}
                                size="small"
                                variant="soft"
                                color="inherit"
                                startIcon={<Iconify icon="solar:letter-bold" />}
                                sx={{ textDecoration: 'none' }}
                              >
                                {member.email}
                              </Button>
                            )}
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Photo Sharing Preferences */}
              <Card>
                <CardHeader
                  title="Photo Sharing Status"
                  avatar={
                    <Iconify
                      icon="solar:camera-square-bold"
                      width={24}
                      sx={{ color: 'primary.main' }}
                    />
                  }
                />
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Permission
                      </Typography>
                      <Label variant="soft" color={getPhotoSharingColor(resident.photoSharing?.status)}>
                        {resident.photoSharing?.label || 'Allowed'}
                      </Label>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Photos Shared to Date
                      </Typography>
                      <Typography variant="subtitle2">
                        {resident.photoSharing?.photosCount || 0} photos
                      </Typography>
                    </Stack>

                    <Divider />

                    <Typography variant="caption" color="text.secondary">
                      {resident.photoSharing?.status === 'allowed' &&
                        'Family has consented to sharing resident photos in gazettes and community updates.'}
                      {resident.photoSharing?.status === 'restricted' &&
                        'Photo sharing is restricted. Do not post photos containing this resident.'}
                      {resident.photoSharing?.status === 'pending' &&
                        'Consent is currently pending. Please check with your Site Manager.'}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* Gazette Info */}
              <Card>
                <CardHeader
                  title="Resident Gazette"
                  avatar={
                    <Iconify
                      icon="solar:book-bookmark-bold"
                      width={24}
                      sx={{ color: 'primary.main' }}
                    />
                  }
                />
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Label
                        variant="soft"
                        color={resident.gazetteStatus === 'ready' ? 'success' : 'default'}
                      >
                        {resident.gazetteStatusLabel || 'Ready to print'}
                      </Label>
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      Wall posts created for this resident are automatically compiled into their printable monthly Gazette edition.
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon="solar:eye-bold" />}
                        onClick={previewGazetteDialog.onTrue}
                      >
                        Preview
                      </Button>

                      <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        startIcon={<Iconify icon="solar:file-download-bold" />}
                        onClick={handleDownloadGazette}
                      >
                        Download PDF
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </DashboardContent>

      {/* Add Post Dialog */}
      <FamilyWallPostDialog
        open={wallPostDialog.value}
        onClose={wallPostDialog.onFalse}
        onCreated={handlePostCreated}
      />

      {/* Gazette Preview Dialog */}
      <GazettePreviewDialog
        open={previewGazetteDialog.value}
        onClose={previewGazetteDialog.onFalse}
        resident={resident}
      />
    </>
  );
}

export default StaffMyResidentDetailView;