import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Grid,
  MenuItem,
  Skeleton,
  Stack,
  Typography
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import {
  Field,
  Form
} from 'src/components/hook-form';
// import { toast } from 'src/components/snackbar';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { AttendanceSection } from '../attendance-section';
import { employees } from '../mocks/data';
import { UpcomingList } from '../invitation-list';
// import { paths } from 'src/routes/paths';

// NOTE: adjust these imports/hooks to match your real API slices.
// import { useGetAllEmployeeQuery } from 'src/store/Reducer/employee-api';
// import { useUploadNewFileMutation } from 'src/store/Reducer/file';
// import {
//   useAddNewInvitationMutation,
//   useUpdateInvitationMutation,
// } from 'src/store/Reducer/invitation-api';

// ----------------------------------------------------------------------
// NOTE: adjust BADGE_TYPE_OPTIONS to match your real backend enum
const BADGE_TYPE_OPTIONS = [
  { value: 'visitor', label: 'Visitor' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'vip', label: 'VIP' },
  { value: 'interview', label: 'Interview' },
  { value: 'vendor', label: 'Vendor' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InvitationSchema = zod
  .object({
    visitorName: zod.string().min(1, 'Visitor name is required'),
    visitorEmail: zod.string().min(1, 'Visitor email is required').email('Enter a valid email'),
    hostId: zod.string().min(1, 'Host is required'),
    badgeType: zod.string().min(1, 'Badge type is required'),
    arrivalTime: zod.string().min(1, 'Arrival time is required'),
    visitingUntil: zod.string().min(1, 'Visiting until date is required'),
    instructions: zod.string().optional(),
    additionalRecipients: zod
      .array(zod.string().email('One or more recipient emails are invalid'))
      .optional(),
    supportingDocument: zod.any().optional(),
    expressCheckIn: zod.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.arrivalTime &&
      data.visitingUntil &&
      new Date(data.visitingUntil) <= new Date(data.arrivalTime)
    ) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Visiting until must be after arrival time',
        path: ['visitingUntil'],
      });
    }
  });

// ----------------------------------------------------------------------

function InvitationAddEditView({ currentInvitation }) {
  const router = useRouter();

  const isEdit = !!currentInvitation;

  const defaultValues = useMemo(
    () => ({
      visitorName: currentInvitation?.visitorName || '',
      visitorEmail: currentInvitation?.visitorEmail || '',
      hostId: currentInvitation?.hostId || '',
      badgeType: currentInvitation?.badgeType || '',
      arrivalTime: currentInvitation?.arrivalTime || '',
      visitingUntil: currentInvitation?.visitingUntil || '',
      instructions: currentInvitation?.instructions || '',
      additionalRecipients: currentInvitation?.additionalRecipients || [],
      supportingDocument: currentInvitation?.supportingDocument || null,
      expressCheckIn: currentInvitation?.expressCheckIn || false,
    }),
    [currentInvitation]
  );

  const methods = useForm({
    resolver: zodResolver(InvitationSchema),
    defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  // const [addNewInvitation] = useAddNewInvitationMutation();
  // const [updateInvitation] = useUpdateInvitationMutation();
  // const [uploadNewFile] = useUploadNewFileMutation();

  // const { data: employees, isLoading: employeesLoading } = useGetAllEmployeeQuery({
  //   page: 0,
  //   limit: 1000,
  //   status: 'active',
  // });
  const employeesLoading = false;

  useEffect(() => {
    methods.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  const handleDropDocument = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setValue('supportingDocument', Object.assign(file, { preview: URL.createObjectURL(file) }), {
        shouldValidate: true,
      });
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    // let document = '';

    // if (data.supportingDocument && typeof data.supportingDocument === 'object') {
    //   const response = await uploadNewFile({
    //     fileData: data.supportingDocument,
    //     type: 'invitationDocument',
    //   });
    //   if (!response?.error) {
    //     document = response.data?.file;
    //   }
    // }

    // const payload = {
    //   visitorName: data.visitorName,
    //   visitorEmail: data.visitorEmail,
    //   hostId: data.hostId,
    //   badgeType: data.badgeType,
    //   arrivalTime: new Date(data.arrivalTime).toISOString(),
    //   visitingUntil: new Date(data.visitingUntil).toISOString(),
    //   instructions: data.instructions,
    //   additionalRecipients: data.additionalRecipients,
    //   ...(document && { supportingDocument: document }),
    //   expressCheckIn: data.expressCheckIn,
    // };

    // try {
    //   if (isEdit) {
    //     const response = await updateInvitation({ id: currentInvitation._id, data: payload });
    //     if (!response?.error) {
    //       toast.success('Invitation updated successfully!');
    //       router.push(paths.siteManager.content.invitation.root);
    //     }
    //   } else {
    //     const response = await addNewInvitation(payload);
    //     if (!response?.error) {
    //       toast.success('Invitation sent successfully!');
    //       router.push(paths.siteManager.content.invitation.root);
    //     }
    //   }
    // } catch (error) {
    //   toast.error('Something went wrong!');
    // }
  });

  const renderForm = (
    <Form methods={methods} onSubmit={onSubmit}>
      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2.5 }}>
          New invitation
        </Typography>

        <Stack spacing={2.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, gap: 2.5 }}>

            <Field.Text name="visitorName" label="Visitor name" placeholder="Full name" />

            <Field.Text
              name="visitorEmail"
              label="Visitor email"
              placeholder="email@address.com"
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, gap: 2.5 }}>
            {employeesLoading ? (
              <Skeleton variant="rounded" height={56} />
            ) : (
              <Field.Select name="hostId" label="Host (employee)">
                {employees?.data?.map((employee) => (
                  <MenuItem key={employee.employeeId} value={employee.employeeId}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Field.Select>
            )}

            <Field.Select name="badgeType" label="Badge type">
              {BADGE_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, gap: 2.5 }}>

            <Field.DatePicker name="arrivalTime" label="Arrival time" />

            <Field.DatePicker name="visitingUntil" label="Visiting until" />

          </Box>

          <Field.Text
            name="instructions"
            label="Instructions"
            placeholder="Add instructions for the visitor..."
            multiline
            rows={4}
          />

          <Field.Autocomplete
            name="additionalRecipients"
            label="Additional recipients"
            placeholder="Add email..."
            multiple
            freeSolo
            options={[]}
            getOptionLabel={(option) => option}
            renderOption={undefined}
            isOptionEqualToValue={(option, value) => option === value}
          />

          <Stack spacing={1}>
            <Typography variant="subtitle2">Supporting document (PDF, max 5 MB)</Typography>
            <Field.Upload
              name="supportingDocument"
              accept={{ 'application/pdf': ['.pdf'] }}
              maxSize={5242880}
              onDrop={handleDropDocument}
              onDelete={() => setValue('supportingDocument', null, { shouldValidate: true })}
            />
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body2">Enable express check-in (skip approval step)</Typography>
            <Field.Switch name="expressCheckIn" label="" />
          </Stack>
        </Stack>
      </Card>

      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
        <LoadingButton variant="outlined" onClick={() => router.back()}>
          Cancel
        </LoadingButton>
        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {isEdit ? 'Update invitation' : 'Send invitation'}
        </LoadingButton>
      </Stack>
    </Form>
  );

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="New Invitation"
        links={[
          { name: 'Dashboard', href: paths.siteManager.root },
          { name: "Invitations List", href: paths.siteManager.invitaions.root },
          { name: 'New Invitation' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Grid container spacing={2} >
        <Grid item xs={12} md={8}>
          {renderForm}
        </Grid>
        <Grid item xs={12} md={4} >
          <Stack spacing={2}>
            <AttendanceSection />
            {/* <UpcomingList title="Upcoming" /> */}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default InvitationAddEditView;


