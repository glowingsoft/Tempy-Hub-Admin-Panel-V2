import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import { LoadingButton } from '@mui/lab';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { useUpdateResidentVisitorPasscodeMutation } from 'src/store/Reducer/residents-api';

const getErrorMessage = (error) =>
    error?.data?.message ||
    error?.data?.msg ||
    error?.data?.error ||
    error?.error ||
    error?.message ||
    'Failed to update visitor passcode.';

export function ResidentSecurityDialog({
    open,
    resident,
    onClose,
    onSave,
    organizationId = null,
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [securityPassword, setSecurityPassword] = useState('');
    const [updateVisitorPasscode, { isLoading }] = useUpdateResidentVisitorPasscodeMutation();

    useEffect(() => {
        if (resident) {
            setSecurityPassword(resident.visitorPasscode || resident.securityPassword || '');
            setShowPassword(false);
        }
    }, [resident, open]);

    if (!resident) return null;

    const handleSave = async () => {
        const updatedResident = {
            ...resident,
            visitorPasscode: securityPassword,
            securityPassword,
        };

        try {
            const result = await updateVisitorPasscode({
                residentId: resident._id,
                organizationId,
                visitorPasscode: securityPassword,
            }).unwrap();
            onSave?.({ ...updatedResident, ...result, visitorPasscode: securityPassword, securityPassword });
            toast.success('Visitor passcode updated successfully!');
            onClose();
        } catch (error) {
            console.error('Update visitor passcode error:', error);
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={resident.image} alt={resident.name}>
                        {resident.name?.charAt(0)}
                    </Avatar>
                    <Stack>
                        <Typography variant="subtitle1">{resident.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Room {resident.roomNumber} &bull; Security Password
                        </Typography>
                    </Stack>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Set or amend the security password/PIN required for phone inquiries and visits.
                    </Typography>

                    <TextField
                        fullWidth
                        autoFocus
                        label="Security Password / PIN"
                        value={securityPassword}
                        onChange={(e) => setSecurityPassword(e.target.value)}
                        placeholder="Enter password or PIN"
                        type={showPassword ? 'text' : 'password'}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                                        <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button variant="outlined" color="inherit" onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>
                <LoadingButton variant="contained" color="primary" onClick={handleSave} loading={isLoading}>
                    Save Password
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
