import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { RouterLink } from 'src/routes/components';
import { useRouter, useParams } from 'src/routes/hooks';

import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

import {
  useGetFamilyInvitationByTokenQuery,
  useAcceptFamilyInvitationMutation,
} from 'src/store/Reducer/auth';

import { JwtUpdatePasswordView } from './jwt-update-password-view';

// ----------------------------------------------------------------------

export function FamilyInviteAcceptView() {
  const router = useRouter();
  const { token } = useParams();

  const [step, setStep] = useState(() => {
    if (typeof window !== 'undefined' && token) {
      const cached = sessionStorage.getItem(`family_invite_accepted_${token}`);
      if (cached) return 'success';
    }
    return 'overview';
  });

  const [savedInvitation, setSavedInvitation] = useState(() => {
    if (typeof window !== 'undefined' && token) {
      try {
        const cached = sessionStorage.getItem(`family_invite_accepted_${token}`);
        if (cached) return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const { data: rawInvitation, isLoading, isError, error } = useGetFamilyInvitationByTokenQuery(token, {
    skip: !token || !!savedInvitation,
  });

  const invitation = rawInvitation?.data || rawInvitation;

  useEffect(() => {
    if (invitation) {
      setSavedInvitation(invitation);
    }
  }, [invitation]);

  const displayInvitation = savedInvitation || invitation;

  const [acceptFamilyInvitation, { isLoading: isSubmitting }] = useAcceptFamilyInvitationMutation();

  const handleAcceptPassword = async (formData) => {
    try {
      const payload = {
        organizationName: displayInvitation?.organizationName || 'your organization',
        email: displayInvitation?.email || '',
        name: formData.name || displayInvitation?.name || 'Family Member',
        residentName: displayInvitation?.residentName || '',
        relationship: displayInvitation?.relationship || '',
        acceptedAt: new Date().toISOString(),
      };

      await acceptFamilyInvitation({
        token,
        name: payload.name,
        password: formData.password,
      }).unwrap();

      if (typeof window !== 'undefined' && token) {
        sessionStorage.setItem(`family_invite_accepted_${token}`, JSON.stringify(payload));
      }

      setSavedInvitation(payload);
      setStep('success');
      toast.success('Invitation accepted successfully! Your account is ready.');
    } catch (err) {
      console.error('Accept family invitation error:', err);
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

  // 1. Success state
  if (step === 'success') {
    const orgName = displayInvitation?.organizationName || 'your care home';
    const residentName = displayInvitation?.residentName;

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
            Your Family Portal account for <strong>{orgName}</strong>
            {residentName ? (
              <>
                {' '}to stay connected with <strong>{residentName}</strong>
              </>
            ) : null}{' '}
            has been configured successfully. You can now log in with your email and password.
          </Typography>

          <LoadingButton
            fullWidth
            size="large"
            variant="contained"
            onClick={() => router.push('/')}
            sx={{ mt: 2 }}
          >
            Continue to login
          </LoadingButton>
        </Stack>
      </Card>
    );
  }

  // 2. Loading state
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

  // 3. Error / Expired state
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
            onClick={() => router.push('/')}
            sx={{ mt: 2 }}
          >
            Go to Login
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

  // 4. Step 1: Overview & Resident Details
  if (step === 'overview') {
    return (
      <Stack spacing={3}>
        <Stack spacing={1} sx={{ textAlign: 'center' }}>
          <Typography variant="h4">Family Portal Invitation</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            You have been invited to join the Family Portal at{' '}
            <strong>{displayInvitation?.organizationName || 'your care home'}</strong>
            {displayInvitation?.residentName ? (
              <>
                {' '}to connect with <strong>{displayInvitation.residentName}</strong>
              </>
            ) : null}
            .
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
                <Iconify icon="solar:users-group-two-rounded-bold" width={26} />
              </Box>
              <Box>
                <Typography variant="subtitle1">{displayInvitation.organizationName}</Typography>
                {displayInvitation.branchName && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {displayInvitation.branchName}
                  </Typography>
                )}
                <Chip
                  size="small"
                  label="FAMILY MEMBER"
                  color="info"
                  variant="soft"
                  sx={{ mt: 0.5, fontWeight: 600 }}
                />
              </Box>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack spacing={1.2}>
              {displayInvitation.residentName && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Linked Resident:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                    {displayInvitation.residentName}
                  </Typography>
                </Stack>
              )}

              {displayInvitation.relationship && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Relationship:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                    {displayInvitation.relationship}
                  </Typography>
                </Stack>
              )}

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
          href="/"
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
      description={`Create a secure password to complete your Family Portal setup for ${displayInvitation?.organizationName || 'your care home'}.`}
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

export default FamilyInviteAcceptView;
