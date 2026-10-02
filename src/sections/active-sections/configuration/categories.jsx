import { Box, Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CategoryDragCard from './category-drag-card';
import DragDropList from './drag-drop-list';
import QuickAddEditCategoryModal from './quick-add-edit-category-modal';
import { mockCategories } from './mocks/data';

const Categories = ({ title }) => {

    const openModal = useBoolean();

    const confirm = useBoolean();

    const [currentCategory, setCategory] = useState(null);

    const isLoading = false;

    const handleEdit = ( row ) => {

        openModal.onTrue();
        setCategory(row)

    }

    const handleDelete = () => {
         confirm.onTrue();
    }

    return (
        <Box>
            <Stack direction={{ md: "row", xs: "column" }} sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6">{title}</Typography>

                <Button variant="contained"
                    onClick={openModal.onTrue}
                    startIcon={<Iconify icon="mingcute:add-line" />} >
                    Add Category
                </Button>
            </Stack>

            <DragDropList
                data={mockCategories}
                isLoading={isLoading}
                droppableId="category-list"
                updateOrder={() => { }}
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

            <ConfirmDialog
                open={confirm.value}
                onClose={confirm.onFalse}
                title="Delete Category"
                content={"Are you sure you want to delete this category?"}
                action={
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => { }}

                    >
                        Delete
                    </Button>
                }
            />


            <QuickAddEditCategoryModal
                currentCategory={currentCategory}
                open={openModal.value}
                onClose={openModal.onFalse}
            />
        </Box>
    )
}

export default Categories