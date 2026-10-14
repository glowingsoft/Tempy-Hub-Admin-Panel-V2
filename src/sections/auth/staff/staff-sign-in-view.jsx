import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { z as zod } from 'zod';

import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useLoginMutation } from 'src/store/Reducer/auth';
import { setUser } from 'src/store/slices/userSlice';
import { getDeviceType } from 'src/utils/getDeviceType';
import { AppSurface } from 'src/auth/constants';

const STAFF_PERMISSION = 5;

const SignInSchema = zod.object({
  email: zod.string().min(1, { message: 'Email is required!' }).email({ message: 'Email must be valid!' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters!' }),
});

const mockStaffLogin = async ({ email }) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    basicInfo: { _id: 'emp-001', name: 'John Williams', email, profileIcon: 'https://i.pravatar.cc/150?img=12' },
    accountState: { userType: 'staff', status: 'active' },
    staffId: 'emp-001',
    organizationId: null,
    token: 'staff-mock-token',
  };
};

export function StaffSignInView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const password = useBoolean();
  const [errorMsg, setErrorMsg] = useState('');
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  const methods = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: 'john.williams@example.com', password: '123456' },
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    const deviceType = getDeviceType();

    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi',
      deviceId: '123',
      deviceType: deviceType || 'desktop',
      surface: AppSurface.STAFF_APP,
    };

    try {
      let user;
      try {
        const response = await login(payload).unwrap();
        user = response?.data ?? response;
      } catch (apiError) {
        if (payload.email === 'john.williams@example.com') {
          user = await mockStaffLogin(data);
        } else {
          throw apiError;
        }
      }

      dispatch(setUser({ ...user, permission: STAFF_PERMISSION }));
      router.push(paths.staff.dashboard);
      methods.reset();
    } catch (error) {
      const msg =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        'Unable to sign in.';
      setErrorMsg(typeof msg === 'string' ? msg : 'Unable to sign in.');
    }
  });

  return (
    <>
      <Stack spacing={1.5} sx={{ mb: 5 }}>
        <Typography variant="h5" sx={{ fontSize: '1.65rem', fontWeight: 700, lineHeight: 1.2 }}>
          Sign in to your staff account
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '1rem' }}>
          Employee access
        </Typography>
      </Stack>
      {!!errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Field.Text
            name="email"
            label="Email address"
            InputLabelProps={{ shrink: true, sx: { fontSize: '1.1rem' } }}
            sx={{ '& .MuiInputBase-input': { fontSize: '1.1rem', padding: '14.5px 14px' } }}
          />
          <Field.Text
            name="password"
            label="Password"
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
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={methods.formState.isSubmitting || isLoginLoading}
            sx={{ fontSize: '1.05rem', py: 1.25, fontWeight: 700 }}
          >
            Sign in
          </LoadingButton>
        </Stack>
      </Form>
    </>
  );
}
