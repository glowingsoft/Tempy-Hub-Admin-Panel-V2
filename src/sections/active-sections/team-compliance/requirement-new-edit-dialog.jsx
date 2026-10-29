import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetDepartmentsQuery } from 'src/store/Reducer/departments-api';
import { useGetJobTitlesQuery } from 'src/store/Reducer/job-titles-api';
import {
  useCreateRequirementMutation,
  useUpdateRequirementMutation,
} from 'src/store/Reducer/competencies-api';

// ----------------------------------------------------------------------

const TYPE_OPTIONS = [
  { value: 'competency', label: 'Competency' },
  { value: 'training', label: 'Training' },
];

const RequirementSchema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  type: zod.string().min(1, 'Type is required'),
  renewalMonths: zod.coerce
    .number({ invalid_type_error: 'Renewal months must be a number' })
    .min(0, 'Must be 0 or greater'),
  firstCompletionDays: zod.coerce
    .number({ invalid_type_error: 'First completion days must be a number' })
    .min(0, 'Must be 0 or greater'),
  amberDaysOverride: zod.union([
    zod.coerce.number().min(0, 'Must be 0 or greater'),
    zod.literal('').transform(() => null),
    zod.null(),
  ]).optional(),
  evidenceRequired: zod.boolean(),
  staffEvidenceAllowed: zod.boolean(),
  branchId: zod
    .object({ value: zod.string(), label: zod.string() })
    .nullable()
    .optional(),
  jobTitleOptions: zod
    .array(zod.object({ value: zod.string(), label: zod.string() }))
    .default([]),
  departmentOptions: zod
    .array(zod.object({ value: zod.string(), label: zod.string() }))
    .default([]),
});

const mapLookupOption = (item) => ({
  value: item._id,
  label: item.name,
});

/**
 * Normalise a raw field item (populated object or plain ID string) into { value, label }.
 * When only an ID is available the label is set to the ID temporarily —
 * InfiniteAutocomplete.resolveSelectedLabels will replace it once data loads.
 */
const normaliseItem = (item) => {
  if (!item) return null;
  if (typeof item === 'object') {
    const value = item._id || item.id || item.value;
    const label = item.name || item.label || value;
    return value ? { value, label } : null;
  }
  // Plain string ID
  return { value: item, label: item };
};

// ----------------------------------------------------------------------

export function RequirementNewEditDialog({
  open,
  onClose,
  organizationId,
  currentRequirement,
  isSiteManager = false,
  siteManagerBranchId = null,
}) {
  const isEdit = !!currentRequirement;

  const lookupQueryArgs = useMemo(() => ({ organizationId, limit: 100 }), [organizationId]);

  const defaultValues = useMemo(() => {
    // Job titles: prefer populated row.jobTitles (has real names), fallback to raw IDs
    const jobTitleOptions = Array.isArray(currentRequirement?.jobTitles) && currentRequirement.jobTitles.length
      ? currentRequirement.jobTitles.map(normaliseItem).filter(Boolean)
      : Array.isArray(currentRequirement?.appliesTo?.jobTitleIds)
        ? currentRequirement.appliesTo.jobTitleIds.map(normaliseItem).filter(Boolean)
        : [];

    // Departments: prefer populated row.departments (has real names), fallback to raw IDs
    const departmentOptions = Array.isArray(currentRequirement?.departments) && currentRequirement.departments.length
      ? currentRequirement.departments.map(normaliseItem).filter(Boolean)
      : Array.isArray(currentRequirement?.appliesTo?.departmentIds)
        ? currentRequirement.appliesTo.departmentIds.map(normaliseItem).filter(Boolean)
        : [];

    // Branch / Site
    const rawBranch = isSiteManager
      ? siteManagerBranchId
      : currentRequirement?.branch || currentRequirement?.branchId || null;
    const branchId = normaliseItem(rawBranch);

    return {
      name: currentRequirement?.name || '',
      type: currentRequirement?.type || 'competency',
      renewalMonths: currentRequirement?.renewalMonths ?? 12,
      firstCompletionDays: currentRequirement?.firstCompletionDays ?? 30,
      amberDaysOverride: currentRequirement?.amberDaysOverride ?? '',
      evidenceRequired: currentRequirement?.evidenceRequired ?? false,
      staffEvidenceAllowed: currentRequirement?.staffEvidenceAllowed ?? false,
      branchId,
      jobTitleOptions,
      departmentOptions,
    };
  }, [
    currentRequirement,
    isSiteManager,
    siteManagerBranchId,
  ]);

  const methods = useForm({
    resolver: zodResolver(RequirementSchema),
    defaultValues,
  });

  const { reset, handleSubmit, formState: { isSubmitting } } = methods;

  const [createRequirement] = useCreateRequirementMutation();
  const [updateRequirement] = useUpdateRequirementMutation();

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const handleClose = () => {
    onClose();
    reset(defaultValues);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        name: data.name.trim(),
        type: data.type,
        renewalMonths: Number(data.renewalMonths),
        firstCompletionDays: Number(data.firstCompletionDays),
        amberDaysOverride:
          data.amberDaysOverride === '' || data.amberDaysOverride == null
            ? null
            : Number(data.amberDaysOverride),
        evidenceRequired: Boolean(data.evidenceRequired),
        staffEvidenceAllowed: Boolean(data.staffEvidenceAllowed),
        appliesTo: {
          jobTitleIds: (data.jobTitleOptions || []).map((item) => item.value),
          departmentIds: (data.departmentOptions || []).map((item) => item.value),
        },
      };

      if (data.branchId?.value) {
        payload.branchId = data.branchId.value;
      } else if (isSiteManager && siteManagerBranchId) {
        payload.branchId = siteManagerBranchId;
      }

      if (isEdit) {
        await updateRequirement({
          organizationId,
          requirementId: currentRequirement._id,
          data: payload,
        }).unwrap();
        toast.success('Requirement updated successfully');
      } else {
        await createRequirement({
          organizationId,
          data: payload,
        }).unwrap();
        toast.success('Requirement created successfully');
      }

      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err?.message || 'Failed to save requirement');
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          {isEdit ? 'Edit Requirement' : 'Add Requirement'}
        </DialogTitle>

        <DialogContent dividers>
          <Box
            sx={{
              pt: 1,
              gap: 2.5,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Field.Text name="name" label="Name *" placeholder="e.g. Medication competency" />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Field.Select name="type" label="Type *">
                {TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Text
                name="renewalMonths"
                label="Renewal months *"
                type="number"
                placeholder="12"
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Field.Text
                name="firstCompletionDays"
                label="First completion days *"
                type="number"
                placeholder="30"
              />

              <Field.Text
                name="amberDaysOverride"
                label="Amber days override (optional)"
                type="number"
                placeholder="Optional"
              />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Field.Checkbox name="evidenceRequired" label="Evidence required" />
              <Field.Checkbox name="staffEvidenceAllowed" label="Staff may upload evidence" />
            </Box>

            {/* Applies to Job Titles via InfiniteAutocomplete */}
            <Field.InfiniteAutocomplete
              multiple
              disableCloseOnSelect
              name="jobTitleOptions"
              label="Applies to job titles"
              placeholder="Search job titles..."
              useQuery={useGetJobTitlesQuery}
              queryArgs={lookupQueryArgs}
              mapOption={mapLookupOption}
              enabled={open && !!organizationId}
            />

            {/* Applies to Departments via InfiniteAutocomplete */}
            <Field.InfiniteAutocomplete
              multiple
              disableCloseOnSelect
              name="departmentOptions"
              label="Applies to departments"
              placeholder="Search departments..."
              useQuery={useGetDepartmentsQuery}
              queryArgs={lookupQueryArgs}
              mapOption={mapLookupOption}
              enabled={open && !!organizationId}
            />

            {/* Site / Branch via InfiniteAutocomplete */}
            <Field.InfiniteAutocomplete
              name="branchId"
              label="Site"
              placeholder={isSiteManager ? 'Site locked' : 'Select site (optional)...'}
              useQuery={useGetBranchesQuery}
              queryArgs={lookupQueryArgs}
              mapOption={mapLookupOption}
              enabled={open && !!organizationId && !isSiteManager}
              disabled={isSiteManager}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

RequirementNewEditDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  organizationId: PropTypes.string,
  currentRequirement: PropTypes.object,
  isSiteManager: PropTypes.bool,
  siteManagerBranchId: PropTypes.string,
};