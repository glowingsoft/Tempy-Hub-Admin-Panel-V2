import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
// import { useUserStatusChangeMutation } from 'src/store/Reducer/user-api';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useUpdateExternalPersonMutation } from 'src/store/Reducer/general-directory-api';
import { z as zod } from 'zod';

const QUICK_USER_STATUS_OPTIONS = [
    { value: 'active', label: 'Active', color: 'success' },
    { value: 'inactive', label: 'Inactive', color: 'error' },
    // { value: 'onLeave', label: 'On Leave', color: 'warning' },
    // { value: 'archived', label: 'Archived', color: 'default' },
];

const QuickStatusChangeModal = ({ currentUser, open, onClose }) => {

    const { organizationId } = useCurrentOrganization();

    const defaultValues = useMemo(() => ({
        status: QUICK_USER_STATUS_OPTIONS.some((option) => option.value === currentUser?.userStatus)
            ? currentUser.userStatus
            : '',
        phone: currentUser?.phone || '',
        carRegistration: currentUser?.carRegistration || '',
    }), [currentUser]);

    // const [updateUser] = useUserStatusChangeMutation();
    const [updateExternalPerson] = useUpdateExternalPersonMutation();

    const schema = zod.object({
        status: zod.string().refine(
            (status) => QUICK_USER_STATUS_OPTIONS.some((option) => option.value === status),
            'Select a valid user status'
        ),
        phone: zod.string().min(1, 'Phone is required'),
        carRegistration: zod.string().min(1, 'Car registration is required'),
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
        try {
            await updateExternalPerson({
                externalPersonId: currentUser?.id,
                organizationId,
                status: data.status,
                phone: data.phone,
                carRegistration: data.carRegistration,
            }).unwrap();

            toast.success("User updated successfully");
            handleClose();
        } catch (error) {
            // Error toast is shown by the base query.
        }
    }
    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
            <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
                <DialogTitle sx={{ pb: 0 }}>Quick Status Change </DialogTitle>
                <DialogContent>

                    <Field.Select name="status" label="User Status" sx={{ mt: 2 }}>

                        <MenuItem value="">Select Status</MenuItem>
                        <Divider sx={{ borderStyle: "dashed" }} />
                        {QUICK_USER_STATUS_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Field.Select>

                    <Field.Phone name="phone" label="Phone" sx={{ mt: 2 }} />

                    <Field.Text name="carRegistration" label="Car Registration" sx={{ mt: 2 }} />
                </DialogContent>
                <DialogActions>

                    <Button variant="outlined" color="primary" onClick={handleClose}>
                      Cancel
                    </Button>

                    <LoadingButton
                        type="submit"
                        variant="contained"
                        color="primary"
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