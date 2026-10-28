import { z as zod } from 'zod';
import { useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';
import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { useGetResidentsQuery } from 'src/store/Reducer/residents-api';
import {
  useDecideFamilyInvitationMutation,
  useGetFamilyRelationshipsQuery,
  useInviteFamilyMemberMutation,
} from 'src/store/Reducer/family-invitations-api';

import { getInvitationId } from './utils';

// ----------------------------------------------------------------------

const lookupOptionSchema = zod.object({
  value: zod.string().min(1),
  label: zod.string(),
});

const InvitationSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Enter a valid email address!' }),
  resident: lookupOptionSchema.nullable().refine((value) => !!value?.value, {
    message: 'Linked resident is required!',
  }),
  relationship: zod.string().min(1, { message: 'Relationship is required!' }),
  isNok: zod.boolean(),
});

const mapResidentOption = (item) => ({
  value: item._id,
  label: item.roomNumber ? `${item.name} (Room ${item.roomNumber})` : item.name,
});

function toResidentOption(invitation) {
  if (!invitation?.residentId) return null;
  const name = invitation.residentName || 'Selected resident';
  const room = invitation.roomNumber;
  return {
    value: invitation.residentId,
    label: room ? `${name} (Room ${room})` : name,
  };
}

// ----------------------------------------------------------------------

export function FamilyInvitationForm({ currentInvitation }) {
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId } = useCurrentOrganization();
  const isEdit = Boolean(getInvitationId(currentInvitation));

  const residentQueryArgs = useMemo(() => ({ organizationId }), [organizationId]);
  const { data: relationshipOptions = [] } = useGetFamilyRelationshipsQuery();
  const [inviteFamilyMember] = useInviteFamilyMemberMutation();
  const [decideFamilyInvitation] = useDecideFamilyInvitationMutation();

  const defaultValues = useMemo(
    () => ({
      name: currentInvitation?.name || '',
      email: currentInvitation?.email || '',
      resident: toResidentOption(currentInvitation),
      relationship: currentInvitation?.relationship || '',
      isNok: Boolean(currentInvitation?.isNextOfKin),
    }),
    [currentInvitation]
  );

  const methods = useForm({
    resolver: zodResolver(InvitationSchema),
    defaultValues,
    values: defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const selectedResident = watch('resident');
  const listPath =
    familyPaths.familyMemberships?.invitations?.root || familyPaths.familyOverview;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit) {
        await decideFamilyInvitation({
          organizationId,
          familyInvitationId: getInvitationId(currentInvitation),
          action: 'edit',
          name: data.name,
          relationship: data.relationship,
        }).unwrap();
        toast.success('Family invitation updated successfully!');
      } else {
        await inviteFamilyMember({
          organizationId,
          email: data.email,
          name: data.name,
          residentId: data.resident.value,
          relationship: data.relationship,
          isNextOfKin: Boolean(data.isNok),
        }).unwrap();
        toast.success(`Invitation sent to ${data.name}!`);
      }

      router.push(listPath);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'An error occurred. Please try again.');
    }
  });

  const handleCancel = useCallback(() => {
    router.push(listPath);
  }, [listPath, router]);

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3, width: 1 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {isEdit ? 'Edit Family Invitation Details' : 'Family Member Details'}
        </Typography>

        <Stack spacing={3}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <Field.Text name="name" label="Full Name" placeholder="e.g. Sarah Hughes" />
            <Field.Text
              name="email"
              label="Email Address"
              placeholder="e.g. sarah.h@example.com"
              disabled={isEdit}
            />
          </Box>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <InfiniteAutocomplete
              value={selectedResident}
              onChange={(option) => setValue('resident', option, { shouldValidate: true })}
              useQuery={useGetResidentsQuery}
              queryArgs={residentQueryArgs}
              mapOption={mapResidentOption}
              label="Linked Resident"
              placeholder="Search resident..."
              disabled={isEdit || !organizationId}
              error={Boolean(errors.resident)}
              helperText={errors.resident?.message}
            />

            <Field.Select name="relationship" label="Relationship to Resident">
              {relationshipOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} sx={{ textTransform: 'capitalize' }}>
                  {opt.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Box>

          {!isEdit && (
            <Field.Switch
              name="isNok"
              label="Primary Next of Kin (NOK)"
              helperText="Check if this contact is the designated primary next of kin for medical & emergency notices"
            />
          )}

          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button variant="outlined" color="inherit" onClick={handleCancel}>
              Cancel
            </Button>
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              {isEdit ? 'Save Changes' : 'Send Invitation'}
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>
    </Form>
  );
}
