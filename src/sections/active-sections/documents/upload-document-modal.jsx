
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetDocumentCategoriesQuery } from 'src/store/Reducer/document-categories-api';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import {
  useUploadDocumentMutation,
  useUpdateDocumentMutation,
} from 'src/store/Reducer/documents-api';
import { useUploadFileMutation } from 'src/store/Reducer/upload-api';

// ----------------------------------------------------------------------

const mapBranchOption = (item) => ({
  value: item._id || item.id,
  label: item.name || '',
});

// ----------------------------------------------------------------------

export const AUDIENCE_OPTIONS = [
  { value: 'staff', label: 'Staff' },
  { value: 'visitor', label: 'Visitor' },
];

export const CATEGORY_OPTIONS = [
  { value: 'health_safety', label: 'Health & Safety' },
  { value: 'fire_safety', label: 'Fire & Safety' },
  { value: 'contractor', label: 'Contractor' },
];

export const SCOPE_TYPE_OPTIONS = [
  { value: 'all_staff', label: 'All Staff' },
  { value: 'department', label: 'Department' },
  { value: 'role', label: 'Role' },
  { value: 'specific_staff', label: 'Specific Staff' },
  { value: 'personal', label: 'Personal' },
];

export const UploadDocumentSchema = zod.object({
  title: zod.string().min(1, { message: 'Document title is required!' }),
  category: zod.string().optional(),
  branchId: zod
    .object({ value: zod.string(), label: zod.string() })
    .nullable()
    .optional(),
  audiences: zod
    .array(zod.string())
    .min(1, { message: 'Select at least one audience!' }),
  requiresSignature: zod.boolean().default(true),
  file: zod.any().optional(),
});

// ----------------------------------------------------------------------

const mapCategoryOption = (item) => ({
  value: item.title || item.name || item._id || item.id,
  label: item.title || item.name || '',
});

// ----------------------------------------------------------------------

export default function UploadDocumentModal({
  open,
  onClose,
  currentDocument,
}) {
  const { organizationId } = useCurrentOrganization();
  const isEdit = Boolean(currentDocument);

  const [uploadFile, { isLoading: isUploadingFile }] = useUploadFileMutation();
  const [uploadDocumentApi, { isLoading: isPostingDocument }] = useUploadDocumentMutation();
  const [updateDocumentApi, { isLoading: isUpdatingDocument }] = useUpdateDocumentMutation();

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const defaultValues = useMemo(
    () => ({
      title: currentDocument?.title || currentDocument?.name || '',
      category: currentDocument?.category || '',
      branchId: currentDocument?.branchId
        ? {
            value: currentDocument.branchId,
            label: currentDocument.branchName || 'Site',
          }
        : null,
      audiences: Array.isArray(currentDocument?.audiences)
        ? currentDocument.audiences
        : ['staff'],
      requiresSignature: currentDocument?.requiresSignature ?? true,
      file: currentDocument?.file || null,
    }),
    [currentDocument]
  );

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(UploadDocumentSchema),
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
      if (currentDocument) {
        reset({
          title: currentDocument.title || currentDocument.name || '',
          category: currentDocument.category || '',
          branchId: currentDocument.branchId
            ? {
                value: currentDocument.branchId,
                label: currentDocument.branchName || 'Site',
              }
            : null,
          audiences: Array.isArray(currentDocument.audiences) && currentDocument.audiences.length > 0
            ? currentDocument.audiences
            : ['staff'],
          requiresSignature: currentDocument.requiresSignature ?? true,
          file: null,
        });

        setSelectedBranch(
          currentDocument.branchId
            ? {
                value: currentDocument.branchId,
                label: currentDocument.branchName || 'Site',
              }
            : null
        );

        setSelectedCategory(
          currentDocument.category
            ? {
                value: currentDocument.categoryId || currentDocument.category,
                label: currentDocument.categoryLabel || currentDocument.category,
              }
            : null
        );
      } else {
        reset({
          title: '',
          category: '',
          branchId: null,
          audiences: ['staff'],
          requiresSignature: true,
          file: null,
        });
        setSelectedBranch(null);
        setSelectedCategory(null);
      }
    }
  }, [open, currentDocument, reset]);

  const handleCategoryChange = useCallback(
    (option) => {
      setSelectedCategory(option);
      setValue('category', option?.value || option?.label || '', {
        shouldValidate: true,
      });
    },
    [setValue]
  );

  const handleBranchChange = useCallback(
    (option) => {
      setSelectedBranch(option);
      setValue('branchId', option || null, {
        shouldValidate: true,
      });
    },
    [setValue]
  );

  const handleDrop = (acceptedFiles) => {
    const newFile = acceptedFiles[0];

    if (newFile) {
      setValue('file', newFile, {
        shouldValidate: true,
      });

      if (!methods.getValues('title')) {
        const cleanName = newFile.name.replace(/\.[^/.]+$/, '');
        setValue('title', cleanName, {
          shouldValidate: true,
        });
      }
    }
  };

  const handleRemoveFile = () => {
    setValue('file', null, {
      shouldValidate: true,
    });
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit) {
        const docId = currentDocument?._id || currentDocument?.id;
        if (!docId) {
          toast.error('Document ID not found!');
          return;
        }

        const patchPayload = {
          title: data.title,
          audiences: data.audiences,
          requiresSignature: Boolean(data.requiresSignature),
        };

        await updateDocumentApi({
          documentId: docId,
          organizationId,
          ...patchPayload,
        }).unwrap();

        reset();
        setSelectedCategory(null);
        setSelectedBranch(null);
        onClose();

        toast.success('Document updated successfully!');
        return;
      }

      // Create Flow
      const fileToUpload = data.file;

      if (!fileToUpload) {
        toast.error('Please select a file to upload!');
        return;
      }

      // Step 1: Upload file to S3
      const uploadResult = await uploadFile(fileToUpload).unwrap();
      const s3Key = uploadResult?.key || uploadResult?.fileKey || uploadResult?.path || '';

      if (!s3Key) {
        throw new Error('Upload succeeded but no S3 key was returned.');
      }

      // Step 2: Post document payload with S3 file key
      const payload = {
        title: data.title,
        category: data.category,
        audiences: data.audiences,
        branchId: data.branchId?.value || null,
        requiresSignature: data.requiresSignature,
        file: {
          key: s3Key,
          originalName: fileToUpload.name,
          mimeType: fileToUpload.type || 'application/pdf',
          sizeBytes: fileToUpload.size || 0,
        },
      };

      await uploadDocumentApi({
        organizationId,
        ...payload,
      }).unwrap();

      reset();
      setSelectedCategory(null);
      setSelectedBranch(null);
      onClose();

      toast.success('Document uploaded successfully!');
    } catch (error) {
      console.error('Document save error:', error);
      toast.error(error?.data?.message || error?.message || 'Failed to save document!');
    }
  });

  const isBusy =
    isSubmitting ||
    isUploadingFile ||
    isPostingDocument ||
    isUpdatingDocument;

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
        <DialogTitle>{isEdit ? 'Edit Document' : 'Upload document'}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            {!isEdit && (
              <Field.Upload
                name="file"
                accept={{
                  'application/pdf': ['.pdf'],
                }}
                onDrop={handleDrop}
                onDelete={handleRemoveFile}
              />
            )}

            <Field.Text name="title" label="Document Title" placeholder="e.g. Health & Safety Policy" />

            {!isEdit && (
              <>
                <Controller
                  name="category"
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <InfiniteAutocomplete
                      value={selectedCategory}
                      onChange={(option) => {
                        handleCategoryChange(option);
                        field.onChange(option?.value || option?.label || '');
                      }}
                      useQuery={useGetDocumentCategoriesQuery}
                      queryArgs={{ organizationId, active: true }}
                      mapOption={mapCategoryOption}
                      label="Category"
                      placeholder="Search and select category..."
                      enabled={open && !!organizationId}
                      disabled={!organizationId}
                      textFieldProps={{
                        error: !!error,
                        helperText: error?.message,
                      }}
                    />
                  )}
                />

                <Controller
                  name="branchId"
                  control={methods.control}
                  render={({ field, fieldState: { error } }) => (
                    <InfiniteAutocomplete
                      value={selectedBranch}
                      onChange={(option) => {
                        handleBranchChange(option);
                        field.onChange(option || null);
                      }}
                      useQuery={useGetBranchesQuery}
                      queryArgs={{ organizationId }}
                      mapOption={mapBranchOption}
                      label="Site (Optional)"
                      placeholder="Search and select site..."
                      enabled={open && !!organizationId}
                      disabled={!organizationId}
                      textFieldProps={{
                        error: !!error,
                        helperText: error?.message,
                      }}
                    />
                  )}
                />
              </>
            )}

            <Field.Autocomplete
              name="audiences"
              label="Audiences"
              placeholder="Select audiences"
              multiple
              disableCloseOnSelect
              options={AUDIENCE_OPTIONS.map((opt) => opt.value)}
              getOptionLabel={(option) =>
                AUDIENCE_OPTIONS.find((opt) => opt.value === option)?.label || option
              }
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => {
                  const label =
                    AUDIENCE_OPTIONS.find((opt) => opt.value === option)?.label || option;
                  return (
                    <Chip
                      {...getTagProps({ index })}
                      key={option}
                      label={label}
                      size="small"
                      variant="soft"
                    />
                  );
                })
              }
            />

            <Field.Switch name="requiresSignature" label="Requires Signature" />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            disabled={isBusy}
            onClick={() => {
              reset();
              setSelectedCategory(null);
              setSelectedBranch(null);
              onClose();
            }}
          >
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            loading={isBusy}
          >
            {isEdit ? 'Save Changes' : 'Upload'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}