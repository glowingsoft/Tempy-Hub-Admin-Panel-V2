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
import { isAllowedFloorPlanImage } from 'src/sections/floor-plans/utils';

// ----------------------------------------------------------------------

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const UploadFloorPlanSchema = zod.object({
  floorPlan: zod
    .any()
    .refine((file) => file instanceof File, {
      message: 'Please select a floor plan image.',
    })
    .refine(isAllowedFloorPlanImage, {
      message: 'Only JPG, PNG, or WebP image files are allowed.',
    })
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
  description = 'Upload an image floor plan for this site.',
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
      if (onUpload) {
        await onUpload(data.floorPlan);
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
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/png': ['.png'],
                'image/webp': ['.webp'],
              }}
              maxSize={MAX_FILE_SIZE}
              helperText="JPG, PNG, or WebP image (Max 10 MB)"
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
