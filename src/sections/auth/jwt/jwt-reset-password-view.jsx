import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useResendOtpEmailMutation } from 'src/store/Reducer/auth';

import { strictEmailSchema } from './auth-validation';
import {
  getPasswordResetReturnPath,
  rememberGeneratedOtp,
  rememberPasswordResetReturnPath,
  startPasswordReset,
  startResendCooldown,
} from './password-reset-flow';

// ----------------------------------------------------------------------

export const ResetPasswordSchema = zod.object({
  email: strictEmailSchema,
});

// ----------------------------------------------------------------------

export function JwtResetPasswordView({
  title = 'Forgot your password?',
  description = "Please enter the email address associated with your account and we'll send you a 6-digit code to reset your password.",
  onSuccess,
  signInPath = '/',
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToParam = searchParams.get('returnTo');
  const returnPath = getPasswordResetReturnPath(returnToParam || signInPath);

  useEffect(() => {
    rememberPasswordResetReturnPath(returnToParam || returnPath);
  }, [returnPath, returnToParam]);

  const defaultValues = {
    email: '',
  };

  const methods = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const [resendOtpEmail, { isLoading: isSendingOtp }] = useResendOtpEmailMutation();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const email = data.email.trim().toLowerCase();
      const response = await resendOtpEmail({ email }).unwrap();
      rememberGeneratedOtp(email, response?.otp);
      startResendCooldown();
      toast.success('A 6-digit code has been sent to your email.');
      if (onSuccess) {
        onSuccess(data);
        return;
      }

      router.push(startPasswordReset(email));
    } catch (error) {
      console.error(error);
    }
  });

  const renderHead = (
    <Stack spacing={1} sx={{ mb: 5, whiteSpace: 'pre-line' }}>
      <Typography variant="h5">{title}</Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {description}
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Field.Text
        autoFocus
        name="email"
        label="Email address"
        placeholder="name@example.com"
        type="email"
        inputProps={{ autoComplete: 'email', inputMode: 'email', spellCheck: false }}
        InputLabelProps={{ shrink: true }}
        onKeyDown={(event) => {
          if (event.key === ' ') {
            event.preventDefault();
          }
        }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting || isSendingOtp}
        loadingIndicator="Sending..."
      >
        Send request
      </LoadingButton>

      <Link
        component={RouterLink}
        href={returnPath}
        color="inherit"
        variant="subtitle2"
        sx={{ mx: 'auto', alignItems: 'center', display: 'inline-flex' }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} sx={{ mr: 0.5 }} />
        Return to sign in
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
