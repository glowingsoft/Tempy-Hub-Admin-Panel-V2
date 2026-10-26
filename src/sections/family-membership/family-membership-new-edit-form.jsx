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
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';

import {
  FAMILY_ROLE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  mockResidentOptions,
  createMockFamilyInvitation,
  updateMockFamilyInvitation,
  updateMockFamilyMember,
} from './mocks/data';

// ----------------------------------------------------------------------

export const FamilyMembershipSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Enter a valid email address!' }),
  phone: zod.string().optional(),
  residentId: zod.string().min(1, { message: 'Linked resident is required!' }),
  relationship: zod.string().min(1, { message: 'Relationship is required!' }),
  role: zod.string().min(1, { message: 'Role is required!' }),
  isNok: zod.boolean(),
});

// ----------------------------------------------------------------------

export function FamilyMembershipNewEditForm({ currentMembership, isMember = false }) {
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();
  const isEdit = Boolean(currentMembership);

  const defaultValues = useMemo(
    () => ({
      name: currentMembership?.name || '',
      email: currentMembership?.email || '',
      phone: currentMembership?.phone || '',
      residentId: currentMembership?.residentId || mockResidentOptions[0]?.id || '',
      relationship: currentMembership?.relationship || 'Daughter',
      role: currentMembership?.role || 'family_member',
      isNok: currentMembership?.isNok || false,
    }),
    [currentMembership]
  );

  const methods = useForm({
    resolver: zodResolver(FamilyMembershipSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isMember) {
        updateMockFamilyMember(currentMembership._id, data);
        toast.success('Family member updated successfully!');
        reset();
        const returnPath =
          familyPaths.familyMemberships?.members?.detail(currentMembership._id) ||
          familyPaths.familyMemberships?.members?.root ||
          familyPaths.familyOverview;
        router.push(returnPath);
        return;
      }

      if (isEdit) {
        updateMockFamilyInvitation(currentMembership._id, data);
        toast.success('Family invitation updated successfully!');
      } else {
        const created = createMockFamilyInvitation({
          ...data,
          permissions: ['wall.view', 'photos.upload', 'gazette.view'],
        });
        toast.success(`Invitation sent to ${created.name}!`);
      }

      reset();
      const returnPath =
        familyPaths.familyMemberships?.invitations?.root ||
        familyPaths.familyMemberships?.root ||
        familyPaths.familyOverview;
      router.push(returnPath);
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  });

  const handleCancel = useCallback(() => {
    if (isMember) {
      const returnPath =
        familyPaths.familyMemberships?.members?.root ||
        familyPaths.familyOverview;
      router.push(returnPath);
      return;
    }
    const returnPath =
      familyPaths.familyMemberships?.invitations?.root ||
      familyPaths.familyMemberships?.root ||
      familyPaths.familyOverview;
    router.push(returnPath);
  }, [isMember, familyPaths, router]);

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3, width: 1 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {isEdit
            ? isMember
              ? 'Edit Family Member Details'
              : 'Edit Family Invitation Details'
            : 'Family Member Details'}
        </Typography>

        <Stack spacing={3}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <Field.Text name="name" label="Full Name" placeholder="e.g. Sarah Hughes" />
            <Field.Text name="email" label="Email Address" placeholder="e.g. sarah.h@example.com" />
          </Box>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <Field.Text name="phone" label="Phone Number" placeholder="e.g. +44 7700 900123" />

            <Field.Select name="residentId" label="Linked Resident">
              {mockResidentOptions.map((res) => (
                <MenuItem key={res.id} value={res.id}>
                  {res.name} (Room {res.room} · {res.branch})
                </MenuItem>
              ))}
            </Field.Select>
          </Box>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <Field.Select name="relationship" label="Relationship to Resident">
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="role" label="Family Role">
              {FAMILY_ROLE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Box>

          <Field.Switch
            name="isNok"
            label="Primary Next of Kin (NOK)"
            helperText="Check if this contact is the designated primary next of kin for medical & emergency notices"
          />

          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button variant="outlined" color="inherit" onClick={handleCancel}>
              Cancel
            </Button>

            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {isEdit ? 'Save Changes' : 'Send Invitation'}
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>
    </Form>
  );
}

// Reusable export alias for member form
export function FamilyMemberEditForm({ currentMember }) {
  return <FamilyMembershipNewEditForm currentMembership={currentMember} isMember />;
}