import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Unstable_Grid2';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useCreateResidentMutation, useUpdateResidentMutation } from 'src/store/Reducer/residents-api';

import {
    RESIDENT_ADMISSION_STATUS_OPTIONS,
    RESIDENT_CARE_LEVEL_OPTIONS,
} from './mocks/data';

// ----------------------------------------------------------------------

const lookupOptionSchema = zod.object({
    value: zod.string().min(1),
    label: zod.string(),
});

const ResidentSchema = zod.object({
    name: zod.string().trim().min(1, { message: 'Full name is required' }),
    email: zod
        .string()
        .trim()
        .refine((value) => !value || zod.string().email().safeParse(value).success, {
            message: 'Email must be a valid email address',
        }),
    phone: zod.string(),
    roomNumber: zod.string().trim().min(1, { message: 'Room number is required' }),
    careLevel: zod.string().min(1, { message: 'Care level is required' }),
    branchId: lookupOptionSchema.nullable().refine((value) => Boolean(value?.value), {
        message: 'Site is required',
    }),
    visitorPasscode: zod.string(),
    admissionStatus: zod.string().min(1, { message: 'Admission status is required' }),
});

const mapLookupOption = (item) => ({
    value: item._id,
    label: item.name,
});

const getErrorMessage = (error, fallback) =>
    error?.data?.message ||
    error?.data?.msg ||
    error?.data?.error ||
    error?.error ||
    error?.message ||
    fallback;

function resolveBranchOption(resident) {
    const branchId =
        resident?.branchId ||
        (typeof resident?.branch === 'object' ? resident?.branch?._id : resident?.branch) ||
        '';

    if (!branchId) return null;

    const branchName =
        (typeof resident?.branch === 'object' ? resident?.branch?.name : null) ||
        resident?.branchName ||
        branchId;

    return { value: branchId, label: branchName };
}

function randomPasscode() {
    return `PASS-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ----------------------------------------------------------------------

export function ResidentAddEditDialog({
    open,
    currentResident,
    onClose,
    onSave,
    organizationId = null,
}) {
    const isEdit = !!currentResident;

    const lookupQueryArgs = useMemo(() => ({ organizationId }), [organizationId]);

    const defaultValues = useMemo(
        () => ({
            name: currentResident?.name || '',
            email: currentResident?.email || '',
            phone: currentResident?.phone || '',
            roomNumber: currentResident?.roomNumber || '',
            careLevel: currentResident?.careLevel || 'low',
            branchId: resolveBranchOption(currentResident),
            visitorPasscode:
                currentResident?.visitorPasscode ||
                currentResident?.securityPassword ||
                randomPasscode(),
            admissionStatus:
                currentResident?.admissionStatus ||
                (currentResident?.status === 'inactive' ? 'discharged' : 'admitted'),
        }),
        [currentResident]
    );

    const methods = useForm({
        mode: 'onTouched',
        resolver: zodResolver(ResidentSchema),
        defaultValues,
    });

    const [createResident, { isLoading: isCreating }] = useCreateResidentMutation();
    const [updateResident, { isLoading: isUpdating }] = useUpdateResidentMutation();
    const isSaving = methods.formState.isSubmitting || isCreating || isUpdating;

    useEffect(() => {
        if (open) {
            methods.reset(defaultValues);
        }
    }, [open, defaultValues, methods]);

    const handleClose = () => {
        onClose();
        methods.reset(defaultValues);
    };

    const onSubmit = methods.handleSubmit(async (data) => {
        try {
            if (isEdit) {
                const payload = {
                    residentId: currentResident._id,
                    organizationId,
                    careLevel: data.careLevel,
                    roomNumber: data.roomNumber.trim(),
                    admissionStatus: data.admissionStatus,
                };

                const result = await updateResident(payload).unwrap();
                toast.success('Resident updated successfully!');
                onSave?.({
                    ...currentResident,
                    ...result,
                    careLevel: payload.careLevel,
                    roomNumber: payload.roomNumber,
                    admissionStatus: payload.admissionStatus,
                });
                handleClose();
                return;
            }

            const result = await createResident({
                organizationId,
                name: data.name.trim(),
                roomNumber: data.roomNumber.trim(),
                branchId: data.branchId.value,
                email: data.email.trim().toLowerCase(),
                phone: data.phone.trim(),
                careLevel: data.careLevel,
                admissionStatus: data.admissionStatus || 'admitted',
                visitorPasscode: data.visitorPasscode.trim(),
            }).unwrap();

            toast.success('Resident created successfully!');
            onSave?.(result?.data || result);
            handleClose();
        } catch (error) {
            toast.error(
                getErrorMessage(error, isEdit ? 'Failed to update resident.' : 'Failed to create resident.')
            );
        }
    });

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <Form methods={methods} onSubmit={onSubmit}>
                <DialogTitle>
                    {isEdit
                        ? `Edit Resident Details (${currentResident.name || 'Resident'})`
                        : 'Add New Resident'}
                </DialogTitle>

                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ pt: 1 }}>
                        {!isEdit && (
                            <Grid xs={12}>
                                <Field.Text
                                    name="name"
                                    label="Full Name"
                                    placeholder="e.g. James Taylor"
                                />
                            </Grid>
                        )}

                        {!isEdit && (
                            <Grid xs={12}>
                                <Field.Text
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    placeholder="e.g. james.taylor@example.com"
                                />
                            </Grid>
                        )}

                        {!isEdit && (
                            <Grid xs={12} sm={6}>
                                <Field.Text
                                    name="phone"
                                    label="Phone Number"
                                    placeholder="e.g. +447700900001"
                                />
                            </Grid>
                        )}

                        <Grid xs={12} sm={isEdit ? 12 : 6}>
                            <Field.Text
                                name="roomNumber"
                                label="Room Number"
                                placeholder="e.g. 106"
                            />
                        </Grid>

                        {!isEdit && (
                            <Grid xs={12}>
                                <Field.InfiniteAutocomplete
                                    name="branchId"
                                    label="Site"
                                    placeholder="Search sites"
                                    useQuery={useGetBranchesQuery}
                                    queryArgs={lookupQueryArgs}
                                    mapOption={mapLookupOption}
                                    enabled={open && !!organizationId}
                                />
                            </Grid>
                        )}

                        <Grid xs={12} sm={6}>
                            <Field.Select name="careLevel" label="Care Level">
                                {RESIDENT_CARE_LEVEL_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Field.Select>
                        </Grid>

                        <Grid xs={12} sm={6}>
                            <Field.Select name="admissionStatus" label="Admission Status">
                                {RESIDENT_ADMISSION_STATUS_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Field.Select>
                        </Grid>

                        {!isEdit && (
                            <Grid xs={12}>
                                <Field.Text
                                    name="visitorPasscode"
                                    label="Visitor Passcode / Security PIN"
                                    placeholder="e.g. PASS-1098"
                                    helperText="Required for visitor verification"
                                />
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button variant="outlined" color="primary" onClick={handleClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        color="primary"
                        loading={isSaving}
                    >
                        {isEdit ? 'Save Changes' : 'Add Resident'}
                    </LoadingButton>
                </DialogActions>
            </Form>
        </Dialog>
    );
}
