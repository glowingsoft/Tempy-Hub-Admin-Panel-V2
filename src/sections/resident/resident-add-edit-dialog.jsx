import { useState, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { LoadingButton } from '@mui/lab';

import { toast } from 'src/components/snackbar';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import { useCreateResidentMutation, useUpdateResidentMutation } from 'src/store/Reducer/residents-api';
import {
    RESIDENT_CARE_LEVEL_OPTIONS,
    RESIDENT_STATUS_OPTIONS,
    RESIDENT_ADMISSION_STATUS_OPTIONS,
} from './mocks/data';

// ----------------------------------------------------------------------

const DEFAULT_FORM_VALUES = {
    name: '',
    email: '',
    phone: '',
    roomNumber: '',
    careLevel: 'low',
    branchId: '',
    visitorPasscode: '',
    admissionStatus: 'admitted',
    status: 'active',
};

const getErrorMessage = (error, fallback) =>
    error?.data?.message ||
    error?.data?.msg ||
    error?.data?.error ||
    error?.error ||
    error?.message ||
    fallback;

export function ResidentAddEditDialog({
    open,
    currentResident,
    onClose,
    onSave,
    ownerDashboard = false,
    organizationId = null,
}) {
    const [formData, setFormData] = useState(DEFAULT_FORM_VALUES);
    const [errors, setErrors] = useState({});

    // For Owner Dashboard, load real branches from the organization; for site/line manager, fallback to mock.
    const { branches, isBranchesLoading: isBranchesFetching } = useOrganizationLookups({
        organizationId: ownerDashboard ? organizationId : null,
        branches: open && !!organizationId && ownerDashboard,
        jobTitles: false,
        departments: false,
        limit: 100,
    });

    const [createResident, { isLoading: isCreating }] = useCreateResidentMutation();
    const [updateResident, { isLoading: isUpdating }] = useUpdateResidentMutation();
    const isSaving = isCreating || isUpdating;

    useEffect(() => {
        if (currentResident) {
            setFormData({
                name: currentResident.name || '',
                email: currentResident.email || '',
                phone: currentResident.phone || '',
                roomNumber: currentResident.roomNumber || '',
                careLevel: currentResident.careLevel || 'low',
                branchId: currentResident.branchId || branches[0]?._id || '',
                visitorPasscode: currentResident.visitorPasscode || currentResident.securityPassword || '',
                admissionStatus: currentResident.admissionStatus || (currentResident.status === 'inactive' ? 'discharged' : 'admitted'),
                status: currentResident.status || (currentResident.admissionStatus === 'discharged' ? 'inactive' : 'active'),
            });
        } else {
            setFormData({
                ...DEFAULT_FORM_VALUES,
                branchId: branches[0]?._id || '',
                visitorPasscode: `PASS-${Math.floor(1000 + Math.random() * 9000)}`,
            });
        }
        setErrors({});
    }, [currentResident, open, branches]);

    const handleChange = (field) => (event) => {
        setFormData((prev) => ({ ...prev, [field]: event.target.value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = async () => {
        const newErrors = {};
        if (!formData.roomNumber.trim()) newErrors.roomNumber = 'Room number is required';
        if (!ownerDashboard || !currentResident) {
            if (!formData.name.trim()) newErrors.name = 'Full name is required';
            if (!formData.branchId) newErrors.branchId = 'Site / Branch is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (ownerDashboard && !currentResident) {
            try {
                const payload = {
                    organizationId,
                    name: formData.name.trim(),
                    roomNumber: formData.roomNumber.trim(),
                    branchId: formData.branchId,
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    careLevel: formData.careLevel,
                    admissionStatus: formData.admissionStatus || 'admitted',
                    visitorPasscode: formData.visitorPasscode.trim(),
                };

                const result = await createResident(payload).unwrap();
                toast.success('Resident created successfully!');
                onSave?.(result?.data || result);
                onClose();
            } catch (error) {
                console.error('Create resident error:', error);
                toast.error(getErrorMessage(error, 'Failed to create resident.'));
            }
            return;
        }

        if (ownerDashboard && currentResident) {
            const payload = {
                residentId: currentResident._id,
                organizationId,
                careLevel: formData.careLevel,
                roomNumber: formData.roomNumber.trim(),
                admissionStatus: formData.admissionStatus,
            };

            try {
                const result = await updateResident(payload).unwrap();
                toast.success('Resident updated successfully!');
                onSave?.({
                    ...currentResident,
                    ...result,
                    careLevel: payload.careLevel,
                    roomNumber: payload.roomNumber,
                    admissionStatus: payload.admissionStatus,
                });
                onClose();
            } catch (error) {
                console.error('Update resident error:', error);
                toast.error(getErrorMessage(error, 'Failed to update resident.'));
            }
            return;
        }

        // Mock / non-owner update flow
        const selectedBranch = branches.find((b) => b._id === formData.branchId);

        onSave?.({
            ...(currentResident || { _id: `resident-${Date.now()}` }),
            ...formData,
            securityPassword: formData.visitorPasscode,
            branch: selectedBranch ? selectedBranch.name : (currentResident?.branch || 'Willow House'),
        });

        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {currentResident ? 'Edit Resident Details' : 'Add New Resident'}
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2} sx={{ pt: 1 }}>
                    {/* Name */}
                    {!(ownerDashboard && currentResident) && (
                        <Grid xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Full Name *"
                                value={formData.name}
                                onChange={handleChange('name')}
                                error={Boolean(errors.name)}
                                helperText={errors.name}
                                placeholder="e.g. James Taylor"
                            />
                        </Grid>
                    )}

                    {/* Room Number */}
                    <Grid xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Room Number *"
                            value={formData.roomNumber}
                            onChange={handleChange('roomNumber')}
                            error={Boolean(errors.roomNumber)}
                            helperText={errors.roomNumber}
                            placeholder="e.g. 106"
                        />
                    </Grid>

                    {/* Email */}
                    {!(ownerDashboard && currentResident) && (
                        <Grid xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={handleChange('email')}
                                placeholder="e.g. james.taylor@example.com"
                            />
                        </Grid>
                    )}

                    {/* Phone */}
                    {!(ownerDashboard && currentResident) && (
                        <Grid xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                value={formData.phone}
                                onChange={handleChange('phone')}
                                placeholder="e.g. +447700900001"
                            />
                        </Grid>
                    )}

                    {/* Site / Branch */}
                    {!(ownerDashboard && currentResident) && (
                        <Grid xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Site / Branch *"
                                value={formData.branchId}
                                onChange={handleChange('branchId')}
                                error={Boolean(errors.branchId)}
                                helperText={errors.branchId || (isBranchesFetching ? 'Loading sites...' : '')}
                            >
                                {branches.map((branch) => (
                                    <MenuItem key={branch._id} value={branch._id}>
                                        {branch.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    )}

                    {/* Care Level */}
                    <Grid xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Care Level"
                            value={formData.careLevel}
                            onChange={handleChange('careLevel')}
                        >
                            {RESIDENT_CARE_LEVEL_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Visitor Passcode */}
                    {!(ownerDashboard && currentResident) && (
                        <Grid xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Visitor Passcode / Security PIN"
                                value={formData.visitorPasscode}
                                onChange={handleChange('visitorPasscode')}
                                placeholder="e.g. PASS-1098"
                                helperText="Required for visitor verification"
                            />
                        </Grid>
                    )}

                    {/* Admission Status */}
                    <Grid xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Admission Status"
                            value={formData.admissionStatus}
                            onChange={handleChange('admissionStatus')}
                        >
                            {RESIDENT_ADMISSION_STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button variant="outlined" color="inherit" onClick={onClose} disabled={isSaving}>
                    Cancel
                </Button>
                <LoadingButton
                    variant="contained"
                    color="primary"
                    loading={isSaving}
                    onClick={handleSubmit}
                >
                    {currentResident ? 'Save Changes' : 'Add Resident'}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
