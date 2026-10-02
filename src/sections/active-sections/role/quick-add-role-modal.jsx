import { useEffect, useMemo } from 'react';

import PropTypes from 'prop-types';

import {
    Controller,
    useForm,
} from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import * as z from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';


import { Field } from 'src/components/hook-form';
import { Form } from 'src/components/hook-form/form-provider';
import { ROLE_PERMISSIONS } from './mocks/data';

// ----------------------------------------------------------------------

const DEFAULT_VALUES = {
    name: '',
    description: '',
    permissions: [],
};

// ----------------------------------------------------------------------

export default function QuickAddRoleModal({ open, onClose, currentRole }) {

    const defaultValues = useMemo(() => ({
        name: currentRole?.name || '',
        description: currentRole?.description || '',
        permissions: currentRole?.permissions || [],
    }),
        [currentRole]
    );
    const isEdit = Boolean(currentRole?.id);

    const roleSchema = z.object({
        name: z.string().min(2, 'Role name is required').max(100, 'Role name must not exceed 100 characters'),
        description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
        permissions: z.array(z.string()).min(1, 'Select at least one permission'),
    });

    const isApproved = currentRole?.status === 'approved';

    const isRejected = currentRole?.status === 'rejected';

    const isPending = currentRole?.status === 'pending';

    const canEdit = !isEdit || isPending || isRejected;

    const methods = useForm({
        resolver: zodResolver(roleSchema),
        defaultValues
    });

    const {
        control,
        reset,
        handleSubmit,
        formState: {
            isSubmitting,
            errors,
        },
    } = methods;

    // ----------------------------------------------------------------------

    useEffect(() => {
        if (open) {
            reset(defaultValues);
        }
    }, [open, defaultValues, reset]);

    // ----------------------------------------------------------------------

    const handleClose = () => {
        reset(DEFAULT_VALUES);
        onClose();
    };

    // ----------------------------------------------------------------------

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,

                status: 'pending',
                siteId: currentRole?.siteId,
                ...(isEdit && { id: currentRole.id }),
            };

            console.log(isEdit ? 'UPDATE ROLE' : 'CREATE ROLE', payload);

            handleClose();
        } catch (error) {
            console.error(error);
        }
    };

    // ----------------------------------------------------------------------

    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            open={open}
            onClose={handleClose}
        >
            <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle>
                    {isEdit ? 'Edit Role' : 'Add New Role'}
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{ pt: 1 }}>
                        {/* Role information */}

                        <Stack spacing={2}>
                            <Typography variant="subtitle1" >Role Information </Typography>

                            <Field.Text name="name" label="Role Name" disabled={!canEdit} />

                            <Field.Text name="description" label="Description" multiline rows={3} disabled={!canEdit} />
                        </Stack>

                        <Divider />

                        {/* Permissions */}

                        <Box>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{ mb: 1 }}
                            >
                                <Box>
                                    <Typography variant="subtitle1">Permissions</Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Select the permissions available
                                        for this role.
                                    </Typography>
                                </Box>
                            </Stack>

                            <Controller
                                name="permissions"
                                control={control}
                                render={({
                                    field,
                                }) => (
                                    <Stack spacing={2}>
                                        {ROLE_PERMISSIONS.map(
                                            (group) => (
                                                <Box
                                                    key={group.group}
                                                    sx={{
                                                        p: 2,
                                                        border: (theme) =>
                                                            `1px solid ${theme.palette.divider}`,
                                                        borderRadius: 1.5,
                                                    }}
                                                >
                                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                        {group.group}
                                                    </Typography>

                                                    <Grid
                                                        container
                                                        spacing={1}
                                                    >
                                                        {group.permissions.map(
                                                            (permission) => {
                                                                const checked =
                                                                    field.value.includes(
                                                                        permission.value
                                                                    );

                                                                return (
                                                                    <Grid
                                                                        item
                                                                        xs={12}
                                                                        sm={6}
                                                                        md={4}
                                                                        key={
                                                                            permission.value
                                                                        }
                                                                    >
                                                                        <FormControlLabel
                                                                            control={
                                                                                <Checkbox
                                                                                    checked={
                                                                                        checked
                                                                                    }
                                                                                    disabled={
                                                                                        !canEdit
                                                                                    }
                                                                                    onChange={(
                                                                                        event
                                                                                    ) => {
                                                                                        if (
                                                                                            event
                                                                                                .target
                                                                                                .checked
                                                                                        ) {
                                                                                            field.onChange(
                                                                                                [
                                                                                                    ...field.value,
                                                                                                    permission.value,
                                                                                                ]
                                                                                            );
                                                                                        } else {
                                                                                            field.onChange(
                                                                                                field.value.filter(
                                                                                                    (value) =>
                                                                                                        value !==
                                                                                                        permission.value
                                                                                                )
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                />
                                                                            }
                                                                            label={
                                                                                permission.label
                                                                            }
                                                                        />
                                                                    </Grid>
                                                                );
                                                            }
                                                        )}
                                                    </Grid>
                                                </Box>
                                            )
                                        )}
                                    </Stack>
                                )}
                            />

                            {errors.permissions && (
                                <FormHelperText error sx={{ mt: 1 }}>
                                    {errors.permissions.message}
                                </FormHelperText>
                            )}
                        </Box>

                        {/* Rejection reason */}

                        {isRejected &&
                            currentRole?.rejectionReason && (
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 1.5,
                                        bgcolor: 'error.lighter',
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        color="error"
                                    >
                                        Rejection Reason
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{ mt: 0.5 }}
                                    >
                                        {currentRole.rejectionReason}
                                    </Typography>
                                </Box>
                            )}

                        {/* Status */}

                        {isEdit && (
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: 'background.neutral',
                                    borderRadius: 1.5,
                                }}
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                >
                                    <Typography variant="body2">
                                        Current Status
                                    </Typography>

                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            textTransform: 'capitalize',
                                        }}
                                    >
                                        {currentRole?.status}
                                    </Typography>
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>

                    {canEdit && !isApproved && (
                        <Button
                            type="submit"
                            variant="contained"
                        >
                            {isRejected
                                ? 'Resubmit for Approval'
                                : isEdit
                                    ? 'Save'
                                    : 'Add Role'}
                        </Button>
                    )}
                </DialogActions>
            </Form>
        </Dialog>
    );
}

// ----------------------------------------------------------------------

QuickAddRoleModal.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    currentRole: PropTypes.object,
};