import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { mockBranchesResponse } from 'src/sections/branch/mocks/data';
import { RESIDENT_CARE_LEVEL_OPTIONS, RESIDENT_STATUS_OPTIONS } from './mocks/data';

// ----------------------------------------------------------------------

const DEFAULT_FORM_VALUES = {
    name: '',
    email: '',
    phone: '',
    roomNumber: '',
    careLevel: 'low',
    branchId: '',
    securityPassword: '',
    status: 'active',
};

export function ResidentAddEditDialog({ open, currentResident, onClose, onSave }) {
    const [formData, setFormData] = useState(DEFAULT_FORM_VALUES);
    const [errors, setErrors] = useState({});

    const branches = mockBranchesResponse.data || [];

    useEffect(() => {
        if (currentResident) {
            setFormData({
                name: currentResident.name || '',
                email: currentResident.email || '',
                phone: currentResident.phone || '',
                roomNumber: currentResident.roomNumber || '',
                careLevel: currentResident.careLevel || 'low',
                branchId: currentResident.branchId || branches[0]?._id || '',
                securityPassword: currentResident.securityPassword || '',
                status: currentResident.status || 'active',
            });
        } else {
            setFormData({
                ...DEFAULT_FORM_VALUES,
                branchId: branches[0]?._id || '',
                securityPassword: `PASS-${Math.floor(1000 + Math.random() * 9000)}`,
            });
        }
        setErrors({});
    }, [currentResident, open]);

    const handleChange = (field) => (event) => {
        setFormData((prev) => ({ ...prev, [field]: event.target.value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleSubmit = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.roomNumber.trim()) newErrors.roomNumber = 'Room number is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const selectedBranch = branches.find((b) => b._id === formData.branchId);

        onSave?.({
            ...(currentResident || { _id: `resident-${Date.now()}` }),
            ...formData,
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
                    <Grid xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Full Name *"
                            value={formData.name}
                            onChange={handleChange('name')}
                            error={Boolean(errors.name)}
                            helperText={errors.name}
                            placeholder="e.g. John Smith"
                        />
                    </Grid>

                    {/* Room Number */}
                    <Grid xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Room Number *"
                            value={formData.roomNumber}
                            onChange={handleChange('roomNumber')}
                            error={Boolean(errors.roomNumber)}
                            helperText={errors.roomNumber}
                            placeholder="e.g. 101"
                        />
                    </Grid>

                    {/* Email */}
                    <Grid xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={handleChange('email')}
                            placeholder="e.g. john.smith@example.com"
                        />
                    </Grid>

                    {/* Phone */}
                    <Grid xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={formData.phone}
                            onChange={handleChange('phone')}
                            placeholder="e.g. +44 7700 900123"
                        />
                    </Grid>

                    {/* Site / Branch */}
                    <Grid xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Site / Branch"
                            value={formData.branchId}
                            onChange={handleChange('branchId')}
                        >
                            {branches.map((branch) => (
                                <MenuItem key={branch._id} value={branch._id}>
                                    {branch.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

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

                    {/* Security Password */}
                    <Grid xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Security Password / PIN"
                            value={formData.securityPassword}
                            onChange={handleChange('securityPassword')}
                            placeholder="e.g. PASS-4821"
                            helperText="Required for visitor/caller verification"
                        />
                    </Grid>

                    {/* Status */}
                    <Grid xs={12} sm={6}>
                        <TextField
                            fullWidth
                            select
                            label="Status"
                            value={formData.status}
                            onChange={handleChange('status')}
                        >
                            {RESIDENT_STATUS_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button variant="outlined" color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                    {currentResident ? 'Save Changes' : 'Add Resident'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
