import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { LABEL_COLOR_OPTIONS } from 'src/_mock';
import { Field, Form } from 'src/components/hook-form';
// import { useUserStatusChangeMutation } from 'src/store/Reducer/user-api';

import { z as zod } from 'zod';
const PARENT_CATEGORY_OPTIONS = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'staff', label: 'Staff' },
];

const QuickAddEditCategoryModal = ({ currentCategory, open, onClose }) => {

    const defaultValues = useMemo(() => ({
        name: currentCategory?.name || '',
        description: currentCategory?.description || '',
        parentCategory: currentCategory?.parentCategory || '',
        labelColor: currentCategory?.labelColor || ''
    }), [currentCategory]);

    // const [updateUser] = useUserStatusChangeMutation();

    const schema = zod.object({
        name: zod.string().min(1, 'Name is required'),
        description: zod.string().min(1, 'Description is required'),
        parentCategory: zod.string().min(1, 'Parent Category is required'),
        labelColor: zod.string().min(1, 'Label Color is required'),
    });

    const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues
    });


    useEffect(() => {
        methods.reset(defaultValues);
    }, [defaultValues]);


    const handleClose = () => {
        onClose();
        methods.reset();
    }

    const onSubmit = async (data) => {

        // let response = await updateUser({
        //     id: currentCategory?.id, body: {
        //         status: data.status
        //     }
        // });

        // if (!response?.error) {
        //     toast.success("Status updated successfully");
        //     handleClose();
        // }
    }
    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
                <DialogTitle sx={{ pb: 0 }}>{currentCategory ? "Edit Category" : "Add Category"} </DialogTitle>
                <DialogContent>

                    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>

                        <Field.Text name="name" label="Name" />

                        <Field.Select name="parentCateogry" label="Parent Category" >

                            <MenuItem value="">Parent Category</MenuItem>
                            <Divider sx={{ borderStyle: "dashed" }} />
                            {PARENT_CATEGORY_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Field.Select>

                        <Field.Text name="description" label="Description" rows={3} multiline />

                        <Field.ColorPicker
                            name="labelColor"
                            label="Label Color"
                            colors={LABEL_COLOR_OPTIONS}
                             limit={8}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>

                    <Button variant='outlined' onClick={handleClose}>Cancel</Button>

                    <LoadingButton
                        type="submit"
                        variant="contained"
                        loading={methods.formState.isSubmitting}
                    >
                        {currentCategory ? "Update" : "Add"}
                    </LoadingButton>
                </DialogActions>
            </Form>
        </Dialog>
    )
}

export default QuickAddEditCategoryModal