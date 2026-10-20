import { z as zod } from 'zod';
import { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { fData } from 'src/utils/format-number';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';

import { useMockedUser } from 'src/auth/hooks';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from 'src/store/Reducer/auth';
import { useUploadImageMutation } from 'src/store/Reducer/upload-api';

// ----------------------------------------------------------------------

export const UpdateUserSchema = zod.object({
  displayName: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  photoURL: zod.any().nullable().optional(),
  phoneNumber: zod.string().optional(),
});

export function AccountGeneral() {
  const { user } = useMockedUser();
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useGetUserProfileQuery();
  const [updateUserProfile, { isLoading: isUpdatingProfile }] = useUpdateUserProfileMutation();
  const [uploadImage, { isLoading: isUploadingPhoto }] = useUploadImageMutation();
  const basicInfo = profile?.basicInfo;

  const defaultValues = useMemo(
    () => ({
      displayName: basicInfo?.name || user?.basicInfo?.name || user?.displayName || user?.name || '',
      email: basicInfo?.email || user?.basicInfo?.email || user?.email || '',
      photoURL: basicInfo?.profileIcon || user?.photoURL || null,
      phoneNumber: basicInfo?.phoneNumber || user?.basicInfo?.phoneNumber || user?.phoneNumber || '',
    }),
    [basicInfo, user]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { isSubmitting, dirtyFields },
  } = methods;
  const photoValue = watch('photoURL');
  const isProfileChanged = Boolean(dirtyFields.displayName || photoValue instanceof File);

  useEffect(() => {
    if (profile || user) {
      reset(defaultValues);
    }
  }, [profile, user, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (!basicInfo) {
      toast.error('Profile data is unavailable. Please try again.');
      return;
    }

    try {
      let profileIcon = basicInfo.profileIcon || '';

      if (data.photoURL instanceof File) {
        if (!data.photoURL.type?.toLowerCase().startsWith('image/') || data.photoURL.size > 3145728) {
          toast.error('Choose an image no larger than 3 MB.');
          return;
        }

        const uploadResult = await uploadImage(data.photoURL).unwrap();
        if (!uploadResult?.key) {
          throw new Error('The profile photo upload did not return an object key.');
        }
        profileIcon = uploadResult.key;
      }

      const updatedProfile = await updateUserProfile({
        name: data.displayName,
        profileIcon,
      }).unwrap();

      reset({
        ...defaultValues,
        displayName: updatedProfile?.basicInfo?.name || data.displayName,
        photoURL: updatedProfile?.basicInfo?.profileIcon || profileIcon,
      });
      toast.success('Profile updated successfully.');
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || error?.message || error?.error || 'Failed to update profile.');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      {isProfileError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {profileError?.data?.message || profileError?.message || 'Unable to load profile data.'}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card
            sx={{
              pt: 10,
              pb: 5,
              px: 3,
              textAlign: 'center',
            }}
          >
            <Field.UploadAvatar
              name="photoURL"
              maxSize={3145728}
              accept={{ 'image/*': [] }}
              disabled={isProfileLoading || isProfileError || isUploadingPhoto || isUpdatingProfile}
              helperText={
                <Typography
                  variant="caption"
                  sx={{
                    mt: 3,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.disabled',
                  }}
                >
                  Image files only
                  <br /> max size of {fData(3145728)}
                </Typography>
              }
            />
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <Field.Text name="displayName" label="Name" disabled={isProfileLoading || isProfileError} />
              <Field.Text name="email" label="Email address" disabled />
              <Field.Phone name="phoneNumber" label="Phone number" disabled />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting || isUploadingPhoto || isUpdatingProfile}
                disabled={!basicInfo || isProfileLoading || isProfileError || !isProfileChanged}
              >
                Save changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}