import { z as zod } from 'zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useResetPasswordMutation } from 'src/store/Reducer/auth';

import {
  clearPasswordResetFlow,
  getPasswordResetEmail,
  getPasswordResetReturnPath,
  getPasswordResetToken,
  isPasswordResetOtpVerified,
} from './password-reset-flow';

// ----------------------------------------------------------------------

export const createUpdatePasswordSchema = (showNameField = false) =>
  zod
    .object({
      ...(showNameField
        ? { name: zod.string().min(1, { message: 'Name is required!' }) }
        : {}),
      password: zod
        .string({ required_error: 'Password is required' })
        .trim()
        .min(1, { message: 'Password is required' })
        .min(6, { message: 'Password must be at least 6 characters' })
        .max(72, { message: 'Password must be 72 characters or fewer' }),
      confirmPassword: zod
        .string({ required_error: 'Please confirm your password' })
        .min(1, { message: 'Please confirm your password' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });

export const UpdatePasswordSchema = createUpdatePasswordSchema(false);

// ----------------------------------------------------------------------

export function JwtUpdatePasswordView({
  title = 'Reset your password',
  description = 'Please enter your new password below.',
  showNameField = false,
  initialName = '',
  showEmailField = false,
  emailValue = '',
  submitButtonText = 'Update password',
  loadingIndicator = 'Updating...',
  isLoading = false,
  onSubmitCustom,
  onBack,
  backLink,
  headerIcon,
  headerContent,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryEmail = emailValue || searchParams.get('email') || getPasswordResetEmail();

  useEffect(() => {
    if (onSubmitCustom) {
      return;
    }

    if (!queryEmail) {
      router.replace(paths.auth.jwt.resetPassword);
      return;
    }

    if (!isPasswordResetOtpVerified(queryEmail)) {
      const search = new URLSearchParams({ email: queryEmail }).toString();
      router.replace(`${paths.auth.jwt.verify}?${search}`);
    }
  }, [onSubmitCustom, queryEmail, router]);

  const passwordVisibility = useBoolean();
  const confirmPasswordVisibility = useBoolean();

  const schema = useMemo(() => createUpdatePasswordSchema(showNameField), [showNameField]);

  const defaultValues = useMemo(
    () => ({
      ...(showNameField ? { name: initialName } : {}),
      password: '',
      confirmPassword: '',
    }),
    [showNameField, initialName]
  );

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    values: defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();

  const isButtonLoading = isLoading || isSubmitting || isResettingPassword;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (onSubmitCustom) {
        await onSubmitCustom(data);
        return;
      }

      const resetToken = getPasswordResetToken();

      if (!queryEmail || !resetToken) {
        toast.error('Your reset session expired. Please verify the code again.');
        router.replace(`${paths.auth.jwt.verify}?email=${encodeURIComponent(queryEmail || '')}`);
        return;
      }

      await resetPassword({
        email: queryEmail.trim().toLowerCase(),
        newPassword: data.password,
        resetToken,
      }).unwrap();

      const returnPath = getPasswordResetReturnPath('/');
      clearPasswordResetFlow();
      toast.success('Password has been reset');
      router.push(returnPath);
    } catch (error) {
      console.error('Update password error:', error);
    }
  });

  const renderHead = (
    <>
      {headerIcon}

      {headerContent || (
        <Stack spacing={1} sx={{ mb: 5, whiteSpace: 'pre-line' }}>
          <Typography variant="h5">{title}</Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>
        </Stack>
      )}
    </>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {showEmailField && (
        <Field.Text
          name="email"
          label="Email address"
          value={queryEmail}
          disabled
          InputLabelProps={{ shrink: true }}
        />
      )}

      {showNameField && (
        <Field.Text
          name="name"
          label="Full Name"
          placeholder="Enter your name"
          InputLabelProps={{ shrink: true }}
        />
      )}

      <Field.Text
        name="password"
        label="New Password"
        placeholder="6+ characters"
        type={passwordVisibility.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={passwordVisibility.onToggle} edge="end">
                <Iconify
                  icon={passwordVisibility.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
        helperText="Password must be at least 6 characters long."
      />

      <Field.Text
        name="confirmPassword"
        label="Confirm New Password"
        placeholder="Re-enter your password"
        type={confirmPasswordVisibility.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={confirmPasswordVisibility.onToggle} edge="end">
                <Iconify
                  icon={
                    confirmPasswordVisibility.value
                      ? 'solar:eye-bold'
                      : 'solar:eye-closed-bold'
                  }
                />
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
        loading={isButtonLoading}
        loadingIndicator={loadingIndicator}
        sx={{ mt: 1 }}
      >
        {submitButtonText}
      </LoadingButton>

      {onBack ? (
        <Link
          component="button"
          type="button"
          onClick={onBack}
          color="inherit"
          variant="subtitle2"
          sx={{ mx: 'auto', alignItems: 'center', display: 'inline-flex', cursor: 'pointer' }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={16} sx={{ mr: 0.5 }} />
          {backLink?.label || 'Back'}
        </Link>
      ) : (
        <Link
          component={RouterLink}
          href={backLink?.href || getPasswordResetReturnPath('/')}
          color="inherit"
          variant="subtitle2"
          sx={{ mx: 'auto', alignItems: 'center', display: 'inline-flex' }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={16} sx={{ mr: 0.5 }} />
          {backLink?.label || 'Return to sign in'}
        </Link>
      )}
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
