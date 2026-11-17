// components/upload-floor-plan-dialog.jsx

import { useCallback, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { isAllowedFloorPlanFile, isPdfFile } from 'src/sections/floor-plans/utils';
import { convertPdfToImage } from 'src/utils/pdf-to-image';

// ----------------------------------------------------------------------

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const UploadFloorPlanSchema = zod.object({
  floorPlan: zod
    .any()
    .refine((file) => file instanceof File, {
      message: 'Please select a floor plan image or PDF.',
    })
    .refine(isAllowedFloorPlanFile, {
      message: 'Only JPG, PNG, WebP image files or PDF documents are allowed.',
    })
    .refine((file) => file?.size <= MAX_FILE_SIZE, {
      message: 'The floor plan must be smaller than 15 MB.',
    }),
});

// ----------------------------------------------------------------------

export function UploadFloorPlanDialog({
  open,
  onClose,
  onUpload,
  title = 'Upload Floor Plan',
  description = 'Upload an image or PDF floor plan for this site.',
}) {
  const [isConverting, setIsConverting] = useState(false);

  const methods = useForm({
    resolver: zodResolver(UploadFloorPlanSchema),
    defaultValues: {
      floorPlan: null,
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const currentFile = watch('floorPlan');

  const handleClose = () => {
    if (isSubmitting || isConverting) return;

    reset();
    setIsConverting(false);
    onClose();
  };

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles?.[0];
      if (!file) return;

      if (!(await isAllowedFloorPlanFile(file))) {
        setValue('floorPlan', null);
        toast.error('Only JPG, PNG, WebP images or PDF files are allowed.');
        return;
      }

      if (isPdfFile(file)) {
        setIsConverting(true);
        try {
          const result = await convertPdfToImage(file);
          if (!result?.blob) throw new Error('PDF conversion failed');

          const convertedFile = new File(
            [result.blob],
            file.name.replace(/\.[^/.]+$/, '') + '.png',
            { type: 'image/png' }
          );
          convertedFile.preview = result.imageUrl || result.dataUrl;

          setValue('floorPlan', convertedFile, { shouldValidate: true });
        } catch (err) {
          console.error('PDF conversion error:', err);
          setValue('floorPlan', null);
          toast.error('Failed to convert PDF to image.');
        } finally {
          setIsConverting(false);
        }
      } else {
        setValue(
          'floorPlan',
          Object.assign(file, { preview: URL.createObjectURL(file) }),
          { shouldValidate: true }
        );
      }
    },
    [setValue]
  );

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (onUpload) {
        await onUpload(data.floorPlan);
      }

      reset();
      onClose();
    } catch (error) {
      console.error('Floor plan upload failed:', error);
      toast.error(error?.message || 'Floor plan upload failed.');
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
              disabled={isConverting}
              accept={{
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/png': ['.png'],
                'image/webp': ['.webp'],
                'application/pdf': ['.pdf'],
              }}
              maxSize={MAX_FILE_SIZE}
              onDrop={handleDrop}
              onDelete={() => {
                setValue('floorPlan', null);
              }}
              helperText="JPG, PNG, WebP image or PDF document (Max 15 MB)"
              sx={{
                minHeight: 180,
                borderRadius: 2,
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={handleClose} disabled={isSubmitting || isConverting}>
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isSubmitting}
            disabled={isConverting || !currentFile}
          >
            Upload Floor Plan
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}