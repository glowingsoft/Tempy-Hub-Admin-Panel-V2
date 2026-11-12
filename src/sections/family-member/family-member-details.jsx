import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { useParams, useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { fDateTime } from 'src/utils/format-time';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { LoadingScreen } from 'src/components/loading-screen';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { useGetFamilyRelationshipsQuery } from 'src/store/Reducer/family-invitations-api';
import { useGetFamilyMemberQuery } from 'src/store/Reducer/family-members-api';

import { FamilyMemberActionDialog } from './family-member-action-dialog';
import { useFamilyMemberActions } from './use-family-member-actions';
import { getFamilyMemberId, getFamilyMemberStatusMeta, getRelationshipLabel } from './utils';

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

function Capitalized({ children }) {
  return (
    <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
      {children || '—'}
    </Typography>
  );
}

// ----------------------------------------------------------------------

export function FamilyMemberDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId } = useCurrentOrganization();
  const listPath = familyPaths.familyMemberships?.members?.root || familyPaths.familyOverview;

  const { data: member, isLoading, isError } = useGetFamilyMemberQuery(
    { organizationId, memberId: id },
    { skip: !organizationId || !id }
  );
  const { data: relationshipOptions = [] } = useGetFamilyRelationshipsQuery();

  const { askDeactivate, askDelete, confirmProps } = useFamilyMemberActions({
    organizationId,
    onChanged: (item) => {
      if (item === null) router.push(listPath);
    },
  });

  if (isLoading && !member) {
    return (
      <DashboardContent maxWidth="xl">
        <LoadingScreen />
      </DashboardContent>
    );
  }

  if (!member || isError) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ mb: 2 }}>
          <Button
            color="primary"
            onClick={() => (listPath ? router.push(listPath) : router.back())}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Back
          </Button>
        </Box>
        <EmptyContent filled title="Family member not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  const memberId = getFamilyMemberId(member);
  const status = getFamilyMemberStatusMeta(member.status);
  const isActive = member.status === 'active';
  const isInactive = member.status === 'inactive';
  const canToggleAccess = isActive || isInactive;
  const editPath = familyPaths.familyMemberships?.members?.edit(memberId) || '#';
  const uploads = member.uploads || {};

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ mb: 2 }}>
        <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={member.name}
        links={[
          { name: 'Dashboard', href: familyPaths.dashboardRoot },
          { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.dashboardRoot },
          { name: 'Members', href: listPath },
          { name: member.name },
        ]}
        action={
          <Stack direction="row" spacing={1.5}>
            {canToggleAccess && (
              <Button
                color={isActive ? 'error' : 'success'}
                variant="outlined"
                onClick={() => askDeactivate(member)}
                startIcon={<Iconify icon={isActive ? 'solar:user-block-bold' : 'solar:user-check-bold'} />}
              >
                {isActive ? 'Deactivate' : 'Reactivate'}
              </Button>
            )}

            <Button
              color="error"
              variant="outlined"
              onClick={() => askDelete(member)}
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            >
              Remove
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
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <DetailCard title="Member details">
          <DetailItem label="Name" value={<Capitalized>{member.name}</Capitalized>} />
          <DetailItem label="Email" value={member.email || '—'} />
          <DetailItem label="Phone" value={member.phone || '—'} />
          <DetailItem
            label="Relationship"
            value={getRelationshipLabel(member.relationship, relationshipOptions)}
          />
          <DetailItem
            label="Status"
            value={
              <Label variant="soft" color={status.color}>
                {status.label}
              </Label>
            }
          />
          <DetailItem label="Next of kin" value={member.isNextOfKin ? 'Yes' : 'No'} />
          <DetailItem label="Joined via" value={<Capitalized>{member.joinedVia}</Capitalized>} />
          <DetailItem label="Joined at" value={member.joinedAt ? fDateTime(member.joinedAt) : '—'} />
        </DetailCard>

        <DetailCard title="Linked resident">
          <DetailItem label="Resident name" value={<Capitalized>{member.residentName}</Capitalized>} />
          <DetailItem label="Room" value={member.roomNumber ? `Room ${member.roomNumber}` : '—'} />
          <DetailItem label="Site" value={member.homeName || '—'} />
          <DetailItem label="Family size" value={member.familySize ?? '—'} />
        </DetailCard>

        <DetailCard title="Membership">
          <DetailItem
            label="Requested at"
            value={member.requestedAt ? fDateTime(member.requestedAt) : '—'}
          />
          <DetailItem
            label="Decided at"
            value={member.decidedAt ? fDateTime(member.decidedAt) : '—'}
          />
          <DetailItem label="Decided by" value={member.decidedByName || '—'} />
          <DetailItem
            label="Removed at"
            value={member.removedAt ? fDateTime(member.removedAt) : '—'}
          />
          <DetailItem label="Removed by" value={member.removedByName || '—'} />
          <DetailItem label="Deactivated by" value={member.inactiveByName || '—'} />
        </DetailCard>

        <DetailCard title="Uploads">
          <DetailItem label="Waiting" value={uploads.waiting ?? 0} />
          <DetailItem label="Approved" value={uploads.approved ?? 0} />
          <DetailItem label="Rejected" value={uploads.rejected ?? 0} />
        </DetailCard>
      </Stack>

      <FamilyMemberActionDialog {...confirmProps} />
    </DashboardContent>
  );
}
