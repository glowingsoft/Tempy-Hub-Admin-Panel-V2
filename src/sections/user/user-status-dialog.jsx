import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { USER_STATUS_OPTIONS } from 'src/_mock';
// import { useUserStatusChangeMutation } from 'src/store/Reducer/user-api';
import { z as zod } from 'zod';

const QuickStatusChangeModal = ({ currentUser, open, onClose }) => {

    const defaultValues = useMemo(() => ({
        // status: currentUser?.status ?? 'active'
        status: 'active'
    }), [currentUser]);

    // const [updateUser] = useUserStatusChangeMutation();

    const schema = zod.object({
        status: zod.string().min(1, 'Status is required')
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
        //     id: currentUser?.id, body: {
        //         status: data.status
        //     }
        // });

        // if (!response?.error) {
        //     toast.success("Status updated successfully");
        //     handleClose();
        // }
    }
    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
                <DialogTitle sx={{ pb: 0 }}>Quick Status Change </DialogTitle>
                <DialogContent>

                    <Field.Select name="status" label="Status" sx={{ mt: 2 }}>

                        <MenuItem value="">Select Status</MenuItem>
                        <Divider sx={{ borderStyle: "dashed" }} />
                        {USER_STATUS_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Field.Select>
                </DialogContent>
                <DialogActions>

                    <Button variant='outlined' onClick={handleClose}>Cancel</Button>

                    <LoadingButton
                        type="submit"
                        variant="contained"
                        loading={methods.formState.isSubmitting}
                    >
                        Save
                    </LoadingButton>
                </DialogActions>
            </Form>
        </Dialog>
    )
}

export default QuickStatusChangeModal