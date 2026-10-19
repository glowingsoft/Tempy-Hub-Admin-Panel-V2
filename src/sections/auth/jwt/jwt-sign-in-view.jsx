import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { useDispatch } from 'react-redux';
import { AppSurface } from 'src/auth/constants';
import { useLoginMutation } from 'src/store/Reducer/auth';
import { setUser } from 'src/store/slices/userSlice';
import { getDeviceType } from 'src/utils/getDeviceType';
import { getPasswordResetHref } from './password-reset-flow';

// ----------------------------------------------------------------------

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

export function JwtSignInView({
  surface = AppSurface.MANAGER_APP,
  forgotReturnPath = '/',
  title = 'Sign in to your account',
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  const [errorMsg, setErrorMsg] = useState('');

  const password = useBoolean();

  const queryEmail = searchParams.get('email') || '';

  const defaultValues = {
    email: queryEmail,
    password: '',
  };

  const methods = useForm({
    mode: 'onTouched',
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const forgotPasswordHref = getPasswordResetHref(forgotReturnPath);

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
      case 4:
        router.push(paths.owner.root);
        break;
      case 5:
        router.push(paths.staff.dashboard);
        break;
      default:
        router.push('/');
        break;
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const deviceType = getDeviceType();

    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi',
      userType: data.email.includes('admin') ? 'admin' : 'user',
      deviceType: deviceType || 'desktop',
      deviceId: '123',
      surface,
    };

    try {
      const response = await login(payload).unwrap();
      const user = response?.data ?? response;

      if (!user) {
        setErrorMsg('Login failed: No user data received');
        return null;
      }

      if (user?.accountState?.status === false || user?.accountState?.status === 'inactive') {
        setErrorMsg('Your account is inactive. Please contact support.');
        return null;
      }

      const role =
        user?.access?.memberships?.[0]?.role ||
        user?.role ||
        user?.basicInfo?.role ||
        user?.accountState?.role;

      let user_type;
      if (role === 'lineManager' || role === 'line_manager' || role === 'Line Manager') {
        user_type = 3;
      } else if (role === 'siteManager' || role === 'site_manager' || role === 'Site Manager') {
        user_type = 2;
      } else if (role === 'admin' || user?.accountState?.userType === 'admin') {
        user_type = 1;
      } else if (role === 'owner' || role === 'Owner') {
        user_type = 4;
      } else if (role === 'staff' || role === 'Staff') {
        user_type = 5;
      }

      const permission = user_type;

      const UpdatedUserData = {
        ...user,
        permission,
        displayName: user?.basicInfo?.name || user?.name || 'Manager',
      };

      console.log('Updated User Data', UpdatedUserData);

      dispatch(setUser(UpdatedUserData));
      goTo(user_type);

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
      <Typography variant="h5">{title}</Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text
        name="email"
        label="Email address"
        placeholder="name@example.com"
        InputLabelProps={{ shrink: true }}
      />

      <Stack spacing={1.5}>
        <Field.Text
          name="password"
          label="Password"
          placeholder="At least 6 characters"
          type={password.value ? 'text' : 'password'}
          InputLabelProps={{ shrink: true }}
          inputProps={{ minLength: 6 }}
          helperText="Password must be at least 6 characters."
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
          href={forgotPasswordHref}
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end' }}
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
        loading={isSubmitting || isLoginLoading}
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

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>
    </>
  );
}
