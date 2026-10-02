import { LoadingButton } from '@mui/lab';
import { Button, Stack } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';

import DragDropList from './drag-drop-list';
import CategoryDragCard from './category-drag-card';
import CategoryModal from './category-modal';
import { mockCategories } from './mock-categories';

const CategoryList = () => {
  const editModal = useBoolean();

  const [currentCategory, setCurrentCategory] = useState(null);

  const deleteModal = useBoolean();

  const [categories, setCategories] = useState(mockCategories);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = false; // no API call in this UI-only version

  const handleAdd = () => {
    setCurrentCategory(null);
    editModal.onTrue();
  };

  const handleEdit = (row) => {
    setCurrentCategory(row);
    editModal.onTrue();
  };

  const handleDelete = (row) => {
    setCurrentCategory(row);
    deleteModal.onTrue();
  };

  const handleUpdateOrder = ({ item, sourceIndex, destinationIndex }) => {
    setCategories((prev) => {
      const next = Array.from(prev);
      next.splice(sourceIndex, 1);
      next.splice(destinationIndex, 0, item);
      return next.map((cat, index) => ({ ...cat, order: index + 1 }));
    });

    enqueueSnackbar('Category order updated', { variant: 'success' });
  };

  const handleSubmit = (values) => {
    setIsSubmitting(true);

    setTimeout(() => {
      setCategories((prev) => {
        if (values._id) {
          return prev.map((cat) => (cat._id === values._id ? { ...cat, ...values } : cat));
        }
        return [...prev, { ...values, _id: `cat-${Date.now()}`, order: prev.length + 1 }];
      });

      enqueueSnackbar(values._id ? 'Category updated successfully' : 'Category added successfully', {
        variant: 'success',
      });

      setIsSubmitting(false);
      setCurrentCategory(null);
      editModal.onFalse();
    }, 400);
  };

  const onDelete = () => {
    if (!currentCategory?._id) return;

    setCategories((prev) => prev.filter((cat) => cat._id !== currentCategory._id));
    enqueueSnackbar('Category deleted successfully', { variant: 'success' });
    deleteModal.onFalse();
    setCurrentCategory(null);
  };

  const handleDeleteClose = () => {
    setCurrentCategory(null);
    deleteModal.onFalse();
  };

  const handleEditClose = () => {
    setCurrentCategory(null);
    editModal.onFalse();
  };

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleAdd}>
          Add category
        </Button>
      </Stack>

      <DragDropList
        data={categories}
        isLoading={isLoading}
        droppableId="category-list"
        updateOrder={handleUpdateOrder}
        renderItem={({ item, snapshot }) => (
          <CategoryDragCard
            item={item}
            snapshot={snapshot}
            index={item.order}
            showLabel={item.isDefault ? 'Default' : ''}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      />

      <CategoryModal
        currentCategory={currentCategory}
        open={editModal.value}
        onClose={handleEditClose}
        onSubmit={handleSubmit}
        submitting={isSubmitting}
      />

      <ConfirmDialog
        title="Delete category"
        content="Are you sure you want to delete this category?"
        open={deleteModal.value}
        onClose={handleDeleteClose}
        action={
          <LoadingButton variant="contained" color="error" onClick={onDelete}>
            Delete
          </LoadingButton>
        }
      />
    </>
  );
};

export default CategoryList;
