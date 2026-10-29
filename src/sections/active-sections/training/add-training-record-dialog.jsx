import { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useUploadFileMutation } from 'src/store/Reducer/upload-api';
import { useCreateAssignmentRecordMutation } from 'src/store/Reducer/assignments-api';

// ----------------------------------------------------------------------

export const AddRecordSchema = zod.object({
  completedAt: zod.string().min(1, { message: 'Completion date is required!' }),
  notes: zod.string().optional(),
  file: zod.any().optional(),
});

// ----------------------------------------------------------------------

export function AddTrainingRecordDialog({ open, onClose, assignment }) {
  const { organizationId: currentOrgId } = useCurrentOrganization();
  const assignmentId = assignment?.assignmentId || assignment?._id;
  const organizationId = assignment?.organizationId || currentOrgId;

  const [uploadFile, { isLoading: isUploadingFile }] = useUploadFileMutation();
  const [createAssignmentRecord, { isLoading: isPostingRecord }] =
    useCreateAssignmentRecordMutation();

  const defaultValues = useMemo(
    () => ({
      completedAt: dayjs().format('YYYY-MM-DD'),
      notes: '',
      file: null,
    }),
    []
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(AddRecordSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      reset({
        completedAt: dayjs().format('YYYY-MM-DD'),
        notes: '',
        file: null,
      });
    }
  }, [open, reset]);

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const newFile = acceptedFiles[0];
      if (newFile) {
        setValue('file', newFile, {
          shouldValidate: true,
        });
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('file', null, {
      shouldValidate: true,
    });
  }, [setValue]);

  const onSubmit = handleSubmit(async (data) => {
    if (!assignmentId) {
      toast.error('Assignment ID not found!');
      return;
    }

    try {
      let documents = [];

      // Step 1: Upload PDF to S3 if a file was selected
      if (data.file) {
        const uploadResult = await uploadFile(data.file).unwrap();
        const s3Key = uploadResult?.key || uploadResult?.fileKey || uploadResult?.path || '';

        if (!s3Key) {
          throw new Error('Upload succeeded but no S3 key was returned.');
        }

        documents = [
          {
            key: s3Key,
            originalName: data.file.name,
            mimeType: data.file.type || 'application/pdf',
            sizeBytes: data.file.size,
          },
        ];
      }

      // Step 2: Post record
      const payload = {
        completedAt: data.completedAt,
        notes: data.notes?.trim() || undefined,
        documents,
      };

      await createAssignmentRecord({
        assignmentId,
        organizationId,
        data: payload,
      }).unwrap();

      toast.success('Training record added successfully!');
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to add training record:', error);
      toast.error(
        error?.data?.message || error?.message || 'Failed to add training record!'
      );
    }
  });

  const isBusy = isSubmitting || isUploadingFile || isPostingRecord;

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={isBusy ? undefined : onClose}
      PaperProps={{
        sx: {
          maxWidth: 580,
        },
      }}
    >
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>
          Add Training Record
          {assignment?.staff?.name && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
              {assignment.staff.name}
              {assignment.requirement?.name ? ` — ${assignment.requirement.name}` : ''}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Field.Upload
              name="file"
              accept={{
                'application/pdf': ['.pdf'],
              }}
              onDrop={handleDrop}
              onDelete={handleRemoveFile}
              helperText="Upload certificate or completion evidence in PDF format"
            />

            <Field.Text
              name="completedAt"
              type="date"
              label="Completion Date"
              InputLabelProps={{ shrink: true }}
            />

            <Field.Text
              name="notes"
              label="Notes"
              multiline
              rows={3}
              placeholder="Signed off / comments..."
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            disabled={isBusy}
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isBusy}>
            Add Record
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

AddTrainingRecordDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  assignment: PropTypes.object,
};