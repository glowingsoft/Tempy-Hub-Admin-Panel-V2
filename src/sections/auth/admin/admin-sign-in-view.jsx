import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { useAdminLoginMutation } from 'src/store/Reducer/auth';
import { setUser } from 'src/store/slices/userSlice';
import { getDeviceType } from 'src/utils/getDeviceType';
import { AppSurface } from 'src/auth/constants';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Email must be a valid email address!' }),
  password: zod.string().min(1, { message: 'Password is required!' }).min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export function AdminSignInView() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [adminLogin, { isLoading: isLoggingIn }] = useAdminLoginMutation();

  const [errorMsg, setErrorMsg] = useState('');

  const password = useBoolean();

  const defaultValues = {
    email: '',
    password: '',
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
      surface: AppSurface.PLATFORM_ADMIN,
    };

    try {
      const response = await adminLogin(payload).unwrap();

      const user = response?.data ?? response;

      if (!user) {
        setErrorMsg('Login failed: No user data received');
        return null;
      }

      if (user?.accountState?.status === false || user?.accountState?.status === 'inactive') {
        setErrorMsg('Your account is inactive. Please contact support.');
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
    } catch (error) {
      console.error('Login error:', error);
      const msg =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        'Login failed. Please check your credentials.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5">Sign in to your account</Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text name="email" label="Email address" InputLabelProps={{ shrink: true }} />

      <Stack spacing={1.5}>
        <Field.Text
          name="password"
          label="Password"
          placeholder="6+ characters"
          type={password.value ? 'text' : 'password'}
          InputLabelProps={{ shrink: true }}
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
        loading={isSubmitting || isLoggingIn}
        loadingIndicator="Sign in..."
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
