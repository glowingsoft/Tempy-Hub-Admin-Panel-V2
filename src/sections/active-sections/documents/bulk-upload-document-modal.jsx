// bulk-upload-document-modal.jsx
//
// Client feedback: management needs the option to upload one document OR
// several at once. This is that "several at once" option — same mock-only
// behaviour as the existing single Upload document modal (no real upload
// wired up yet), just a multi-file drop plus one set of Folder/Category/Scope
// fields applied to every file in the batch, rather than one row per file.

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { FOLDER_OPTIONS } from './mocks/data';
import { CATEGORY_OPTIONS, SCOPE_TYPE_OPTIONS } from './upload-document-modal';

// ----------------------------------------------------------------------

const BulkUploadDocumentSchema = zod.object({
  files: zod.array(zod.custom((val) => val instanceof File)).min(1, {
    message: 'Select at least one file!',
  }),
  folder: zod.string().optional(),
  category: zod.string().min(1, { message: 'Category is required!' }),
  scopeType: zod.string().min(1, { message: 'Scope type is required!' }),
});

const defaultValues = {
  files: [],
  folder: '',
  category: '',
  scopeType: '',
};

// ----------------------------------------------------------------------

export default function BulkUploadDocumentModal({ open, onClose }) {
  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(BulkUploadDocumentSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const files = watch('files');

  const handleDrop = (acceptedFiles) => {
    setValue('files', [...files, ...acceptedFiles], { shouldValidate: true });
  };

  const handleRemoveFile = (file) => {
    setValue('files', files.filter((item) => item !== file), { shouldValidate: true });
  };

  const handleRemoveAll = () => {
    setValue('files', [], { shouldValidate: true });
  };

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    // TODO: replace with the real bulk-upload mutation once available.
    const promise = new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      await promise;

      console.info('BULK DOCUMENT UPLOAD', data);

      toast.success(`${data.files.length} document${data.files.length > 1 ? 's' : ''} uploaded!`);
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error('Upload failed!');
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Bulk upload documents</DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              The folder, category, and scope below apply to every file in this batch.
            </Typography>

            <Field.Upload
              multiple
              name="files"
              onDrop={handleDrop}
              onRemove={handleRemoveFile}
              onRemoveAll={handleRemoveAll}
            />

            <Field.Select name="folder" label="Folder (optional)">
              <MenuItem value="">None</MenuItem>
              {FOLDER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="category" label="Category">
              {CATEGORY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select name="scopeType" label="Scope Type">
              {SCOPE_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Upload all
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
