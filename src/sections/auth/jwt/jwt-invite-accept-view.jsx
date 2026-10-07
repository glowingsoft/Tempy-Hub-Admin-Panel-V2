import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useParams } from 'src/routes/hooks';

import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

import {
  useGetInvitationByTokenQuery,
  useAcceptInvitationMutation,
} from 'src/store/Reducer/auth';

import { JwtUpdatePasswordView } from './jwt-update-password-view';

// ----------------------------------------------------------------------

export function JwtInviteAcceptView() {
  const router = useRouter();
  const { token } = useParams();

  const [step, setStep] = useState(() => {
    if (typeof window !== 'undefined' && token) {
      const cached = sessionStorage.getItem(`invite_accepted_${token}`);
      if (cached) return 'success';
    }
    return 'overview';
  });

  const [savedInvitation, setSavedInvitation] = useState(() => {
    if (typeof window !== 'undefined' && token) {
      try {
        const cached = sessionStorage.getItem(`invite_accepted_${token}`);
        if (cached) return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const { data: invitation, isLoading, isError, error } = useGetInvitationByTokenQuery(token, {
    skip: !token || !!savedInvitation,
  });

  useEffect(() => {
    if (invitation) {
      setSavedInvitation(invitation);
    }
  }, [invitation]);

  const displayInvitation = savedInvitation || invitation;

  const [acceptInvitation, { isLoading: isSubmitting }] = useAcceptInvitationMutation();

  const handleAcceptPassword = async (formData) => {
    try {
      const payload = {
        organizationName: displayInvitation?.organizationName || 'your organization',
        email: displayInvitation?.email || '',
        name: formData.name || displayInvitation?.name || 'Owner',
        acceptedAt: new Date().toISOString(),
      };

      await acceptInvitation({
        token,
        name: payload.name,
        password: formData.password,
      }).unwrap();

      if (typeof window !== 'undefined' && token) {
        sessionStorage.setItem(`invite_accepted_${token}`, JSON.stringify(payload));
      }

      setSavedInvitation(payload);
      setStep('success');
      toast.success('Invitation accepted successfully! Your account is ready.');
    } catch (err) {
      console.error('Accept invitation error:', err);
      const msg =
        err?.data?.message ||
        err?.data?.msg ||
        err?.data?.error ||
        err?.error ||
        err?.message ||
        'Failed to accept invitation. Please try again.';
      toast.error(msg);
      throw err;
    }
  };

  // 1. Success state (HIGHEST PRIORITY: always shown once password set and invitation accepted)
  if (step === 'success') {
    const orgName = displayInvitation?.organizationName || 'your organization';
    const email = displayInvitation?.email || '';

    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Stack spacing={2.5} alignItems="center">
          <Box
            sx={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              bgcolor: 'success.lighter',
              color: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="solar:check-circle-bold" width={40} />
          </Box>

          <Typography variant="h5">Account Activated!</Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Your account for <strong>{orgName}</strong> has been configured
            successfully. You can now log in with your email and new password.
          </Typography>

          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            onClick={() =>
              router.push(
                `${paths.auth.owner.signIn}${
                  email ? `?email=${encodeURIComponent(email)}` : ''
                }`
              )
            }
            sx={{ mt: 2 }}
          >
            Proceed to Owner Login
          </LoadingButton>
        </Stack>
      </Card>
    );
  }

  // 2. Loading state (only while initial fetch is pending and no cached data)
  if (isLoading && !displayInvitation) {
    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <Iconify icon="eos-icons:loading" width={48} sx={{ color: 'primary.main' }} />
          <Typography variant="h6">Verifying your invitation...</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Please wait while we validate your invitation token.
          </Typography>
        </Stack>
      </Card>
    );
  }

  // 3. Error / Expired state (only if token is invalid before accepting)
  if ((isError || !displayInvitation) && !displayInvitation) {
    const isAlreadyAcceptedOrNotFound =
      error?.data?.message?.toLowerCase().includes('not found') ||
      error?.message?.toLowerCase().includes('not found');

    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Stack spacing={2.5} alignItems="center">
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: isAlreadyAcceptedOrNotFound ? 'info.lighter' : 'error.lighter',
              color: isAlreadyAcceptedOrNotFound ? 'info.main' : 'error.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify
              icon={
                isAlreadyAcceptedOrNotFound
                  ? 'solar:check-circle-bold'
                  : 'solar:danger-triangle-bold'
              }
              width={36}
            />
          </Box>

          <Typography variant="h5">
            {isAlreadyAcceptedOrNotFound
              ? 'Invitation Already Used'
              : 'Invitation Invalid'}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {isAlreadyAcceptedOrNotFound
              ? 'This invitation link has already been accepted and your account is set up. You can log in directly using your email and password.'
              : error?.data?.message ||
                error?.message ||
                'This invitation link is invalid or expired.'}
          </Typography>

          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            onClick={() => router.push(paths.auth.owner.signIn)}
            sx={{ mt: 2 }}
          >
            Go to Owner Login
          </LoadingButton>

          <Link
            component={RouterLink}
            href="/"
            variant="subtitle2"
            sx={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <Iconify icon="eva:arrow-ios-back-fill" width={16} sx={{ mr: 0.5 }} />
            Back to Home
          </Link>
        </Stack>
      </Card>
    );
  }

  // 4. Step 1: Overview & Organization Details
  if (step === 'overview') {
    return (
      <Stack spacing={3}>
        <Stack spacing={1} sx={{ textAlign: 'center' }}>
          <Typography variant="h4">Organization Invitation</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            You have been invited to manage this organization on Tempy Hub.
          </Typography>
        </Stack>

        <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon="solar:buildings-3-bold" width={26} />
              </Box>
              <Box>
                <Typography variant="subtitle1">{displayInvitation.organizationName}</Typography>
                <Chip
                  size="small"
                  label={displayInvitation.role ? displayInvitation.role.toUpperCase() : 'OWNER'}
                  color="primary"
                  variant="soft"
                  sx={{ mt: 0.5, fontWeight: 600 }}
                />
              </Box>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack spacing={1.2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Invited Name:
                </Typography>
                <Typography variant="subtitle2">{displayInvitation.name}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Email Address:
                </Typography>
                <Typography variant="subtitle2">{displayInvitation.email}</Typography>
              </Stack>

              {displayInvitation.expiresAt && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Invitation Expires:
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {fDateTime(displayInvitation.expiresAt)}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Card>

        <LoadingButton
          fullWidth
          size="large"
          variant="contained"
          color="primary"
          onClick={() => setStep('password')}
        >
          Accept Invitation & Set Password
        </LoadingButton>

        <Link
          component={RouterLink}
          href={paths.auth.owner.signIn}
          color="inherit"
          variant="subtitle2"
          sx={{ mx: 'auto', alignItems: 'center', display: 'inline-flex' }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={16} sx={{ mr: 0.5 }} />
          Already have an account? Sign in
        </Link>
      </Stack>
    );
  }

  // 5. Step 2: Set Password Form (reusing JwtUpdatePasswordView)
  return (
    <JwtUpdatePasswordView
      title="Set your password"
      description={`Create a secure password to complete your account setup for ${displayInvitation?.organizationName || 'your organization'}.`}
      showNameField={true}
      initialName={displayInvitation?.name || ''}
      showEmailField={true}
      emailValue={displayInvitation?.email || ''}
      submitButtonText="Complete Setup & Accept"
      loadingIndicator="Activating account..."
      isLoading={isSubmitting}
      onSubmitCustom={handleAcceptPassword}
      onBack={() => setStep('overview')}
      backLink={{ label: 'Back to invitation details' }}
    />
  );
}
