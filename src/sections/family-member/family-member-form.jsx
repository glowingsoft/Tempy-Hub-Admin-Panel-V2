import { z as zod } from 'zod';
import { useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';
import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { useGetFamilyRelationshipsQuery } from 'src/store/Reducer/family-invitations-api';
import { useUpdateFamilyMemberMutation } from 'src/store/Reducer/family-members-api';

import { getFamilyMemberId } from './utils';

// ----------------------------------------------------------------------

const MemberSchema = zod.object({
  relationship: zod.string().min(1, { message: 'Relationship is required!' }),
});

// ----------------------------------------------------------------------

export function FamilyMemberForm({ currentMember }) {
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId } = useCurrentOrganization();
  const memberId = getFamilyMemberId(currentMember);

  const { data: relationshipOptions = [] } = useGetFamilyRelationshipsQuery();
  const [updateFamilyMember] = useUpdateFamilyMemberMutation();

  const defaultValues = useMemo(
    () => ({
      relationship: currentMember?.relationship || '',
    }),
    [currentMember]
  );

  const methods = useForm({
    resolver: zodResolver(MemberSchema),
    defaultValues,
    values: defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const detailPath =
    familyPaths.familyMemberships?.members?.detail(memberId) ||
    familyPaths.familyMemberships?.members?.root ||
    familyPaths.familyOverview;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateFamilyMember({
        organizationId,
        memberId,
        relationship: data.relationship,
      }).unwrap();
      toast.success('Family member updated successfully!');
      router.push(detailPath);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'An error occurred. Please try again.');
    }
  });

  const handleCancel = useCallback(() => {
    router.push(detailPath);
  }, [detailPath, router]);

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3, width: 1 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Edit Family Member Details
        </Typography>

        <Stack spacing={3}>
          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <TextField label="Full Name" value={currentMember?.name || ''} disabled fullWidth />
            <TextField label="Email Address" value={currentMember?.email || ''} disabled fullWidth />
          </Box>

          <Field.Select name="relationship" label="Relationship to Resident">
            {relationshipOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ textTransform: 'capitalize' }}>
                {opt.label}
              </MenuItem>
            ))}
          </Field.Select>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button variant="outlined" color="inherit" onClick={handleCancel}>
              Cancel
            </Button>
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              Save Changes
            </LoadingButton>
          </Stack>
        </Stack>
      </Card>
    </Form>
  );
}
