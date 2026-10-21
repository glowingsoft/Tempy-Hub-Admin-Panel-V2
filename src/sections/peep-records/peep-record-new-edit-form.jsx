import { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { toast } from 'src/components/snackbar';
import { Field, Form } from 'src/components/hook-form';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { ALL_BRANCHES_VALUE } from 'src/sections/branch/owner-branch-select';
import { useGetResidentsQuery } from 'src/store/Reducer/residents-api';
import {
  useCreatePeepRecordMutation,
  useUpdatePeepRecordMutation,
} from 'src/store/Reducer/peep-floor-plan-api';
import { PEEP_LEVELS } from './mocks/data';

// ----------------------------------------------------------------------

const mapBranchOption = (item) => ({
  value: item._id,
  label: item.name,
});

const EXTRA_BRANCH_OPTIONS = [{ value: ALL_BRANCHES_VALUE, label: 'All sites' }];

const PeepRecordSchema = zod.object({
  branchId: zod.any().optional(),
  residentId: zod.any().refine((val) => {
    if (!val) return false;
    if (typeof val === 'object') return Boolean(val.value);
    if (typeof val === 'string') return val.trim().length > 0;
    return false;
  }, { message: 'Resident is required!' }),
  peepLevel: zod.string().min(1, { message: 'PEEP level is required!' }),
  supportNeeds: zod.string().min(1, { message: 'Support needs are required!' }),
  primaryRoute: zod.string().optional().or(zod.literal('')),
  secondaryRoute: zod.string().optional().or(zod.literal('')),
  equipmentRequired: zod.string().optional().or(zod.literal('')),
  responsibleStaff: zod.string().optional().or(zod.literal('')),
});

export function PeepRecordNewEditForm({ currentRecord, ownerDashboard = true }) {
  const router = useRouter();
  const isEdit = Boolean(currentRecord);
  const base = ownerDashboard ? paths.owner : paths.siteManager;

  const { user } = useSelector((state) => state.user);
  const { organizationId: currentOrgId } = useCurrentOrganization();
  const activeOrgId = currentOrgId || getOwnerOrganizationId(user);

  const [createPeepRecord, { isLoading: isCreating }] = useCreatePeepRecordMutation();
  const [updatePeepRecord, { isLoading: isUpdating }] = useUpdatePeepRecordMutation();

  const defaultValues = useMemo(() => {
    const branchObj = currentRecord?.branch;
    const branchId =
      typeof branchObj === 'object' ? branchObj?._id : branchObj || currentRecord?.branchId;
    const branchLabel =
      typeof branchObj === 'object'
        ? branchObj?.name
        : currentRecord?.branchName || currentRecord?.branch || 'Selected site';

    const residentObj = currentRecord?.resident;
    const residentId =
      typeof residentObj === 'object'
        ? residentObj?._id || residentObj?.id
        : residentObj || currentRecord?.residentId;
    const residentName =
      typeof residentObj === 'object'
        ? residentObj?.name || `${residentObj?.firstName || ''} ${residentObj?.lastName || ''}`.trim() || 'Resident'
        : currentRecord?.residentName || currentRecord?.name || 'Resident';
    const roomNumber =
      typeof residentObj === 'object' ? residentObj?.roomNumber : currentRecord?.roomNumber;
    const residentLabel = roomNumber ? `${residentName} - Room ${roomNumber}` : residentName;

    return {
      branchId: branchId
        ? { value: branchId, label: branchLabel }
        : { value: ALL_BRANCHES_VALUE, label: 'All sites' },
      residentId: residentId
        ? { value: residentId, label: residentLabel }
        : null,
      peepLevel: currentRecord?.peepLevel || 'high',
      supportNeeds: currentRecord?.supportNeeds || '',
      primaryRoute: currentRecord?.primaryRoute || '',
      secondaryRoute: currentRecord?.secondaryRoute || '',
      equipmentRequired: currentRecord?.equipmentRequired || '',
      responsibleStaff: currentRecord?.responsibleStaff || '',
    };
  }, [currentRecord]);

  const methods = useForm({
    resolver: zodResolver(PeepRecordSchema),
    defaultValues,
    values: defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const watchedBranch = watch('branchId');
  const selectedBranchId = typeof watchedBranch === 'object' ? watchedBranch?.value : watchedBranch;

  const prevBranchRef = useRef(selectedBranchId);
  useEffect(() => {
    if (prevBranchRef.current !== undefined && prevBranchRef.current !== selectedBranchId) {
      if (!isEdit) {
        setValue('residentId', null, { shouldValidate: true });
      }
    }
    prevBranchRef.current = selectedBranchId;
  }, [selectedBranchId, isEdit, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const residentId =
        typeof values.residentId === 'object' ? values.residentId?.value : values.residentId;

      if (!residentId) {
        toast.error('Resident is required!');
        return;
      }

      const payload = {
        residentId,
        peepLevel: values.peepLevel,
        supportNeeds: values.supportNeeds || '',
        primaryRoute: values.primaryRoute || '',
        secondaryRoute: values.secondaryRoute || '',
        equipmentRequired: values.equipmentRequired || '',
        responsibleStaff: values.responsibleStaff || '',
      };

      if (isEdit) {
        const peepRecordId = currentRecord?._id || currentRecord?.id;
        await updatePeepRecord({
          peepRecordId,
          organizationId: activeOrgId,
          ...payload,
        }).unwrap();
      } else {
        await createPeepRecord({
          organizationId: activeOrgId,
          ...payload,
        }).unwrap();
      }

      toast.success(
        isEdit ? 'PEEP record updated successfully!' : 'PEEP record created successfully!'
      );
      router.push(base.peepAndFloorPlans.records.root);
    } catch (error) {
      console.error('Failed to save PEEP record:', error);
      toast.error(error?.data?.message || error?.message || 'Something went wrong. Please try again.');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        <Card sx={{ position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              PEEP record
            </Typography>

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }}
            >
              <Field.InfiniteAutocomplete
                name="branchId"
                label="Site"
                placeholder="Search site..."
                useQuery={useGetBranchesQuery}
                queryArgs={{ organizationId: activeOrgId }}
                mapOption={mapBranchOption}
                extraOptions={EXTRA_BRANCH_OPTIONS}
                enabled={Boolean(activeOrgId) && !isEdit}
                disabled={isEdit}
              />

              <Field.InfiniteAutocomplete
                key={`resident-${selectedBranchId || 'all'}`}
                name="residentId"
                label="Resident"
                placeholder="Search resident..."
                useQuery={useGetResidentsQuery}
                queryArgs={{
                  organizationId: activeOrgId,
                  ...(selectedBranchId && selectedBranchId !== ALL_BRANCHES_VALUE
                    ? { branchId: selectedBranchId }
                    : {}),
                }}
                mapOption={(resident) => ({
                  value: resident._id || resident.id,
                  label: resident.name
                    ? (resident.roomNumber
                      ? `${resident.name} - Room ${resident.roomNumber}`
                      : resident.name)
                    : resident._id,
                })}
                enabled={Boolean(activeOrgId) && !isEdit}
                disabled={isEdit}
                required
              />

              <Field.Select name="peepLevel" label="PEEP level">
                {Object.entries(PEEP_LEVELS).map(([value, level]) => (
                  <MenuItem key={value} value={value}>
                    {level.label} - {level.description}
                  </MenuItem>
                ))}
              </Field.Select>

              <Field.Text
                name="supportNeeds"
                label="Support needs"
                multiline
                rows={3}
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />

              <Field.Text name="primaryRoute" label="Primary route" multiline rows={3} />

              <Field.Text name="secondaryRoute" label="Secondary route" multiline rows={3} />

              <Field.Text
                name="equipmentRequired"
                label="Equipment required"
                multiline
                rows={3}
              />

              <Field.Text
                name="responsibleStaff"
                label="Responsible staff"
                multiline
                rows={3}
              />
            </Box>
          </Box>
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button
            color="inherit"
            onClick={() => router.push(base.peepAndFloorPlans.records.root)}
          >
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isSubmitting || isCreating || isUpdating}
          >
            {isEdit ? 'Save changes' : 'Create PEEP record'}
          </LoadingButton>
        </Stack>
      </Stack>
    </Form>
  );
}