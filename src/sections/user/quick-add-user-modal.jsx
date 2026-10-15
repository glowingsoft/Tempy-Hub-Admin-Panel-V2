import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, MenuItem } from '@mui/material';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import { USER_STATUS_OPTIONS } from 'src/_mock';
import { useCreateExternalPersonMutation } from 'src/store/Reducer/general-directory-api';
import { z as zod } from 'zod';

const TYPE_OPTIONS = [
    { value: "visitor", label: "Visitor" },
    { value: "contractor", label: "Contractor" },
    { value: "professional", label: "Professional" },
]

const QuickAddUserModal = ({ open, onClose, currentUser }) => {

    const { organizationId } = useCurrentOrganization();

    const { branchOptions, departmentOptions } = useOrganizationLookups({
        organizationId,
        branches: open,
        departments: open,
        jobTitles: false,
        limit: 100,
    });

    const [createExternalPerson] = useCreateExternalPersonMutation();

    const defaultValues = useMemo(() => ({
        image: currentUser?.image || '',
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        password: currentUser?.password || '',
        status: currentUser?.status || 'active',
        type: currentUser?.type || 'visitor',
        branchId: currentUser?.branchId || '',
        departmentId: currentUser?.departmentId || '',

    }), [currentUser]);

    const password = useBoolean();

    const schema = zod.object({
        image: zod.any().optional(),
        name: zod.string().min(1, 'Name is required'),
        email: zod.string().min(1, 'Email is required').email('Email must be a valid email address'),
        phone: zod.string().min(1, 'Phone is required'),
        password: zod.string().min(1, 'Password is required'),
        status: zod.string().min(1, 'Status is required'),
        type: zod.enum(['visitor', 'contractor', 'professional'], { message: 'Type is required' }),
        branchId: zod.string().min(1, 'Site is required'),
        departmentId: zod.string().min(1, 'Department is required'),
    });

    const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues
    });
    const handleClose = () => {
        onClose();
        methods.reset();
    }

    const onSubmit = async (data) => {
        try {
            await createExternalPerson({
                organizationId,
                branchId: data.branchId,
                type: data.type,
                name: data.name,
                email: data.email,
                phone: data.phone,
                departmentId: data.departmentId,
                password: data.password,
                status: data.status,
                // A picked File can't go in a JSON body; only an existing URL is sent until upload exists.
                image: typeof data.image === 'string' ? data.image : '',
            }).unwrap();

            toast.success("User created successfully");
            handleClose();
        } catch (error) {
            // Error toast is shown by the base query.
        }
    }
    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">

            <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>

                <DialogTitle sx={{ pb: 0 }}>Create User </DialogTitle>

                <DialogContent>

                    <Field.UploadAvatar name="image" />

                    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { md: "repeat(1,1fr)", xs: "repeat(1,1fr)" }, mt: 3 }}>

                        <Field.Text name="name" label="Name" />

                        <Field.Text name="email" label="Email" />

                        <Field.Phone name="phone" label="Phone" />

                        <Field.Text
                            name="password"
                            label="Password"
                            placeholder="6+ characters"
                            type={password.value ? 'text' : 'password'}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={password.onToggle} edge="end">
                                            <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Field.Select name="type" label="Type">
                            {TYPE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Field.Select>

                        <Field.Select name="branchId" label="Site">
                            {branchOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Field.Select>

                        <Field.Select name="departmentId" label="Department">
                            {departmentOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Field.Select>

                        <Field.Select name="status" label="Status">
                            {USER_STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Field.Select>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button variant='outlined' onClick={handleClose}>Cancel</Button>
                    <LoadingButton type="submit" variant="contained" color="primary" loading={methods.formState.isSubmitting}>
                        Add User
                    </LoadingButton>
                </DialogActions>
            </Form>
        </Dialog>
    )
}

export default QuickAddUserModal