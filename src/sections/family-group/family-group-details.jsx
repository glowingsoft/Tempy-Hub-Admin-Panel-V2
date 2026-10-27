import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { CONFIG } from 'src/config-global';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { TableNoData } from 'src/components/table';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { useGetFamilyRelationshipsQuery } from 'src/store/Reducer/family-invitations-api';
import { useGetFamilyGroupQuery } from 'src/store/Reducer/family-groups-api';

import { FAMILY_GROUP_MEMBER_TABLE_HEAD, widgetIcon } from './constants';
import {
  FamilyGroupDetailCard,
  FamilyGroupDetailGrid,
  FamilyGroupDetailItem,
} from './family-group-detail-card';
import { FamilyGroupMemberTableRow } from './family-group-member-table-row';
import { getFamilyGroupStatusMeta, getInvitationId, getRelationshipLabel, toResidentOption } from './mocks/data';

// ----------------------------------------------------------------------

export function FamilyGroupDetails({ residentId, onBack, onInvite, onEdit, onResend, onRevoke }) {
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId } = useCurrentOrganization();
  const { data: relationshipOptions = [] } = useGetFamilyRelationshipsQuery();

  const { data: group, isLoading } = useGetFamilyGroupQuery(
    { organizationId, residentId },
    { skip: !organizationId || !residentId }
  );

  const heading = group?.residentName || 'Family group';
  const statusMeta = getFamilyGroupStatusMeta(group?.status);
  const nok = group?.primaryNextOfKin;
  const members = group?.members ?? [];
  const pendingInvitations = group?.pendingInvitations ?? [];
  const summary = group?.summary ?? {};

  return (
    <>
      <Helmet>
        <title>{`${heading} | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent maxWidth="xl">
        <CustomBreadcrumbs
          heading={heading}
          links={[
            { name: 'Dashboard', href: familyPaths.dashboardRoot },
            { name: 'Family Engagement', href: familyPaths.familyOverview },
            {
              name: 'Family Groups',
              href: '#',
              onClick: (event) => {
                event.preventDefault();
                onBack?.();
              },
            },
            { name: heading },
          ]}
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:user-plus-bold" />}
              onClick={() => onInvite(toResidentOption(group))}
            >
              Invite family member
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {isLoading && !group ? (
          <LoadingScreen />
        ) : !group ? (
          <Typography color="text.secondary">Family group not found.</Typography>
        ) : (
          <Stack spacing={3}>
            <Grid container spacing={3}>
              <Grid xs={12} sm={6} md={3}>
                <CourseWidgetSummary
                  title="Linked members"
                  total={summary.totalLinkedMembers ?? members.length}
                  color="primary"
                  icon={widgetIcon('ic-users')}
                />
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <CourseWidgetSummary
                  title="Active portal users"
                  total={summary.activePortalUsers ?? 0}
                  color="success"
                  icon={widgetIcon('ic-user')}
                />
              </Grid>
              <Grid xs={12} sm={6} md={3}>
                <CourseWidgetSummary
                  title="Pending invites"
                  total={summary.pendingInvites ?? pendingInvitations.length}
                  color="warning"
                  icon={widgetIcon('ic-mail')}
                />
              </Grid>
            </Grid>

            <FamilyGroupDetailCard title="Resident">
              <FamilyGroupDetailGrid>
                <FamilyGroupDetailItem
                  label="Resident name"
                  value={
                    <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                      {group.residentName || '—'}
                    </Typography>
                  }
                />
                <FamilyGroupDetailItem
                  label="Room number"
                  value={group.roomNumber ? `Room ${group.roomNumber}` : '—'}
                />
                <FamilyGroupDetailItem label="Site" value={group.homeName || '—'} />
                <FamilyGroupDetailItem
                  label="Status"
                  value={
                    <Label variant="soft" color={statusMeta.color}>
                      {statusMeta.label}
                    </Label>
                  }
                />
              </FamilyGroupDetailGrid>
            </FamilyGroupDetailCard>

            <FamilyGroupDetailCard title="Primary next of kin">
              {nok ? (
                <FamilyGroupDetailGrid>
                  <FamilyGroupDetailItem
                    label="Name"
                    value={
                      <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {nok.name || '—'}
                      </Typography>
                    }
                  />
                  <FamilyGroupDetailItem
                    label="Relationship"
                    value={getRelationshipLabel(nok.relationship, relationshipOptions)}
                  />
                  <FamilyGroupDetailItem label="Email" value={nok.email || '—'} />
                  <FamilyGroupDetailItem label="Phone" value={nok.phone || '—'} />
                </FamilyGroupDetailGrid>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No next of kin assigned.
                </Typography>
              )}
            </FamilyGroupDetailCard>

            <FamilyGroupDetailCard title="Members">
              <Scrollbar>
                <Table size="small" sx={{ minWidth: 880 }}>
                  <TableHead>
                    <TableRow>
                      {FAMILY_GROUP_MEMBER_TABLE_HEAD.map((column) => (
                        <TableCell key={column.id} align={column.align} sx={{ typography: 'subtitle2' }}>
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.map((member) => (
                      <FamilyGroupMemberTableRow
                        key={member.memberId || member.userId}
                        member={member}
                        relationshipOptions={relationshipOptions}
                      />
                    ))}
                    {pendingInvitations.map((invitation) => (
                      <FamilyGroupMemberTableRow
                        key={getInvitationId(invitation) || invitation.email}
                        member={{
                          ...invitation,
                          portalRoleLabel: 'Pending invite',
                          isNextOfKin: Boolean(invitation.isNextOfKin),
                          status: invitation.status || 'invitePending',
                        }}
                        relationshipOptions={relationshipOptions}
                        actions={[
                          {
                            key: 'edit',
                            icon: 'solar:pen-bold',
                            tooltip: 'Edit invitation',
                            onClick: () => onEdit(invitation),
                          },
                          {
                            key: 'resend',
                            icon: 'solar:refresh-bold',
                            tooltip: 'Resend invitation',
                            onClick: () => onResend(invitation),
                          },
                          {
                            key: 'revoke',
                            icon: 'solar:close-circle-bold',
                            tooltip: 'Revoke invitation',
                            color: 'error',
                            onClick: () => onRevoke(invitation),
                          },
                        ]}
                      />
                    ))}
                    {!members.length && !pendingInvitations.length ? (
                      <TableNoData notFound title="No family members linked yet" />
                    ) : null}
                  </TableBody>
                </Table>
              </Scrollbar>
            </FamilyGroupDetailCard>
          </Stack>
        )}
      </DashboardContent>
    </>
  );
}

FamilyGroupDetails.propTypes = {
  residentId: PropTypes.string,
  onBack: PropTypes.func,
  onInvite: PropTypes.func,
  onEdit: PropTypes.func,
  onResend: PropTypes.func,
  onRevoke: PropTypes.func,
};
