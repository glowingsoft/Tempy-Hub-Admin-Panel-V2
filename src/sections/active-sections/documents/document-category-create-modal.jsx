// document-category-create-modal.jsx
import { useEffect, useMemo } from 'react';
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
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';

import {
  useCreateDocumentCategoryMutation,
  useUpdateDocumentCategoryMutation,
} from 'src/store/Reducer/document-categories-api';

// ----------------------------------------------------------------------

const DocumentCategorySchema = zod.object({
  title: zod.string().min(1, 'Category name is required'),
  active: zod.boolean().default(true),
});

// ----------------------------------------------------------------------

export function DocumentCategoryCreateModal({
  open,
  onClose,
  organizationId,
  currentCategory,
  onSuccess,
}) {
  const isEdit = Boolean(currentCategory);

  const [createCategory, { isLoading: isCreating }] = useCreateDocumentCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateDocumentCategoryMutation();

  const defaultValues = useMemo(
    () => ({
      title: currentCategory?.title || currentCategory?.name || '',
      active: currentCategory?.active ?? true,
    }),
    [currentCategory]
  );

  const methods = useForm({
    resolver: zodResolver(DocumentCategorySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit) {
        const categoryId = currentCategory._id || currentCategory.id;
        await updateCategory({
          organizationId,
          categoryId,
          title: data.title,
          active: data.active,
        }).unwrap();
        toast.success('Category updated successfully');
      } else {
        await createCategory({
          organizationId,
          title: data.title,
          active: data.active,
        }).unwrap();
        toast.success('Category created successfully');
      }

      if (onSuccess) {
        onSuccess(data, isEdit ? (currentCategory?._id || currentCategory?.id) : undefined);
      }

      reset();
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Something went wrong');
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const isLoading = isSubmitting || isCreating || isUpdating;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{isEdit ? 'Edit Category' : 'Create Category'}</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Field.Text name="title" label="Category Name" placeholder="e.g. Training materials" />

            <Field.Switch name="active" label="Active" />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isLoading}>
            {isEdit ? 'Update' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}