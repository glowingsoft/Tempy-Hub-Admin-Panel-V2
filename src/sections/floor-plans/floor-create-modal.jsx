import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Field, Form } from 'src/components/hook-form';
import { Upload } from 'src/components/upload';
import { toast } from 'src/components/snackbar';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useCreateFloorMutation } from 'src/store/Reducer/floor-plans-api';
import { useUploadFileMutation } from 'src/store/Reducer/upload-api';
import { isAllowedFloorPlanImage } from 'src/sections/floor-plans/utils';

// ----------------------------------------------------------------------

const mapBranchOption = (branch) => ({
  value: branch._id,
  label: branch.name,
});

const FloorSchema = zod.object({
  name: zod.string().min(1, { message: 'Floor name is required!' }),
  branchId: zod
    .object({ value: zod.string(), label: zod.string() })
    .nullable()
    .refine((option) => Boolean(option?.value), { message: 'Site is required!' }),
});

// ----------------------------------------------------------------------

// A floor requires a name, site, and floor-plan image (PNG/JPG/WebP). The image
// is uploaded to S3 first, then its object key is stored with the floor record.
export function FloorCreateModal({ open, onClose, siteOptions, defaultBranchId, onSuccess }) {
  // Resolve organizationId the same way every other modal does —
  // from the authenticated user context, not as a prop.
  const { organizationId } = useCurrentOrganization();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = useMemo(
    () => ({
      name: '',
      branchId:
        siteOptions?.find((option) => option.value === defaultBranchId) ||
        (defaultBranchId
          ? { value: defaultBranchId, label: defaultBranchId }
          : siteOptions?.[0] || null),
    }),
    [defaultBranchId, siteOptions]
  );

  const methods = useForm({ resolver: zodResolver(FloorSchema), defaultValues });

  const [createFloor] = useCreateFloorMutation();
  const [uploadFile] = useUploadFileMutation();

  // Reset form + file whenever the modal opens
  useEffect(() => {
    if (open) {
      methods.reset(defaultValues);
      setUploadedFile(null);
      setFileError('');
    }
  }, [open, defaultValues, methods]);

  const handleClose = useCallback(() => {
    onClose();
    methods.reset(defaultValues);
    setUploadedFile(null);
    setFileError('');
  }, [onClose, defaultValues, methods]);

  const handleDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles?.[0];
    if (!file) return;

    if (!(await isAllowedFloorPlanImage(file))) {
      setUploadedFile(null);
      setFileError('Choose a valid JPG, PNG, or WebP image. PDF files are not supported.');
      toast.error('Only JPG, PNG, or WebP image files are allowed for a new floor.');
      return;
    }

    setUploadedFile(Object.assign(file, { preview: URL.createObjectURL(file) }));
    setFileError('');
  }, []);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setFileError('A floor plan image is required.');
  }, []);

  const onSubmit = methods.handleSubmit(async (data) => {
    // Validate file is present (required)
    if (!uploadedFile) {
      setFileError('A floor plan image is required.');
      return;
    }

    if (!(await isAllowedFloorPlanImage(uploadedFile))) {
      setFileError('Choose a valid JPG, PNG, or WebP image. PDF files are not supported.');
      toast.error('Only JPG, PNG, or WebP image files are allowed for a new floor.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Step 1: Upload the required floor-plan image.
      const uploadResult = await uploadFile(uploadedFile).unwrap();
      const imageUrl = uploadResult.key ?? '';

      // Step 3: Create floor plan record
      const result = await createFloor({
        organizationId,
        name: data.name,
        branchId: data.branchId.value,
        imageUrl,
        pdfUrl: '',
      }).unwrap();

      onSuccess?.(result ?? data);
      toast.success('Floor added successfully!');
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 0 }}>Add Floor</DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 3, gap: 2.5, display: 'flex', flexDirection: 'column' }}>
            <Field.InfiniteAutocomplete
              name="branchId"
              label="Site"
              placeholder="Search site..."
              useQuery={useGetBranchesQuery}
              queryArgs={{ organizationId }}
              mapOption={mapBranchOption}
              enabled={open && Boolean(organizationId)}
            />

            {/* Floor name */}
            <Field.Text name="name" label="Floor / wing label" placeholder="e.g. Second Floor" />

            {/* Floor plan image upload — required */}
            <Stack spacing={1}>
              <Typography variant="subtitle2">
                Floor Plan File <Typography component="span" color="error.main" variant="subtitle2">*</Typography>
              </Typography>
              <Upload
                value={uploadedFile}
                error={Boolean(fileError)}
                accept={{
                  'image/jpeg': ['.jpeg', '.jpg'],
                  'image/png': ['.png'],
                  'image/webp': ['.webp'],
                }}
                onDrop={handleDrop}
                onDropRejected={() => {
                  setUploadedFile(null);
                  setFileError('Choose a JPG, PNG, or WebP image. PDF files are not supported.');
                  toast.error('Only JPG, PNG, or WebP image files are allowed for a new floor.');
                }}
                onDelete={handleRemoveFile}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, display: 'block', textAlign: 'center', color: fileError ? 'error.main' : 'text.disabled' }}
                  >
                    {fileError
                      ? fileError
                      : 'Choose an image: *.jpeg, *.jpg, *.png, or *.webp'}
                  </Typography>
                }
              />
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Add Floor
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
