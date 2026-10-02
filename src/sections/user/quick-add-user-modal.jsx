import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, MenuItem } from '@mui/material';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { USER_STATUS_OPTIONS } from 'src/_mock';
// import { useSupportReplyMutation } from 'src/store/Reducer/adminSetting';
import { z as zod } from 'zod';

const ROLE_OPTIONS = [
    // Care
    { value: "deputy", label: "Deputy" },
    { value: "head_of_care", label: "Head of Care" },
    { value: "senior_care", label: "Senior Care" },
    { value: "lead_care_assistant", label: "Lead Care Assistant" },
    { value: "care_assistant", label: "Care Assistant" },

    // Support / Admin
    { value: "maintenance", label: "Maintenance" },
    { value: "administrator", label: "Administrator" },

    // Kitchen
    { value: "head_cook", label: "Head Cook" },
    { value: "cook", label: "Cook" },
    { value: "kitchen_assistant", label: "Kitchen Assistant" },

    // Housekeeping
    { value: "head_housekeeper", label: "Head Housekeeper" },
    { value: "domestic_assistant", label: "Domestic Assistant" },

    // Activities
    { value: "lead_activities", label: "Lead Activities" },
    { value: "activities", label: "Activities" }
]
const DEPARTMENT_OPTIONS = [
    { value: "management", label: "Management" },
    { value: "accounting", label: "Accounting" },
    { value: "sales", label: "Sales" },
    { value: "support", label: "Support" },
    { value: "kitchen", label: "Kitchen" },
    { value: "activities", label: "Activities" },
    { value: "maintenance", label: "Maintenance" },
    { value: "administrative", label: "Administrative" },
]

const QuickAddUserModal = ({ open, onClose, currentUser }) => {

    const defaultValues = useMemo(() => ({
        image: currentUser?.image || '',
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        password: currentUser?.password || '',
        status: currentUser?.status || 'active',
        role: currentUser?.role || 'administrator',
        department: currentUser?.department || 'management',

    }), [currentUser]);

    const password = useBoolean();

    const schema = zod.object({
        image: zod.any().optional(),
        name: zod.string().min(1, 'Name is required'),
        email: zod.string().min(1, 'Email is required'),
        password: zod.string().min(1, 'Password is required'),
        status: zod.string().min(1, 'Status is required'),
        role: zod.string().min(1, 'Role is required'),
        department: zod.string().min(1, 'Department is required'),
    });

    // const [supportReply] = useSupportReplyMutation();

    const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues
    });
    const handleClose = () => {
        onClose();
        methods.reset();
    }

    const onSubmit = async (data) => {

        // let response = await supportReply({
        //     id: currentUser._id, data: {
        //         response: data.message
        //     }
        // });

        // if (!response?.error) {
        //     toast.success("Reply sent successfully");
        //     handleClose();
        // }
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

                        <Field.Select name="role" label="Role">
                            {ROLE_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                            ))}
                        </Field.Select>

                        <Field.Select name="department" label="Department">
                            {DEPARTMENT_OPTIONS.map((option) => (
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