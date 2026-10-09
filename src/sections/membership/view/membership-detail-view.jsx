import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useParams, useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

import { fDate, fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useGetInvitationQuery } from 'src/store/Reducer/invitations-api';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';

import {
  getMembershipStatusMeta,
  getMockInvitationById,
  getPermissionLabels,
  getRoleLabel,
} from '../mocks/data';
import { useInvitationActions } from '../use-invitation-actions';
import { InvitationActionDialog } from '../invitation-action-dialog';
import {
  useInvitationLookups,
  resolveBranchName,
  resolveJobTitleName,
  resolveDepartmentNames,
} from '../use-invitation-lookups';

// ----------------------------------------------------------------------

export function MembershipDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useSelector((state) => state.user);
  const organizationId = getOwnerOrganizationId(user);

  const [reloadKey, setReloadKey] = useState(0);

  const handleChanged = useCallback(
    (invitation) => {
      if (invitation === null) {
        router.push(paths.owner.memberships.invitations.root);
        return;
      }
      setReloadKey((key) => key + 1);
    },
    [router]
  );

  const { resend, askRevoke, askDelete, confirmProps } = useInvitationActions({
    organizationId,
    onChanged: handleChanged,
  });

  const { branchesMap, jobTitlesMap, departmentsMap } = useInvitationLookups(organizationId);

  const {
    data: apiInvitation,
    isLoading: isQueryLoading,
    isError,
    error,
  } = useGetInvitationQuery(
    { invitationId: id, organizationId },
    { skip: !id || !organizationId }
  );
  const mockInvitation = useMemo(() => getMockInvitationById(id), [id, reloadKey]);
  const invitation = apiInvitation || mockInvitation;

  if (isQueryLoading) {
    return null;
  }

  if (isError) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(paths.owner.memberships.invitations.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="error">
          {error?.data?.message || 'Unable to load invitation details.'}
        </Alert>
      </Box>
    );
  }

  if (!invitation) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(paths.owner.memberships.invitations.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Invitation not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  const status = getMembershipStatusMeta(invitation.status);
  const permissionLabels = getPermissionLabels(invitation.permissions);
  const branchName = resolveBranchName(invitation, branchesMap);
  const jobTitleName = resolveJobTitleName(invitation, jobTitlesMap);
  const departmentNames = resolveDepartmentNames(invitation, departmentsMap);

  const isPending = invitation.status === 'pending';
  const isRevoked = invitation.status === 'revoked';

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={invitation.name}
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Invitations', href: paths.owner.memberships.invitations.root },
          { name: invitation.name },
        ]}
        action={
          <Stack direction="row" spacing={1.5}>
            {isPending && (
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => resend(invitation)}
                startIcon={<Iconify icon="solar:refresh-bold" />}
              >
                Resend
              </Button>
            )}

            {isPending && (
              <Button
                color="error"
                variant="outlined"
                onClick={() => askRevoke(invitation)}
                startIcon={<Iconify icon="solar:close-circle-bold" />}
              >
                Revoke
              </Button>
            )}

            {isRevoked ? (
              <Button
                color="error"
                variant="contained"
                onClick={() => askDelete(invitation)}
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              >
                Delete
              </Button>
            ) : (
              <Button
                component={RouterLink}
                href={paths.owner.memberships.invitations.edit(invitation._id)}
                variant="contained"
                startIcon={<Iconify icon="solar:pen-bold" />}
              >
                Edit
              </Button>
            )}
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <DetailCard title="Member details">
          <DetailItem label="Name" value={invitation.name} />
          <DetailItem label="Email" value={invitation.email} />
          <DetailItem label="Role" value={getRoleLabel(invitation.role)} />
          <DetailItem
            label="Status"
            value={
              <Label variant="soft" color={status.color}>
                {status.label}
              </Label>
            }
          />
          <DetailItem label="Site" value={branchName} />
          <DetailItem label="Job title" value={jobTitleName} />
          <DetailItem label="Departments" value={departmentNames} />
          <DetailItem label="Start date" value={fDate(invitation.startDate)} />
        </DetailCard>

        <Card sx={{ p: 3 }}>
          <Typography variant="h6">Permissions</Typography>
          <Divider sx={{ my: 2 }} />
          {permissionLabels.length ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {permissionLabels.map((label) => (
                <Chip key={label} label={label} size="small" variant="soft" />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No permissions assigned.
            </Typography>
          )}
        </Card>

        <DetailCard title="Invitation">
          <DetailItem label="Expires at" value={fDateTime(invitation.expiresAt)} />
          <DetailItem label="Last sent at" value={fDateTime(invitation.lastSentAt)} />
          <DetailItem label="Send count" value={invitation.sendCount ?? 0} />
          <DetailItem label="Accepted at" value={fDateTime(invitation.acceptedAt)} />
          <DetailItem label="Revoked at" value={fDateTime(invitation.revokedAt)} />
          <DetailItem
            label="Accept link"
            value={
              invitation.acceptUrl ? (
                <Link
                  href={invitation.acceptUrl}
                  target="_blank"
                  rel="noopener"
                  sx={{ wordBreak: 'break-all' }}
                >
                  {invitation.acceptUrl}
                </Link>
              ) : (
                '—'
              )
            }
          />
          <DetailItem label="Created at" value={fDateTime(invitation.createdAt)} />
          <DetailItem label="Updated at" value={fDateTime(invitation.updatedAt)} />
        </DetailCard>
      </Stack>

      <InvitationActionDialog {...confirmProps} />
    </Box>
  );
}

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
