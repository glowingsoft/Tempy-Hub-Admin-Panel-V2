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
import { isAllowedFloorPlanFile, isPdfFile } from 'src/sections/floor-plans/utils';
import { convertPdfToImage } from 'src/utils/pdf-to-image';

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

// A floor requires a name and site. An optional floor-plan image (PNG/JPG/WebP)
// is uploaded to S3 first, then its object key is stored with the floor record.
export function FloorCreateModal({ open, onClose, siteOptions, defaultBranchId, onSuccess, ownerDashboard = true }) {
  // Resolve organizationId the same way every other modal does —
  // from the authenticated user context, not as a prop.
  const { organizationId } = useCurrentOrganization();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [originalPdfFile, setOriginalPdfFile] = useState(null);
  const [isConvertingPdf, setIsConvertingPdf] = useState(false);
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = useMemo(
    () => ({
      name: '',
      branchId:
        siteOptions?.find((option) => option.value === defaultBranchId) ||
        (defaultBranchId
          ? { value: defaultBranchId, label: siteOptions?.[0]?.label || defaultBranchId }
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
      setOriginalPdfFile(null);
      setIsConvertingPdf(false);
      setFileError('');
    }
  }, [open, defaultValues, methods]);

  const handleClose = useCallback(() => {
    onClose();
    methods.reset(defaultValues);
    setUploadedFile(null);
    setOriginalPdfFile(null);
    setIsConvertingPdf(false);
    setFileError('');
  }, [onClose, defaultValues, methods]);

  const handleDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles?.[0];
    if (!file) return;

    if (!(await isAllowedFloorPlanFile(file))) {
      setUploadedFile(null);
      setOriginalPdfFile(null);
      setFileError('Choose a valid JPG, PNG, or WebP image, or a PDF document.');
      toast.error('Only JPG, PNG, WebP image files or PDF documents are allowed.');
      return;
    }

    if (isPdfFile(file)) {
      setIsConvertingPdf(true);
      setFileError('');
      try {
        const result = await convertPdfToImage(file);
        if (!result?.blob) {
          throw new Error('Failed to convert PDF to image.');
        }

        const convertedFile = new File(
          [result.blob],
          file.name.replace(/\.[^/.]+$/, '') + '.png',
          { type: 'image/png' }
        );
        convertedFile.preview = result.imageUrl || result.dataUrl;

        setUploadedFile(convertedFile);
        setOriginalPdfFile(file);
        setFileError('');
      } catch (err) {
        console.error('PDF conversion error:', err);
        setUploadedFile(null);
        setOriginalPdfFile(null);
        setFileError('Unable to convert this PDF file. Please ensure it is a valid document.');
      } finally {
        setIsConvertingPdf(false);
      }
      return;
    }

    setOriginalPdfFile(null);
    setUploadedFile(Object.assign(file, { preview: URL.createObjectURL(file) }));
    setFileError('');
  }, []);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setOriginalPdfFile(null);
    setFileError('');
  }, []);

  const onSubmit = methods.handleSubmit(async (data) => {
    if (uploadedFile && !(await isAllowedFloorPlanFile(uploadedFile))) {
      setFileError('Choose a valid JPG, PNG, or WebP image, or a PDF document.');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl;

      if (uploadedFile) {
        const uploadResult = await uploadFile(uploadedFile).unwrap();
        imageUrl = uploadResult.key ?? '';
      }

      // Step 3: Create floor plan record
      const result = await createFloor({
        organizationId,
        name: data.name,
        branchId: data.branchId.value,
        ...(imageUrl ? { imageUrl } : {}),
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
              enabled={open && Boolean(organizationId) && ownerDashboard}
              disabled={!ownerDashboard}
            />

            {/* Floor name */}
            <Field.Text name="name" label="Floor / wing label" placeholder="e.g. Second Floor" />

            {/* Optional floor plan image or PDF upload */}
            <Stack spacing={1}>
              <Typography variant="subtitle2">
                Floor Plan File
              </Typography>
              <Upload
                value={uploadedFile}
                error={Boolean(fileError)}
                disabled={isConvertingPdf}
                accept={{
                  'image/jpeg': ['.jpeg', '.jpg'],
                  'image/png': ['.png'],
                  'image/webp': ['.webp'],
                  'application/pdf': ['.pdf'],
                }}
                onDrop={handleDrop}
                onDropRejected={() => {
                  setUploadedFile(null);
                  setOriginalPdfFile(null);
                  setFileError('Choose a JPG, PNG, or WebP image, or a PDF file.');
                }}
                onDelete={handleRemoveFile}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.5, display: 'block', textAlign: 'center', color: fileError ? 'error.main' : 'text.disabled' }}
                  >
                    {fileError
                      ? fileError
                      : 'Choose an image (*.jpeg, *.jpg, *.png, *.webp) or PDF (*.pdf)'}
                  </Typography>
                }
              />
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose} disabled={isSubmitting || isConvertingPdf}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting} disabled={isConvertingPdf}>
            Add Floor
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}