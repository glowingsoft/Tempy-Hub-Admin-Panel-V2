import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LoadingButton } from '@mui/lab';

import { Field, Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useUpdateResidentVisitorPasscodeMutation } from 'src/store/Reducer/residents-api';

const MIN_LENGTH = 4;
const MAX_LENGTH = 24;

const getErrorMessage = (error) =>
    error?.data?.message ||
    error?.data?.msg ||
    error?.data?.error ||
    error?.error ||
    error?.message ||
    'Failed to update visitor passcode.';

const digitsOnly = (value) => String(value || '').replace(/\D/g, '').slice(0, MAX_LENGTH);

const SecurityPasswordSchema = zod.object({
    visitorPasscode: zod
        .string()
        .trim()
        .min(1, { message: 'Security pin is required.' })
        .regex(/^\d+$/, { message: 'Security password must contain numbers only.' })
        .min(MIN_LENGTH, { message: `Security password must be at least ${MIN_LENGTH} digits.` })
        .max(MAX_LENGTH, { message: `Security password must be at most ${MAX_LENGTH} digits.` }),
});

export function ResidentSecurityDialog({
    open,
    resident,
    onClose,
    onSave,
    organizationId = null,
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [updateVisitorPasscode, { isLoading }] = useUpdateResidentVisitorPasscodeMutation();

    const defaultValues = useMemo(
        () => ({
            visitorPasscode: digitsOnly(resident?.visitorPasscode || resident?.securityPassword),
        }),
        [resident]
    );

    const methods = useForm({
        mode: 'onTouched',
        resolver: zodResolver(SecurityPasswordSchema),
        defaultValues,
    });

    useEffect(() => {
        if (open) {
            methods.reset(defaultValues);
            setShowPassword(false);
        }
    }, [open, defaultValues, methods]);

    if (!resident) return null;

    const handleClose = () => {
        onClose();
        methods.reset(defaultValues);
        setShowPassword(false);
    };

    const onSubmit = methods.handleSubmit(async (data) => {
        const visitorPasscode = digitsOnly(data.visitorPasscode);

        try {
            const result = await updateVisitorPasscode({
                residentId: resident._id,
                organizationId,
                visitorPasscode,
            }).unwrap();
            onSave?.({
                ...resident,
                ...result,
                visitorPasscode,
                securityPassword: visitorPasscode,
            });
            toast.success('Visitor passcode updated successfully!');
            handleClose();
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    });

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <Form methods={methods} onSubmit={onSubmit}>
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={resident.image} alt={resident.name} sx={{ textTransform: 'capitalize' }}>
                            {resident.name?.charAt(0)}
                        </Avatar>
                        <Stack>
                            <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                                {resident.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Room {resident.roomNumber} &bull; Numeric PIN
                            </Typography>
                        </Stack>
                    </Stack>
                </DialogTitle>

                <DialogContent dividers>
                    <Box sx={{ pt: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            This PIN can only contain numbers (0–9). Enter {MIN_LENGTH} to {MAX_LENGTH} digits.
                        </Typography>

                        <Field.Text
                            name="visitorPasscode"
                            label="Numeric PIN"
                            placeholder="Enter numbers only"
                            helperText={`Numbers only. ${MIN_LENGTH}–${MAX_LENGTH} digits.`}
                            type={showPassword ? 'text' : 'password'}
                            inputProps={{
                                inputMode: 'numeric',
                                maxLength: MAX_LENGTH,
                                pattern: '[0-9]*',
                                autoComplete: 'off',
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            edge="end"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            <Iconify
                                                icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                                            />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            onChange={(event) => {
                                methods.setValue('visitorPasscode', digitsOnly(event.target.value), {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                            }}
                            onKeyDown={(event) => {
                                if (
                                    event.key.length === 1 &&
                                    !/[0-9]/.test(event.key) &&
                                    !event.ctrlKey &&
                                    !event.metaKey
                                ) {
                                    event.preventDefault();
                                }
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button variant="outlined" color="primary" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        loading={methods.formState.isSubmitting || isLoading}
                    >
                        Save PIN
                    </LoadingButton>
                </DialogActions>
            </Form>
        </Dialog>
    );
}
