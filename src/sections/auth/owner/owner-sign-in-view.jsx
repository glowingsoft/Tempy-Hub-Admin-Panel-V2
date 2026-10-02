import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'src/components/snackbar';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { useDispatch } from 'react-redux';
import { setUser } from 'src/store/slices/userSlice';
import { handleApiError } from 'src/utils/errorHandler';
import { getDeviceType } from 'src/utils/getDeviceType';

import { mockOrganizations } from 'src/sections/organization/mocks/data';

// ----------------------------------------------------------------------

// Organization Owner permission level (see DashboardLayout nav selection).
const OWNER_PERMISSION = 4;

// The org this owner belongs to. The real backend returns this on the login
// response; owner-scoped screens read it from the user object.
const OWNER_ORGANIZATION = mockOrganizations[0]
  ? { _id: mockOrganizations[0]._id, name: mockOrganizations[0].name }
  : null;

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

// Mock login — mirrors the admin flow; no API integration.
const mockOwnerLogin = async (payload) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    message: 'Login success',
    data: {
      basicInfo: {
        _id: '692c5523e446ec147ce153b0',
        profileIcon: 'https://dummybucket.s3.us-east-1.amazonaws.com/noimage.png',
        name: 'Organization Owner',
        email: payload.email,
        phoneNumber: null,
        language: 'en',
      },
      accountState: {
        userType: 'owner',
        status: 'active',
        verificationStatus: { email: 'verified', phoneNumber: 'pending' },
      },
      organizationId: OWNER_ORGANIZATION?._id ?? null,
      organization: OWNER_ORGANIZATION,
      metadata: {
        timezone: payload.timezone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      },
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTJjNTUyM2U0NDZlYzE0N2NlMTUzYjAiLCJpYXQiOjE3NjUxNzM1MjB9.owner-mock-token',
    },
  };
};

// ----------------------------------------------------------------------

export function OwnerSignInView() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [errorMsg, setErrorMsg] = useState('');

  const password = useBoolean();

  const defaultValues = {
    email: 'owner@tempy.com',
    password: '123456',
  };

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const deviceType = getDeviceType();

    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userType: 'owner',
      deviceType,
      deviceId: '123',
    };

    try {
      const response = await mockOwnerLogin(payload);

      if (response.error) {
        return toast.error(response.error.data?.message);
      }

      const user = response.data;

      if (!user) {
        return router.push('/404');
      }

      if (!user?.accountState?.status) {
        toast.error('Your account is inactive. Please contact support.');
        return null;
      }

      const permission = OWNER_PERMISSION;

      dispatch(setUser({ ...user, permission }));

      router.push(paths.owner.root);

      reset();
      toast.success('Login successful!');
    } catch (error) {
      setErrorMsg(typeof error === 'string' ? error : error.message);
      handleApiError(error);
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5" sx={{ fontSize: '1.65rem', fontWeight: 700, lineHeight: 1.2 }}>
        Sign in to your organization
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '1rem' }}>
        Organization Owner access
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text
        name="email"
        label="Email address"
        InputLabelProps={{ shrink: true, sx: { fontSize: '1.1rem' } }}
        sx={{ '& .MuiInputBase-input': { fontSize: '1.1rem', padding: '14.5px 14px' } }}
      />

      <Stack spacing={1.5}>
        <Field.Text
          name="password"
          label="Password"
          placeholder="6+ characters"
          type={password.value ? 'text' : 'password'}
          InputLabelProps={{ shrink: true, sx: { fontSize: '1.1rem' } }}
          sx={{ '& .MuiInputBase-input': { fontSize: '1.1rem', padding: '14.5px 14px' } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Sign in..."
        sx={{ fontSize: '1.05rem', py: 1.25, fontWeight: 700 }}
      >
        Sign in
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>
    </>
  );
}
