import { z as zod } from 'zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useResendOtpEmailMutation, useVerifyOtpEmailMutation } from 'src/store/Reducer/auth';

import {
  getGeneratedOtp,
  getPasswordResetEmail,
  getPasswordResetHref,
  getPasswordResetReturnPath,
  markPasswordResetOtpVerified,
  rememberGeneratedOtp,
  startPasswordReset,
} from './password-reset-flow';
import { otpCodeSchema, strictEmailSchema } from './auth-validation';
import { useResendCooldown } from './use-resend-cooldown';

// ----------------------------------------------------------------------

export const VerifySchema = zod.object({
  code: otpCodeSchema,
  email: strictEmailSchema,
});

// ----------------------------------------------------------------------

export function JwtVerifyView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email') || getPasswordResetEmail();

  const { remaining, counting, start } = useResendCooldown();
  const [testOtp, setTestOtp] = useState(() => getGeneratedOtp(email));
  const [verifyOtpEmail, { isLoading: isVerifying }] = useVerifyOtpEmailMutation();
  const [resendOtpEmail, { isLoading: isResending }] = useResendOtpEmailMutation();

  const defaultValues = { code: '', email: email || '' };

  const methods = useForm({
    resolver: zodResolver(VerifySchema),
    defaultValues,
  });

  const {
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (!email) {
      router.replace(paths.auth.jwt.resetPassword);
      return;
    }

    setTestOtp(getGeneratedOtp(email));
  }, [email, router]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const email = data.email.trim().toLowerCase();
      const response = await verifyOtpEmail({ email, otp: data.code }).unwrap();
      const resetToken = response?.resetToken;

      if (!resetToken) {
        toast.error('Verification succeeded but no reset token was returned.');
        return;
      }

      toast.success('Code verified.');
      router.push(markPasswordResetOtpVerified(email, resetToken));
    } catch (error) {
      console.error(error);
    }
  });

  const handleResendCode = useCallback(async () => {
    if (!values.email || isResending || counting) {
      return;
    }

    try {
      const nextEmail = values.email.trim().toLowerCase();
      const response = await resendOtpEmail({ email: nextEmail }).unwrap();
      startPasswordReset(nextEmail);
      rememberGeneratedOtp(nextEmail, response?.otp);
      setTestOtp(getGeneratedOtp(nextEmail));
      start();
      toast.success('A new code has been sent.');
    } catch (error) {
      console.error(error);
    }
  }, [counting, isResending, resendOtpEmail, start, values.email]);

  const renderHead = (
    <Stack spacing={1} sx={{ mb: 5, whiteSpace: 'pre-line' }}>
      <Typography variant="h5">Please check your email!</Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {`We've emailed a 6-digit confirmation code.\nPlease enter the code below to continue.`}
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text
        name="email"
        label="Email address"
        placeholder="name@example.com"
        type="email"
        InputLabelProps={{ shrink: true }}
        disabled
      />

      {testOtp && (
        <Alert severity="warning" sx={{ '& .MuiAlert-message': { width: 1 } }}>
          <Typography variant="subtitle2">Testing only</Typography>
          <Typography variant="body2">
            Current OTP: <strong>{testOtp}</strong>
          </Typography>
        </Alert>
      )}

      <Field.Code name="code" />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting || isVerifying}
        loadingIndicator="Verify..."
      >
        Verify
      </LoadingButton>

      <Typography variant="body2" sx={{ mx: 'auto' }}>
        {`Don’t have a code? `}
        <Link
          variant="subtitle2"
          onClick={handleResendCode}
          sx={{
            cursor: 'pointer',
            ...((counting || isResending) && { color: 'text.disabled', pointerEvents: 'none' }),
          }}
        >
          Resend code {counting && `(${remaining}s)`}
        </Link>
      </Typography>

      <Link
        component={RouterLink}
        href={getPasswordResetHref(getPasswordResetReturnPath())}
        color="inherit"
        variant="subtitle2"
        sx={{ gap: 0.5, alignSelf: 'center', alignItems: 'center', display: 'inline-flex' }}
      >
        <Iconify width={16} icon="eva:arrow-ios-back-fill" />
        Back to forgot password
      </Link>
    </Stack>
  );

  return (
    <>
      {renderHead}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </Form>
    </>
  );
}
