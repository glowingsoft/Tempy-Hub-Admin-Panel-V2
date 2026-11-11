import { z as zod } from 'zod';
import { useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useCreateBranchMutation, useUpdateBranchMutation } from 'src/store/Reducer/branches-api';
import { DEFAULT_BRANCH_SETTINGS } from './mocks/data';
import { getBrowserTimezone } from './utils';

// ----------------------------------------------------------------------

export const BranchSchema = zod.object({
  name: zod.string().trim().min(1, { message: 'Site name is required!' }),
  code: zod
    .string()
    .trim()
    .min(1, { message: 'Code is required!' })
    .regex(
      /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{6}$/,
      {
        message:
          'Branch code must be exactly 6 characters and include both letters and numbers (A–Z, 0–9). Do not use spaces or hyphens. Example: FH01AB',
      }
    ),
  address: zod.string().optional(),
  assemblyPoint: zod.string().optional(),
  // Settings
  enableBreaks: zod.boolean(),
  enableLeaveRequests: zod.boolean(),
  lateGraceMinutes: zod.coerce
    .number({ invalid_type_error: 'Late grace minutes must be a number' })
    .int('Must be a whole number')
    .min(0, 'Cannot be negative'),
  allowPhoneCheckIn: zod.boolean(),
  autoClockOutHoursAfterShiftEnd: zod.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .min(0, 'Cannot be negative')
    .max(24, 'Cannot be more than 24 hours'),
  autoClockOutHoursAfterClockIn: zod.coerce
    .number({ invalid_type_error: 'Must be a number' })
    .min(0, 'Cannot be negative')
    .max(24, 'Cannot be more than 24 hours'),
  // Break rules — only relevant while enableBreaks is on.
  breaksPaid: zod.boolean(),
  breakRules: zod.array(
    zod.object({
      minHours: zod.coerce
        .number({ invalid_type_error: 'Must be a number' })
        .min(0, 'Cannot be negative'),
      unpaidMinutes: zod.coerce
        .number({ invalid_type_error: 'Must be a number' })
        .min(0, 'Cannot be negative'),
    })
  ),
});

// ----------------------------------------------------------------------

export function BranchNewEditForm({ organizationId, currentBranch }) {
  const router = useRouter();

  const isEdit = !!currentBranch;

  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();

  const defaultValues = useMemo(
    () => ({
      name: currentBranch?.name || '',
      code: currentBranch?.code || '',
      address: currentBranch?.address || '',
      assemblyPoint: currentBranch?.assemblyPoint || '',
      enableBreaks: currentBranch?.settings?.enableBreaks ?? DEFAULT_BRANCH_SETTINGS.enableBreaks,
      enableLeaveRequests:
        currentBranch?.settings?.enableLeaveRequests ?? DEFAULT_BRANCH_SETTINGS.enableLeaveRequests,
      lateGraceMinutes:
        currentBranch?.settings?.lateGraceMinutes ?? DEFAULT_BRANCH_SETTINGS.lateGraceMinutes,
      allowPhoneCheckIn:
        currentBranch?.settings?.allowPhoneCheckIn ?? DEFAULT_BRANCH_SETTINGS.allowPhoneCheckIn,
      autoClockOutHoursAfterShiftEnd:
        currentBranch?.settings?.autoClockOutHoursAfterShiftEnd ??
        DEFAULT_BRANCH_SETTINGS.autoClockOutHoursAfterShiftEnd,
      autoClockOutHoursAfterClockIn:
        currentBranch?.settings?.autoClockOutHoursAfterClockIn ??
        DEFAULT_BRANCH_SETTINGS.autoClockOutHoursAfterClockIn,
      breaksPaid: currentBranch?.settings?.breaksPaid ?? DEFAULT_BRANCH_SETTINGS.breaksPaid,
      breakRules: currentBranch?.settings?.breakRules?.length
        ? currentBranch.settings.breakRules
        : DEFAULT_BRANCH_SETTINGS.breakRules,
    }),
    [currentBranch]
  );

  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(BranchSchema),
    defaultValues,
  });

  const {
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const enableBreaks = watch('enableBreaks');

  const { fields: breakRuleFields, append: appendBreakRule, remove: removeBreakRule } = useFieldArray({
    control,
    name: 'breakRules',
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const settings = {
        enableBreaks: data.enableBreaks,
        enableLeaveRequests: data.enableLeaveRequests,
        lateGraceMinutes: data.lateGraceMinutes,
        allowPhoneCheckIn: data.allowPhoneCheckIn,
        autoClockOutHoursAfterShiftEnd: data.autoClockOutHoursAfterShiftEnd,
        autoClockOutHoursAfterClockIn: data.autoClockOutHoursAfterClockIn,
        // Only meaningful while enableBreaks is on, but always sent as-is —
        // simplest to reason about, and harmless to keep around if breaks
        // get switched back on later.
        breaksPaid: data.breaksPaid,
        breakRules: data.breakRules,
      };

      const branchPayload = {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        // Timezone is not a form field — resolved from the browser (Intl API);
        // an existing branch keeps its stored value.
        timezone: currentBranch?.timezone || getBrowserTimezone(),
        address: data.address || undefined,
        assemblyPoint: data.assemblyPoint || undefined,
        settings,
      };

      let branchId = currentBranch?._id;

      if (isEdit) {
        const response = await updateBranch({
          branchId: currentBranch._id,
          organizationId,
          ...branchPayload,
        }).unwrap();
        branchId = response?._id || response?.data?._id || currentBranch._id;
      } else {
        const response = await createBranch({
          organizationId,
          ...branchPayload,
        }).unwrap();
        branchId = response?._id || response?.data?._id || response?.data?.branch?._id;
      }

      toast.success(isEdit ? 'Site updated successfully!' : 'Site created successfully!');
      if (branchId) {
        router.push(paths.owner.sites.detail(branchId));
      } else {
        router.push(paths.owner.sites.root);
      }
    } catch (error) {
      console.error('Save site error:', error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.msg ||
        error?.data?.error ||
        error?.error ||
        error?.message ||
        'Something went wrong. Please try again.';

      if (typeof errorMessage === 'string') {
        const lower = errorMessage.toLowerCase();
        if (lower.includes('code')) {
          methods.setError('code', {
            type: 'manual',
            message: lower.includes('missing')
              ? 'Code is required!'
              : errorMessage,
          });
          return;
        }
        if (lower.includes('name')) {
          methods.setError('name', {
            type: 'manual',
            message: lower.includes('missing')
              ? 'Site name is required!'
              : errorMessage,
          });
          return;
        }
      }

      toast.error(errorMessage);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Site details
          </Typography>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <Field.Text name="name" label="Site name" />
            <Field.Text
              name="code"
              label="Code"
              placeholder="FH01AB"
              helperText="Branch code must be exactly 6 characters and include both letters and numbers (A–Z, 0–9). Do not use spaces or hyphens. Example: FH01AB"
              inputProps={{
                maxLength: 6,
                style: { textTransform: 'uppercase' },
              }}
            />
            <Field.Text name="assemblyPoint" label="Assembly point" />

            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <Field.Text name="address" label="Address" multiline rows={2} />
            </Box>
          </Box>
        </Card>

        <Card sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Attendance settings</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Configure site check-in rules, grace periods, and shift break policies.
            </Typography>
          </Box>

          <Stack spacing={3} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
            {/* 1. Enable Breaks Toggle & Nested Settings */}
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Enable shift breaks</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Allow staff members to log break times during their active shift
                  </Typography>
                </Box>
                <Field.Switch name="enableBreaks" label="" sx={{ m: 0 }} />
              </Box>

              {enableBreaks && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 1.5,
                    bgcolor: (theme) => theme.vars?.palette?.background?.neutral || 'action.hover',
                    borderStyle: 'dashed',
                  }}
                >
                  <Stack spacing={2.5}>
                    {/* Paid breaks switch */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Paid breaks</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          When disabled, break time will be deducted based on the rules below
                        </Typography>
                      </Box>
                      <Field.Switch name="breaksPaid" label="" sx={{ m: 0 }} />
                    </Box>

                    {/* Unpaid Break Rules Container */}
                    {!watch('breaksPaid') && (
                      <Stack spacing={2}>
                        <Divider sx={{ borderStyle: 'dashed' }} />

                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Unpaid break rules
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                            The rule for the longest qualifying shift duration applies automatically (e.g. a 12h shift uses the 12h rule over the 6h rule).
                          </Typography>
                        </Box>

                        <Stack spacing={1.5}>
                          {breakRuleFields.map((field, index) => (
                            <Paper
                              key={field.id}
                              variant="outlined"
                              sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'stretch', sm: 'center' },
                                gap: 2,
                                bgcolor: 'background.paper',
                              }}
                            >
                              <Stack direction="row" spacing={1.5} alignItems="center" flexGrow={1}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', minWidth: 60 }}>
                                  Shift ≥
                                </Typography>
                                <Field.Text
                                  name={`breakRules[${index}].minHours`}
                                  label="Min hours"
                                  type="number"
                                  size="small"
                                  fullWidth
                                  InputProps={{
                                    endAdornment: <InputAdornment position="end">hrs</InputAdornment>,
                                  }}
                                />
                              </Stack>

                              <Stack direction="row" spacing={1.5} alignItems="center" flexGrow={1}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', minWidth: 60 }}>
                                  Deduct
                                </Typography>
                                <Field.Text
                                  name={`breakRules[${index}].unpaidMinutes`}
                                  label="Unpaid time"
                                  type="number"
                                  size="small"
                                  fullWidth
                                  InputProps={{
                                    endAdornment: <InputAdornment position="end">mins</InputAdornment>,
                                  }}
                                />
                              </Stack>

                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeBreakRule(index)}
                                sx={{ alignSelf: { xs: 'flex-end', sm: 'center' } }}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                              </IconButton>
                            </Paper>
                          ))}

                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => appendBreakRule({ minHours: 0, unpaidMinutes: 0 })}
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            sx={{ alignSelf: 'flex-start', mt: 1 }}
                          >
                            Add break rule
                          </Button>
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              )}
            </Stack>

            {/* 2. Late Grace Period */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Late grace period</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Buffer time after shift start before check-in is marked as Late
                </Typography>
              </Box>
              <Field.Text
                name="lateGraceMinutes"
                label="Grace period"
                type="number"
                size="small"
                sx={{ minWidth: 160, maxWidth: { sm: 200 } }}
                inputProps={{ min: 0 }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">mins</InputAdornment>,
                }}
              />
            </Box>

            {/* 3. Auto Clock-out After Shift End */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Auto clock-out after shift end</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Hours after scheduled shift end before an open session is automatically closed (max 24h)
                </Typography>
              </Box>
              <Field.Text
                name="autoClockOutHoursAfterShiftEnd"
                label="Hours after shift end"
                type="number"
                size="small"
                sx={{ minWidth: 160, maxWidth: { sm: 200 } }}
                inputProps={{ min: 0, max: 24, step: 'any' }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">hrs</InputAdornment>,
                }}
              />
            </Box>

            {/* 4. Auto Clock-out After Clock-in (Unscheduled) */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Auto clock-out after clock-in (unscheduled)</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Hours after clock-in before an unscheduled open session is closed (max 24h)
                </Typography>
              </Box>
              <Field.Text
                name="autoClockOutHoursAfterClockIn"
                label="Hours after clock-in"
                type="number"
                size="small"
                sx={{ minWidth: 160, maxWidth: { sm: 200 } }}
                inputProps={{ min: 0, max: 24, step: 'any' }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">hrs</InputAdornment>,
                }}
              />
            </Box>

            {/* 5. Allow Phone Check-in */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Allow mobile phone check-in</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Permit staff members to check in and out via mobile app
                </Typography>
              </Box>
              <Field.Switch name="allowPhoneCheckIn" label="" sx={{ m: 0 }} />
            </Box>

            {/* 6. Enable Leave Requests */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Enable leave requests</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Allow staff members assigned to this site to submit leave requests
                </Typography>
              </Box>
              <Field.Switch name="enableLeaveRequests" label="" sx={{ m: 0 }} />
            </Box>
          </Stack>
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button
            color="inherit"
            onClick={() =>
              router.push(
                isEdit ? paths.owner.sites.detail(currentBranch._id) : paths.owner.sites.root
              )
            }
          >
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isSubmitting || isCreating || isUpdating}
          >
            {isEdit ? 'Save changes' : 'Create site'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
