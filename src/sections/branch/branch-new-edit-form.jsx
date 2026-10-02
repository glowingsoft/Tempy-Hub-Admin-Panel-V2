import dayjs from 'dayjs';
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
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { mockJobTitles } from 'src/sections/job-title/mocks/data';
import { mockDepartments } from 'src/sections/department/mocks/data';

// import { useCreateBranchMutation, useUpdateBranchMutation } from 'src/store/Reducer/branches-api';
import { DEFAULT_BRANCH_SETTINGS, createMockBranch, updateMockBranch } from './mocks/data';
import { getBrowserTimezone } from './utils';

// ----------------------------------------------------------------------

export const BranchSchema = zod
  .object({
    name: zod.string().min(1, { message: 'Site name is required!' }),
    code: zod.string().optional(),
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
    // Manager
    hasManager: zod.boolean(),
    managerJobTitleId: zod.string().optional(),
    managerDepartmentId: zod.string().optional(),
    managerEmail: zod.string().optional(),
    managerName: zod.string().optional(),
    managerStartDate: zod.union([zod.string(), zod.null()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.hasManager) return;

    if (!data.managerJobTitleId) {
      ctx.addIssue({
        path: ['managerJobTitleId'],
        code: zod.ZodIssueCode.custom,
        message: 'Job title is required',
      });
    }
    if (!data.managerName) {
      ctx.addIssue({
        path: ['managerName'],
        code: zod.ZodIssueCode.custom,
        message: 'Manager name is required',
      });
    }
    if (!data.managerEmail) {
      ctx.addIssue({
        path: ['managerEmail'],
        code: zod.ZodIssueCode.custom,
        message: 'Manager email is required',
      });
    } else if (!zod.string().email().safeParse(data.managerEmail).success) {
      ctx.addIssue({
        path: ['managerEmail'],
        code: zod.ZodIssueCode.custom,
        message: 'Enter a valid email address',
      });
    }
    if (!data.managerStartDate) {
      ctx.addIssue({
        path: ['managerStartDate'],
        code: zod.ZodIssueCode.custom,
        message: 'Start date is required',
      });
    }
  });

// ----------------------------------------------------------------------

export function BranchNewEditForm({ organizationId, currentBranch }) {
  const router = useRouter();

  const isEdit = !!currentBranch;

  // Dropdown options come from the existing Job Titles / Departments data,
  // scoped to the owner's organization.
  const jobTitleOptions = useMemo(
    () =>
      mockJobTitles
        .filter((jt) => !organizationId || jt.organizationId === organizationId)
        .map((jt) => ({ value: jt._id, label: jt.name })),
    [organizationId]
  );

  const departmentOptions = useMemo(
    () =>
      mockDepartments
        .filter((dep) => !organizationId || dep.organizationId === organizationId)
        .map((dep) => ({ value: dep._id, label: dep.name })),
    [organizationId]
  );

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
      breaksPaid: currentBranch?.settings?.breaksPaid ?? DEFAULT_BRANCH_SETTINGS.breaksPaid,
      breakRules: currentBranch?.settings?.breakRules?.length
        ? currentBranch.settings.breakRules
        : DEFAULT_BRANCH_SETTINGS.breakRules,
      hasManager: !!currentBranch?.manager,
      managerJobTitleId: currentBranch?.manager?.jobTitleId || '',
      managerDepartmentId: currentBranch?.manager?.departmentId || '',
      managerEmail: currentBranch?.manager?.email || '',
      managerName: currentBranch?.manager?.name || '',
      managerStartDate: currentBranch?.manager?.startDate || null,
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

  const hasManager = watch('hasManager');
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
        // Only meaningful while enableBreaks is on, but always sent as-is —
        // simplest to reason about, and harmless to keep around if breaks
        // get switched back on later.
        breaksPaid: data.breaksPaid,
        breakRules: data.breakRules,
      };

      const manager = data.hasManager
        ? {
            name: data.managerName,
            email: data.managerEmail,
            jobTitleId: data.managerJobTitleId,
            ...(data.managerDepartmentId ? { departmentId: data.managerDepartmentId } : {}),
            startDate: data.managerStartDate
              ? dayjs(data.managerStartDate).toISOString()
              : undefined,
          }
        : undefined;

      const branchPayload = {
        name: data.name,
        code: data.code || undefined,
        // Timezone is not a form field — resolved from the browser (Intl API);
        // an existing branch keeps its stored value.
        timezone: currentBranch?.timezone || getBrowserTimezone(),
        address: data.address || undefined,
        assemblyPoint: data.assemblyPoint || undefined,
        settings,
      };

      // TODO: replace with the real mutation once the endpoints are wired up.
      // if (isEdit) {
      //   await updateBranch({ branchId: currentBranch._id, organizationId, ...branchPayload, manager: data.hasManager ? manager : null }).unwrap();
      // } else {
      //   await createBranch({ organizationId, ...branchPayload, manager }).unwrap();
      // }

      let branchId = currentBranch?._id;

      if (isEdit) {
        updateMockBranch(currentBranch._id, {
          ...branchPayload,
          manager: data.hasManager ? manager : null,
        });
      } else {
        const created = createMockBranch({ organizationId, ...branchPayload, manager });
        branchId = created._id;
      }

      toast.success(isEdit ? 'Site updated successfully!' : 'Site created successfully!');
      router.push(paths.owner.sites.detail(branchId));
    } catch (error) {
      toast.error(error?.data?.message || 'Something went wrong. Please try again.');
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
            <Field.Text name="code" label="Code" />
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
                InputProps={{
                  endAdornment: <InputAdornment position="end">mins</InputAdornment>,
                }}
              />
            </Box>

            {/* 3. Allow Phone Check-in */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Allow mobile phone check-in</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Permit staff members to check in and out via mobile app
                </Typography>
              </Box>
              <Field.Switch name="allowPhoneCheckIn" label="" sx={{ m: 0 }} />
            </Box>

            {/* 4. Enable Leave Requests */}
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

        <Card sx={{ p: 3 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography variant="h6">Site manager</Typography>
            <Field.Switch name="hasManager" label="Add manager" />
          </Stack>

          {hasManager && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
              >
                <Field.Select name="managerJobTitleId" label="Job title">
                  {jobTitleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Field.Select>

                <Field.Select name="managerDepartmentId" label="Department (optional)">
                  <MenuItem value="">None</MenuItem>
                  {departmentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Field.Select>

                <Field.Text name="managerName" label="Manager name" />
                <Field.Text name="managerEmail" label="Manager email" />

                <Field.DatePicker name="managerStartDate" label="Start date" />
              </Box>
            </>
          )}
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

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create site'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}
