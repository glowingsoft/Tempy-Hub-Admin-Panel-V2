import { z as zod } from 'zod';
import { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { setUser } from 'src/store/slices/userSlice';

// ----------------------------------------------------------------------

export const UpdateUserSchema = zod.object({
  displayName: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  photoURL: zod.any().nullable().optional(),
  phoneNumber: zod.string().optional(),
  country: zod.any().optional(),
});

export function AccountGeneral() {
  const { user } = useMockedUser();
  const dispatch = useDispatch();

  const defaultValues = useMemo(
    () => ({
      displayName: user?.displayName || user?.basicInfo?.name || user?.name || '',
      email: user?.basicInfo?.email || user?.email || '',
      photoURL: user?.photoURL || null,
      phoneNumber: user?.basicInfo?.phoneNumber || user?.phoneNumber || '',
      country: user?.country || '',
    }),
    [user]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (user) {
      reset(defaultValues);
    }
  }, [user, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedUser = {
        ...user,
        name: data.displayName,
        displayName: data.displayName,
        email: data.email,
        photoURL: data.photoURL,
        phoneNumber: data.phoneNumber,
        country: data.country,
        basicInfo: {
          ...(user?.basicInfo || {}),
          name: data.displayName,
          email: data.email,
          phoneNumber: data.phoneNumber,
        },
      };

      dispatch(setUser(updatedUser));
      try {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (_) {}

      toast.success('Account updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Failed to update account.');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
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
                  Allowed *.jpeg, *.jpg, *.png, *.gif
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
              <Field.Text name="displayName" label="Name" />
              <Field.Text name="email" label="Email address" />
              <Field.Phone name="phoneNumber" label="Phone number" />
              <Field.CountrySelect name="country" label="Country" placeholder="Choose a country" />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                Save changes
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}