// components/upload-floor-plan-dialog.jsx

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Field, Form } from 'src/components/hook-form';
import { convertPdfToImage } from 'src/utils/pdf-to-image';

// ----------------------------------------------------------------------

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const UploadFloorPlanSchema = zod.object({
  floorPlan: zod
    .any()
    .refine((file) => file instanceof File, {
      message: 'Please select a floor plan file (PDF, PNG, or JPG).',
    })
    .refine(
      (file) => {
        if (!file) return false;
        const name = file.name?.toLowerCase() || '';
        return (
          file.type === 'application/pdf' ||
          file.type?.startsWith('image/') ||
          name.endsWith('.pdf') ||
          name.endsWith('.png') ||
          name.endsWith('.jpg') ||
          name.endsWith('.jpeg')
        );
      },
      {
        message: 'Only PDF or image files (PNG, JPG) are allowed.',
      }
    )
    .refine((file) => file?.size <= MAX_FILE_SIZE, {
      message: 'The floor plan must be smaller than 10 MB.',
    }),
});

// ----------------------------------------------------------------------

export function UploadFloorPlanDialog({
  open,
  onClose,
  onUpload,
  title = 'Upload Floor Plan',
  description = 'Upload a PDF or image floor plan for this site. PDFs are automatically converted into a clean image so you can place room pins directly without PDF viewer headers or zoom controls.',
}) {
  const methods = useForm({
    resolver: zodResolver(UploadFloorPlanSchema),
    defaultValues: {
      floorPlan: null,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const handleClose = () => {
    if (isSubmitting) return;

    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const file = data.floorPlan;
      let convertedResult = null;
      try {
        convertedResult = await convertPdfToImage(file);
      } catch (err) {
        console.warn('PDF to image conversion fallback:', err);
      }

      if (onUpload) {
        await onUpload(file, convertedResult);
      }

      reset();
      onClose();
    } catch (error) {
      console.error('Floor plan upload failed:', error);
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>

            <Field.Upload
              name="floorPlan"
              accept={{
                'application/pdf': ['.pdf'],
                'image/*': ['.png', '.jpg', '.jpeg'],
              }}
              maxSize={MAX_FILE_SIZE}
              helperText="PDF or image (PNG, JPG) • Automatically converted to clean map image (Max 10 MB)"
              sx={{
                minHeight: 180,
                borderRadius: 2,
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button type="submit" variant="contained" loading={isSubmitting} loadingPosition="start">
            Upload Floor Plan
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
