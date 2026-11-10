import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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

import { paths } from 'src/routes/paths';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';
import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';

import {
  useGetOrganizationByIdQuery,
  useUpdateOrganizationMutation,
} from 'src/store/Reducer/organizations-api';

// ----------------------------------------------------------------------

const SUPERVISION_INTERVAL_OPTIONS = [
  { value: 1, label: '1 month' },
  { value: 2, label: '2 months' },
  { value: 3, label: '3 months' },
  { value: 4, label: '4 months' },
  { value: 6, label: '6 months' },
];

const APPRAISAL_INTERVAL_OPTIONS = [
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
];

// ----------------------------------------------------------------------

export function OwnerSettingsView() {
  const { organizationId } = useCurrentOrganization();

  const { data, isLoading, isError, refetch } = useGetOrganizationByIdQuery(
    organizationId,
    { skip: !organizationId }
  );

  const [updateOrganization, { isLoading: isUpdating }] = useUpdateOrganizationMutation();

  const organization = useMemo(() => (data?.data ?? data) || null, [data]);

  // Initial settings directly derived from backend data
  const initialSettings = useMemo(
    () => ({
      emergencyNotifyOffsite: Boolean(organization?.settings?.emergencyNotifyOffsite),
      defaultSupervisionIntervalMonths:
        organization?.settings?.defaultSupervisionIntervalMonths ?? 3,
      defaultAppraisalIntervalMonths:
        organization?.settings?.defaultAppraisalIntervalMonths ?? 12,
      defaultAnnualLeaveDays: String(organization?.settings?.defaultAnnualLeaveDays ?? ''),
    }),
    [organization]
  );

  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const isDirty = useMemo(
    () =>
      settings.emergencyNotifyOffsite !== initialSettings.emergencyNotifyOffsite ||
      Number(settings.defaultSupervisionIntervalMonths) !==
      Number(initialSettings.defaultSupervisionIntervalMonths) ||
      Number(settings.defaultAppraisalIntervalMonths) !==
      Number(initialSettings.defaultAppraisalIntervalMonths) ||
      settings.defaultAnnualLeaveDays !== initialSettings.defaultAnnualLeaveDays,
    [settings, initialSettings]
  );

  const annualLeaveDays = Number(settings.defaultAnnualLeaveDays);
  const isAnnualLeaveDaysValid =
    settings.defaultAnnualLeaveDays === ''
      ? initialSettings.defaultAnnualLeaveDays === ''
      : Number.isSafeInteger(annualLeaveDays) && annualLeaveDays >= 0;

  const handleSave = async () => {
    if (!organizationId) return;
    if (!isAnnualLeaveDaysValid) return;

    try {
      const res = await updateOrganization({
        organizationId,
        settings: {
          emergencyNotifyOffsite: settings.emergencyNotifyOffsite,
          defaultSupervisionIntervalMonths: Number(settings.defaultSupervisionIntervalMonths),
          defaultAppraisalIntervalMonths: Number(settings.defaultAppraisalIntervalMonths),
          ...(settings.defaultAnnualLeaveDays !== ''
            ? { defaultAnnualLeaveDays: annualLeaveDays }
            : {}),
        },
      }).unwrap();

      toast.success(res?.message || res?.msg || 'Settings updated successfully!');
    } catch (error) {
      console.error('Update organization settings error:', error);
      toast.error(error?.data?.message || error?.message || 'Failed to update settings.');
    }
  };

  const handleToggleEmergency = (checked) => {
    setSettings((prev) => ({ ...prev, emergencyNotifyOffsite: checked }));
  };

  const handleChangeSupervision = (value) => {
    setSettings((prev) => ({ ...prev, defaultSupervisionIntervalMonths: Number(value) }));
  };

  const handleChangeAppraisal = (value) => {
    setSettings((prev) => ({ ...prev, defaultAppraisalIntervalMonths: Number(value) }));
  };

  const handleChangeAnnualLeaveDays = (event) => {
    setSettings((prev) => ({ ...prev, defaultAnnualLeaveDays: event.target.value }));
  };

  if (isLoading) {
    return (
      <DashboardContent>
        <LoadingScreen sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  if (!organization && !isLoading) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Settings"
          links={[{ name: 'Dashboard', href: paths.owner.root }, { name: 'Settings' }]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <EmptyContent
          filled
          title={isError ? 'Unable to load organization settings' : 'Organization not found'}
          action={
            <Button variant="contained" onClick={() => refetch()} sx={{ mt: 2 }}>
              Retry
            </Button>
          }
          sx={{ py: 10 }}
        />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Settings"
        links={[{ name: 'Dashboard', href: paths.owner.root }, { name: 'Settings' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <CardHeader
          title="Organization Settings"
          subheader="Manage organization-wide notification preferences and operational intervals."
          action={
            <LoadingButton
              variant="contained"
              color="primary"
              loading={isUpdating}
              disabled={!isDirty || !isAnnualLeaveDaysValid}
              onClick={handleSave}
            >
              Save changes
            </LoadingButton>
          }
        />

        <Divider sx={{ my: 2 }} />

        <Stack spacing={4} sx={{ p: 3 }}>
          {/* Emergency Notify Offsite Setting */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              p: 2.5,
              borderRadius: 1.5,
              bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'),
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack spacing={0.5}>
              <Typography variant="subtitle1">
                Notify off-site members during emergencies
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                When enabled, off-site staff also receive emergency notifications and alerts.
              </Typography>
            </Stack>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.emergencyNotifyOffsite}
                  disabled={isUpdating}
                  onChange={(e) => handleToggleEmergency(e.target.checked)}
                  inputProps={{ 'aria-label': 'Notify off-site members during emergencies' }}
                />
              }
              label=""
              sx={{ m: 0 }}
            />
          </Box>

          {/* Supervision Interval Setting */}
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
            <Stack spacing={0.5}>
              <Typography variant="subtitle1">
                Default Supervision Interval
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Default interval between staff competency supervision.
              </Typography>
            </Stack>

            <TextField
              select
              size="small"
              disabled={isUpdating}
              value={settings.defaultSupervisionIntervalMonths}
              onChange={(e) => handleChangeSupervision(e.target.value)}
              sx={{ minWidth: 200, width: { xs: '100%', md: 'auto' } }}
            >
              {SUPERVISION_INTERVAL_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Annual Leave Setting */}
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
            <Stack spacing={0.5}>
              <Typography variant="subtitle1">Default Annual Leave Days</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Default annual leave entitlement for staff. Enter a whole number of days.
              </Typography>
            </Stack>

            <TextField
              type="number"
              size="small"
              label="Days"
              value={settings.defaultAnnualLeaveDays}
              onChange={handleChangeAnnualLeaveDays}
              disabled={isUpdating}
              error={!isAnnualLeaveDaysValid}
              helperText={!isAnnualLeaveDaysValid ? 'Enter a whole number of 0 or more.' : ''}
              inputProps={{ min: 0, step: 1 }}
              sx={{ minWidth: 200, width: { xs: '100%', md: 'auto' } }}
            />
          </Box>

          {/* Appraisal Interval Setting */}
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
            <Stack spacing={0.5}>
              <Typography variant="subtitle1">
                Default Appraisal Interval
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Default interval between staff performance appraisal reviews.
              </Typography>
            </Stack>

            <TextField
              select
              size="small"
              disabled={isUpdating}
              value={settings.defaultAppraisalIntervalMonths}
              onChange={(e) => handleChangeAppraisal(e.target.value)}
              sx={{ minWidth: 200, width: { xs: '100%', md: 'auto' } }}
            >
              {APPRAISAL_INTERVAL_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Stack>
      </Card>
    </DashboardContent>
  );
}