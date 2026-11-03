import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';
import { toast } from 'src/components/snackbar';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { formatStr } from 'src/utils/format-time';
import {
  useGetAllSettingsQuery,
  useUpdateAllSettingsMutation,
} from 'src/store/Reducer/settings-api';

import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';

// ----------------------------------------------------------------------

function dateInputValue(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function SettingRow({ title, description, children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        p: 2.5,
        borderRadius: 1.5,
        bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'),
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle1">{title}</Typography>
        {description ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {description}
          </Typography>
        ) : null}
      </Stack>
      <Box sx={{ width: { xs: 1, md: 'auto' }, minWidth: { md: 220 } }}>{children}</Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function AdminSettingsView({ variant = 'owner' }) {
  const isOwner = variant === 'owner';
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId } = useCurrentOrganization();
  const [branchId, setBranchId] = useState('');

  const { branches, isBranchesLoading } = useOrganizationLookups({
    organizationId: isOwner ? organizationId : null,
    branches: isOwner && !!organizationId,
    jobTitles: false,
    departments: false,
    limit: 100,
  });

  useEffect(() => {
    if (!isOwner) return;
    if (!branches.length) {
      setBranchId('');
      return;
    }
    if (!branchId || !branches.some((branch) => branch._id === branchId)) {
      setBranchId(branches[0]._id);
    }
  }, [branchId, branches, isOwner]);

  const skip = isOwner ? !organizationId || !branchId : false;

  const { data, isLoading, isError } = useGetAllSettingsQuery(
    isOwner ? { organizationId, branchId } : {},
    { skip }
  );

  const [updateAllSettings, { isLoading: isSaving }] = useUpdateAllSettingsMutation();

  const [billing, setBilling] = useState({ planLimitGb: '', baseTierGbp: '', overageGbpPerGb: '' });
  const [family, setFamily] = useState({
    issueEveryDays: '',
    messageCap: '',
    anchorDate: '',
  });
  const [visits, setVisits] = useState({
    daysAhead: '',
    maxPartySize: '',
    paused: false,
  });

  useEffect(() => {
    if (!data) return;

    setBilling({
      planLimitGb: data.billing?.planLimitGb ?? '',
      baseTierGbp: data.billing?.baseTierGbp ?? '',
      overageGbpPerGb: data.billing?.overageGbpPerGb ?? '',
    });

    setFamily({
      issueEveryDays: data.family?.gazette?.issueEveryDays ?? '',
      messageCap: data.family?.gazette?.messageCap ?? '',
      anchorDate: dateInputValue(data.family?.gazette?.anchorDate),
    });

    setVisits({
      daysAhead: data.visits?.daysAhead ?? '',
      maxPartySize: data.visits?.maxPartySize ?? '',
      paused: Boolean(data.visits?.paused),
    });
  }, [data]);

  const headingLinks = useMemo(() => {
    if (isOwner) {
      return [
        { name: 'Dashboard', href: familyPaths.dashboardRoot },
        { name: 'Family Engagement', href: familyPaths.familyOverview },
        { name: 'Settings' },
      ];
    }

    return [{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Settings' }];
  }, [familyPaths, isOwner]);

  const initialBilling = useMemo(
    () => ({
      planLimitGb: data?.billing?.planLimitGb ?? '',
      baseTierGbp: data?.billing?.baseTierGbp ?? '',
      overageGbpPerGb: data?.billing?.overageGbpPerGb ?? '',
    }),
    [data]
  );

  const initialFamily = useMemo(
    () => ({
      issueEveryDays: data?.family?.gazette?.issueEveryDays ?? '',
      messageCap: data?.family?.gazette?.messageCap ?? '',
      anchorDate: dateInputValue(data?.family?.gazette?.anchorDate),
    }),
    [data]
  );

  const initialVisits = useMemo(
    () => ({
      daysAhead: data?.visits?.daysAhead ?? '',
      maxPartySize: data?.visits?.maxPartySize ?? '',
      paused: Boolean(data?.visits?.paused),
    }),
    [data]
  );

  const isDirty = isOwner
    ? String(family.issueEveryDays) !== String(initialFamily.issueEveryDays) ||
    String(family.messageCap) !== String(initialFamily.messageCap) ||
    family.anchorDate !== initialFamily.anchorDate ||
    String(visits.daysAhead) !== String(initialVisits.daysAhead) ||
    String(visits.maxPartySize) !== String(initialVisits.maxPartySize) ||
    visits.paused !== initialVisits.paused
    : String(billing.planLimitGb) !== String(initialBilling.planLimitGb) ||
    String(billing.baseTierGbp) !== String(initialBilling.baseTierGbp) ||
    String(billing.overageGbpPerGb) !== String(initialBilling.overageGbpPerGb);

  const handleSave = async () => {
    try {
      const payload = isOwner
        ? {
          organizationId,
          branchId,
          body: {
            family: {
              gazette: {
                issueEveryDays: toNumber(family.issueEveryDays),
                messageCap: toNumber(family.messageCap),
                anchorDate: family.anchorDate,
              },
            },
            visits: {
              branchId,
              daysAhead: toNumber(visits.daysAhead),
              maxPartySize: toNumber(visits.maxPartySize),
              paused: Boolean(visits.paused),
            },
          },
        }
        : {
          body: {
            billing: {
              planLimitGb: toNumber(billing.planLimitGb),
              baseTierGbp: toNumber(billing.baseTierGbp),
              overageGbpPerGb: toNumber(billing.overageGbpPerGb),
            },
          },
        };

      const res = await updateAllSettings(payload).unwrap();
      toast.success(res?.message || 'Settings updated successfully');
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to update settings');
    }
  };

  const saveButton = (
    <LoadingButton
      variant="contained"
      color="primary"
      loading={isSaving}
      disabled={!isDirty || isSaving}
      onClick={handleSave}
    >
      Save changes
    </LoadingButton>
  );

  const loading = isLoading || (isOwner && isBranchesLoading);

  if (isOwner && !isBranchesLoading && !branches.length && organizationId) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs heading="Settings" links={headingLinks} sx={{ mb: { xs: 3, md: 5 } }} />
        <EmptyContent filled title="Select a site to load family and visit settings" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  if (loading) {
    return (
      <DashboardContent>
        <LoadingScreen sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  if (isError) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs heading="Settings" links={headingLinks} sx={{ mb: { xs: 3, md: 5 } }} />
        <EmptyContent filled title="Unable to load settings" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Settings"
        links={headingLinks}
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
            {isOwner ? (
              <TextField
                select
                size="small"
                label="Site"
                value={branchId}
                onChange={(event) => setBranchId(event.target.value)}
                sx={{ minWidth: { xs: 1, sm: 260 } }}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch._id} value={branch._id} sx={{ textTransform: 'capitalize' }}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : null}
            {saveButton}
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        {!isOwner && (
          <Card>
            <CardHeader
              sx={{ pb: 1.5 }}
              title="Billing"
              subheader="Plan quota and overage pricing used for usage billing."
            />
            <Divider />
            <Stack spacing={2} sx={{ p: 3 }}>
              <SettingRow title="Plan limit (GB)" description="Included storage quota on the base plan.">
                <TextField
                  fullWidth
                  type="number"
                  value={billing.planLimitGb}
                  onChange={(event) =>
                    setBilling((current) => ({ ...current, planLimitGb: event.target.value }))
                  }
                />
              </SettingRow>
              <SettingRow title="Base tier (£)" description="Monthly base plan amount.">
                <TextField
                  fullWidth
                  type="number"
                  value={billing.baseTierGbp}
                  onChange={(event) =>
                    setBilling((current) => ({ ...current, baseTierGbp: event.target.value }))
                  }
                />
              </SettingRow>
              <SettingRow title="Overage (£ per GB)" description="Charge applied for each GB above the plan limit.">
                <TextField
                  fullWidth
                  type="number"
                  value={billing.overageGbpPerGb}
                  onChange={(event) =>
                    setBilling((current) => ({ ...current, overageGbpPerGb: event.target.value }))
                  }
                />
              </SettingRow>
            </Stack>
          </Card>
        )}

        {isOwner && (
          <>
            <Card>
              <CardHeader
                sx={{ pb: 1.5 }}
                title="Family"
                subheader="Gazette schedule for this site."
              />
              <Divider />
              <Stack spacing={2} sx={{ p: 3 }}>
                <SettingRow title="Issue every (days)" description="How often a gazette issue is opened.">
                  <TextField
                    fullWidth
                    type="number"
                    value={family.issueEveryDays}
                    onChange={(event) =>
                      setFamily((current) => ({ ...current, issueEveryDays: event.target.value }))
                    }
                  />
                </SettingRow>
                <SettingRow title="Message cap" description="Maximum family messages per gazette issue.">
                  <TextField
                    fullWidth
                    type="number"
                    value={family.messageCap}
                    onChange={(event) =>
                      setFamily((current) => ({ ...current, messageCap: event.target.value }))
                    }
                  />
                </SettingRow>
                <SettingRow title="Anchor date" description="Date the gazette cycle is anchored to.">
                  <DatePicker
                    value={family.anchorDate ? dayjs(family.anchorDate) : null}
                    onChange={(value) =>
                      setFamily((current) => ({
                        ...current,
                        anchorDate: value?.isValid() ? value.format('YYYY-MM-DD') : '',
                      }))
                    }
                    format={formatStr.split.date}
                    slotProps={{
                      textField: { fullWidth: true },
                    }}
                  />
                </SettingRow>
              </Stack>
            </Card>

            <Card>
              <CardHeader
                sx={{ pb: 1.5 }}
                title="Visits"
                subheader="Booking limits for this site."
              />
              <Divider />
              <Stack spacing={2} sx={{ p: 3 }}>
                <SettingRow title="Days ahead" description="How far in advance visits can be booked.">
                  <TextField
                    fullWidth
                    type="number"
                    value={visits.daysAhead}
                    onChange={(event) =>
                      setVisits((current) => ({ ...current, daysAhead: event.target.value }))
                    }
                  />
                </SettingRow>
                <SettingRow title="Max party size" description="Maximum visitors allowed in one booking.">
                  <TextField
                    fullWidth
                    type="number"
                    value={visits.maxPartySize}
                    onChange={(event) =>
                      setVisits((current) => ({ ...current, maxPartySize: event.target.value }))
                    }
                  />
                </SettingRow>
                <SettingRow title="Paused" description="Temporarily stop new visit bookings at this site.">
                  <FormControlLabel
                    sx={{ m: 0, justifyContent: 'flex-end' }}
                    control={
                      <Switch
                        checked={Boolean(visits.paused)}
                        onChange={(event) =>
                          setVisits((current) => ({ ...current, paused: event.target.checked }))
                        }
                      />
                    }
                    label=""
                  />
                </SettingRow>
              </Stack>
            </Card>
          </>
        )}
      </Stack>
    </DashboardContent>
  );
}

AdminSettingsView.propTypes = {
  variant: PropTypes.oneOf(['owner', 'superAdmin']),
};

export default AdminSettingsView;
