import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'src/components/snackbar';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { useDispatch } from 'react-redux';
import { useAdminLoginMutation } from 'src/store/Reducer/auth';
import { setUser } from 'src/store/slices/userSlice';
import { handleApiError } from 'src/utils/errorHandler';
import { getDeviceType } from 'src/utils/getDeviceType';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Email must be a valid email address!' }),
  password: zod.string().min(1, { message: 'Password is required!' }).min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

// Mock login function
const mockLogin = async (payload) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock response data
  const mockResponse = {
    message: 'Login success',
    data: {
      basicInfo: {
        _id: '692c5523e446ec147ce153aa',
        profileIcon: 'https://dummybucket.s3.us-east-1.amazonaws.com/noimage.png',
        name: payload.userType === 'admin' ? 'Admin User' : 'Suheer',
        email: payload.email,
        phoneNumber: null,
        language: 'en',
      },
      accountState: {
        userType: payload.userType,
        status: 'active',
        verificationStatus: {
          email: 'verified',
          phoneNumber: 'pending',
        },
      },
      metadata: {
        timezone: payload.timezone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      },
      otpInfo: {
        emailOtp: {
          otp: '835987',
          otpUsed: false,
          otpRequestCount: 1,
          otpRequestTimestamp: new Date().toISOString(),
          otpExpires: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        },
        phoneNumberOtp: {
          otp: '',
          otpUsed: false,
          otpRequestCount: 0,
          otpRequestTimestamp: new Date().toISOString(),
        },
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OTJjNTUyM2U0NDZlYzE0N2NlMTUzYWEiLCJpYXQiOjE3NjUxNzM1MjB9.WpcTqWkmgAVpx-mn9KNvNIPjPlwO6aONXKJvu30AvZU',
    },
  };

  return mockResponse;
};

// ----------------------------------------------------------------------

export function AdminSignInView() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [adminLogin, { isLoading: isLoggingIn }] = useAdminLoginMutation();

  const [errorMsg, setErrorMsg] = useState('');

  const password = useBoolean();

  const defaultValues = {
    email: import.meta.env.VITE_SUPER_ADMIN_LOGIN_EMAIL || '',
    password: import.meta.env.VITE_SUPER_ADMIN_LOGIN_PASSWORD || '',
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

  const goTo = (permission) => {
    switch (permission) {
      case 1:
        router.push(paths.adminDashboard.root);
        break;
      case 2:
        router.push(paths.siteManager.root);
        break;
      case 3:
        router.push(paths.lineManager.root);
        break;
      default:
        router.push(paths.adminDashboard.root);
        break;
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const deviceType = getDeviceType();

    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi',
      deviceId: '123',
      deviceType: deviceType || 'desktop',
    };

    try {
      const response = await adminLogin(payload).unwrap();

      const user = response?.data ?? response;

      if (!user) {
        toast.error('Login failed: No user data received');
        return null;
      }

      if (user?.accountState?.status === false || user?.accountState?.status === 'inactive') {
        toast.error('Your account is inactive. Please contact support.');
        return null;
      }

      const token = user?.token;

      const permission = 1;
      const UpdatedUserData = {
        ...user,
        token,
        permission,
      };

      dispatch(setUser(UpdatedUserData));
      goTo(permission);

      reset();
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      const msg =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        'Login failed. Please check your credentials.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
      toast.error(typeof msg === 'string' ? msg : 'Login failed');
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5" sx={{ fontSize: '1.65rem', fontWeight: 700, lineHeight: 1.2 }}>
        Sign in to your account
      </Typography>

      <Stack direction="row" spacing={0.5} alignItems="center">
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '1rem' }}>
          {`Don't have an account?`}
        </Typography>

        <Link component={RouterLink} href={paths.auth.jwt.signUp} variant="subtitle2" sx={{ fontSize: '1rem' }}>
          Get started
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text
        name="email"
        label="Email address"
        inputProps={{ autoComplete: 'username' }}
        InputLabelProps={{ shrink: true, sx: { fontSize: '1.1rem' } }}
        sx={{ '& .MuiInputBase-input': { fontSize: '1.1rem', padding: '14.5px 14px' } }}
      />

      <Stack spacing={1.5}>
        <Field.Text
          name="password"
          label="Password"
          placeholder="6+ characters"
          type={password.value ? 'text' : 'password'}
          inputProps={{ autoComplete: 'current-password' }}
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

        <Link
          component={RouterLink}
          href="#"
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end', fontSize: '1rem' }}
        >
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting || isLoggingIn}
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

      <Form methods={methods} onSubmit={onSubmit} autoComplete="on">
        {renderForm}
      </Form>
    </>
  );
}
