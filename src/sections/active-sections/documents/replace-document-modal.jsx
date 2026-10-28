import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useReplaceDocumentVersionMutation } from 'src/store/Reducer/documents-api';
import { useUploadFileMutation } from 'src/store/Reducer/upload-api';

// ----------------------------------------------------------------------

export const ReplaceDocumentSchema = zod.object({
  file: zod.custom((val) => val !== null && val !== undefined, {
    message: 'PDF file is required!',
  }),
});

// ----------------------------------------------------------------------

export default function ReplaceDocumentModal({ open, onClose, currentDocument }) {
  const { organizationId } = useCurrentOrganization();

  const [uploadFile, { isLoading: isUploadingFile }] = useUploadFileMutation();
  const [replaceDocumentVersion, { isLoading: isReplacing }] =
    useReplaceDocumentVersionMutation();

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(ReplaceDocumentSchema),
    defaultValues: {
      file: null,
    },
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleDrop = (acceptedFiles) => {
    const newFile = acceptedFiles[0];
    if (newFile) {
      setValue('file', newFile, {
        shouldValidate: true,
      });
    }
  };

  const handleRemoveFile = () => {
    setValue('file', null, {
      shouldValidate: true,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const docId = currentDocument?._id || currentDocument?.id;
      if (!docId) {
        toast.error('Document ID not found!');
        return;
      }

      const fileToUpload = data.file;
      if (!fileToUpload) {
        toast.error('Please select a PDF file to upload!');
        return;
      }

      // 1. Upload file to S3
      const uploadResult = await uploadFile(fileToUpload).unwrap();
      const s3Key =
        uploadResult?.key || uploadResult?.fileKey || uploadResult?.path || '';

      if (!s3Key) {
        throw new Error('Upload succeeded but no S3 key was returned.');
      }

      // Calculate size in bytes precisely
      const sizeBytes = Number(fileToUpload.size) || 0;

      // 2. Post new version using uploaded file's original name
      const payload = {
        file: {
          key: s3Key,
          originalName: fileToUpload.name,
          mimeType: fileToUpload.type || 'application/pdf',
          sizeBytes,
        },
      };

      await replaceDocumentVersion({
        documentId: docId,
        organizationId,
        ...payload,
      }).unwrap();

      handleClose();
      toast.success('Document replaced successfully!');
    } catch (error) {
      console.error('Replace document error:', error);
      toast.error(
        error?.data?.message || error?.message || 'Failed to replace document!'
      );
    }
  });

  const isBusy = isSubmitting || isUploadingFile || isReplacing;
  const docTitle = currentDocument?.name || currentDocument?.title || 'Document';

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={isBusy ? undefined : handleClose}
      PaperProps={{
        sx: {
          maxWidth: 540,
        },
      }}
    >
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Replace document</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Upload a new PDF file to create a new version of{' '}
              <strong>{docTitle}</strong>.
            </Typography>

            <Field.Upload
              name="file"
              accept={{
                'application/pdf': ['.pdf'],
              }}
              onDrop={handleDrop}
              onDelete={handleRemoveFile}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" disabled={isBusy} onClick={handleClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isBusy}>
            Replace
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}