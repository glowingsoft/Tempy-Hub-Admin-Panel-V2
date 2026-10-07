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

import { useRouter, useSearchParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { useDispatch } from 'react-redux';
import { useLoginMutation } from 'src/store/Reducer/auth';
import { setUser } from 'src/store/slices/userSlice';
import { handleApiError } from 'src/utils/errorHandler';
import { getDeviceType } from 'src/utils/getDeviceType';

// ----------------------------------------------------------------------

// Organization Owner permission level (see DashboardLayout nav selection).
const OWNER_PERMISSION = 4;

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

export function OwnerSignInView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  const [errorMsg, setErrorMsg] = useState('');

  const password = useBoolean();

  const queryEmail = searchParams.get('email') || '';

  const defaultValues = {
    email: queryEmail || '',
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

  const isButtonLoading = isSubmitting || isLoginLoading;

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
      const response = await login(payload).unwrap();

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

      const permission = OWNER_PERMISSION;
      const updatedUserData = {
        ...user,
        token,
        permission,
        displayName: user?.basicInfo?.name || user?.name || 'Organization Owner',
      };

      console.log('Owner Logged In User Data:', updatedUserData);

      dispatch(setUser(updatedUserData));

      router.push(paths.owner.root);

      reset();
      toast.success('Login successful!');
    } catch (error) {
      console.error('Owner login error:', error);
      const apiMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        'Login failed. Please check your credentials.';
      const msg =
        typeof apiMessage === 'string' &&
        apiMessage.toLowerCase().includes('platform admin account')
          ? 'Wrong credentials'
          : apiMessage;
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
      toast.error(typeof msg === 'string' ? msg : 'Login failed');
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
        loading={isButtonLoading}
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
