import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { useParams } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { fDate, fDateTime } from 'src/utils/format-time';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { LoadingScreen } from 'src/components/loading-screen';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import {
  useGetFamilyInvitationQuery,
  useGetFamilyRelationshipsQuery,
} from 'src/store/Reducer/family-invitations-api';

import { FamilyInvitationActionDialog } from './family-invitation-action-dialog';
import { useFamilyInvitationActions } from './use-family-invitation-actions';
import { getFamilyInvitationStatusMeta, getInvitationId, getRelationshipLabel } from './utils';

// ----------------------------------------------------------------------

function DetailCard({ title, children }) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6">{title}</Typography>
      <Divider sx={{ my: 2 }} />
      <Box
        sx={{
          display: 'grid',
          rowGap: 2.5,
          columnGap: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        }}
      >
        {children}
      </Box>
    </Card>
  );
}

function DetailItem({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function FamilyInvitationDetailView() {
  const { id } = useParams();
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId } = useCurrentOrganization();
  const listPath = familyPaths.familyMemberships?.invitations?.root || familyPaths.familyOverview;

  const { data: invitation, isLoading, isError } = useGetFamilyInvitationQuery(
    { organizationId, familyInvitationId: id },
    { skip: !organizationId || !id }
  );
  const { data: relationshipOptions = [] } = useGetFamilyRelationshipsQuery();
  const { resend, askRevoke, confirmProps } = useFamilyInvitationActions({ organizationId });

  if (isLoading && !invitation) {
    return (
      <DashboardContent maxWidth="xl">
        <LoadingScreen />
      </DashboardContent>
    );
  }

  if (!invitation || isError) {
    return (
      <DashboardContent maxWidth="xl">
        <EmptyContent filled title="Invitation not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  const status = getFamilyInvitationStatusMeta(invitation.status);
  const isPending = invitation.status === 'pending';
  const invitationId = getInvitationId(invitation);
  const editPath = familyPaths.familyMemberships?.invitations?.edit(invitationId) || '#';
  const relationshipLabel = getRelationshipLabel(invitation.relationship, relationshipOptions);

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading={invitation.name}
        links={[
          { name: 'Dashboard', href: familyPaths.dashboardRoot },
          { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.dashboardRoot },
          { name: 'Invitations', href: listPath },
          { name: invitation.name },
        ]}
        action={
          isPending ? (
            <Stack direction="row" spacing={1.5}>
              <Button
                color="primary"
                variant="contained"
                onClick={() => resend(invitation)}
                startIcon={<Iconify icon="solar:refresh-bold" />}
              >
                Resend
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={() => askRevoke(invitation)}
                startIcon={<Iconify icon="solar:close-circle-bold" />}
              >
                Revoke
              </Button>
              <Button
                component={RouterLink}
                href={editPath}
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:pen-bold" />}
              >
                Edit
              </Button>
            </Stack>
          ) : null
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <DetailCard title="Member details">
          <DetailItem
            label="Name"
            value={
              <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {invitation.name}
              </Typography>
            }
          />
          <DetailItem label="Email" value={invitation.email} />
          <DetailItem
            label="Status"
            value={
              <Label variant="soft" color={status.color}>
                {status.label}
              </Label>
            }
          />
          <DetailItem label="Relationship" value={relationshipLabel} />
          <DetailItem label="Next of kin" value={invitation.isNextOfKin ? 'Yes' : 'No'} />
          <DetailItem label="Start date" value={fDate(invitation.createdAt)} />
        </DetailCard>

        <DetailCard title="Linked resident">
          <DetailItem
            label="Resident name"
            value={
              <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {invitation.residentName || '—'}
              </Typography>
            }
          />
          <DetailItem
            label="Room"
            value={invitation.roomNumber ? `Room ${invitation.roomNumber}` : '—'}
          />
          <DetailItem label="Site" value={invitation.homeName || '—'} />
        </DetailCard>

        <DetailCard title="Invitation">
          <DetailItem label="Invited by" value={invitation.invitedByName || '—'} />
          <DetailItem label="Expires at" value={fDateTime(invitation.expiresAt)} />
          <DetailItem label="Last sent at" value={fDateTime(invitation.lastSentAt)} />
          <DetailItem label="Send count" value={invitation.sendCount ?? 1} />
          <DetailItem label="Accepted at" value={fDateTime(invitation.acceptedAt)} />
          <DetailItem label="Accepted by" value={invitation.acceptedByName || '—'} />
          <DetailItem label="Revoked at" value={fDateTime(invitation.revokedAt)} />
          <DetailItem label="Revoked by" value={invitation.revokedByName || '—'} />
          <DetailItem label="Created at" value={fDateTime(invitation.createdAt)} />
          <DetailItem label="Updated at" value={fDateTime(invitation.updatedAt)} />
        </DetailCard>
      </Stack>

      <FamilyInvitationActionDialog {...confirmProps} />
    </DashboardContent>
  );
}
