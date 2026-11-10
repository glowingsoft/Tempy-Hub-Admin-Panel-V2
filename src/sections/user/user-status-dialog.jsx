import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, MenuItem } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
// import { useUserStatusChangeMutation } from 'src/store/Reducer/user-api';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import { useUpdateExternalPersonMutation } from 'src/store/Reducer/general-directory-api';
import { z as zod } from 'zod';

const QUICK_USER_STATUS_OPTIONS = [
    { value: 'active', label: 'Active', color: 'success' },
    { value: 'inactive', label: 'Inactive', color: 'error' },
    // { value: 'onLeave', label: 'On Leave', color: 'warning' },
    // { value: 'archived', label: 'Archived', color: 'default' },
];

const EXTERNAL_PERSON_TYPE_OPTIONS = [
    { value: 'visitor', label: 'Visitor' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'professional', label: 'Professional' },
];

const QuickStatusChangeModal = ({ currentUser, open, onClose }) => {

    const { organizationId } = useCurrentOrganization();
    const { departmentOptions } = useOrganizationLookups({
        organizationId,
        branches: false,
        jobTitles: false,
        departments: open,
        limit: 100,
    });

    const defaultValues = useMemo(() => ({
        status: QUICK_USER_STATUS_OPTIONS.some(
            (option) => option.value === (currentUser?.status || currentUser?.userStatus)
        )
            ? currentUser?.status || currentUser?.userStatus
            : '',
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        carRegistration: currentUser?.carRegistration || '',
        departmentId:
            currentUser?.departmentId ||
            (typeof currentUser?.department === 'object'
                ? currentUser.department?._id
                : currentUser?.department) ||
            '',
        type: currentUser?.type || '',
    }), [currentUser]);

    // const [updateUser] = useUserStatusChangeMutation();
    const [updateExternalPerson] = useUpdateExternalPersonMutation();

    const schema = zod.object({
        status: zod.string().refine(
            (status) => QUICK_USER_STATUS_OPTIONS.some((option) => option.value === status),
            'Select a valid user status'
        ),
        name: zod.string().trim().min(1, 'Name is required'),
        email: zod.string().trim().refine(
            (email) => !email || zod.string().email().safeParse(email).success,
            'Email must be a valid email address'
        ),
        phone: zod.string().min(1, 'Phone is required'),
        carRegistration: zod.string().min(1, 'Car registration is required'),
        departmentId: zod.string(),
        type: zod.enum(['visitor', 'contractor', 'professional'], {
            message: 'Select a valid type',
        }),
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
                name: data.name.trim(),
                email: data.email.trim(),
                phone: data.phone,
                carRegistration: data.carRegistration,
                departmentId: data.departmentId,
                type: data.type,
            }).unwrap();

            toast.success("User updated successfully");
            handleClose();
        } catch (error) {
            // Error toast is shown by the base query.
        }
    }
    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
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

                    <Field.Text name="name" label="Name" sx={{ mt: 2 }} />

                    <Field.Text name="email" label="Email" type="email" sx={{ mt: 2 }} />

                    <Field.Phone name="phone" label="Phone" sx={{ mt: 2 }} />

                    <Field.Text name="carRegistration" label="Car Registration" sx={{ mt: 2 }} />

                    <Field.Select name="departmentId" label="Department" sx={{ mt: 2 }}>
                        <MenuItem value="">No department</MenuItem>
                        {departmentOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Field.Select>

                    <Field.Select name="type" label="Type" sx={{ mt: 2 }}>
                        {EXTERNAL_PERSON_TYPE_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Field.Select>
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