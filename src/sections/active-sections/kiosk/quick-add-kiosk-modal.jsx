import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton } from '@mui/lab';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    MenuItem,
    Typography,
} from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const SITE_OPTIONS = [
    {
        value: 'LHR-001',
        label: 'Lahore Office',
    },
    {
        value: 'ISB-001',
        label: 'Islamabad Office',
    },
    {
        value: 'KHI-001',
        label: 'Karachi Office',
    },
];

const DEVICE_TYPE_OPTIONS = [
    {
        value: 'ipad',
        label: 'iPad',
    },
    {
        value: 'android',
        label: 'Android',
    },
    {
        value: 'windows',
        label: 'Windows',
    },
];

const CHECK_IN_METHOD_OPTIONS = [
    {
        value: 'employee_id',
        label: 'Employee ID',
    },
    {
        value: 'pin',
        label: 'PIN',
    },
    {
        value: 'qr_code',
        label: 'QR Code',
    },
];

const STATUS_OPTIONS = [
    {
        value: 'online',
        label: 'Online',
    },
    {
        value: 'offline',
        label: 'Offline',
    },
    {
        value: 'inactive',
        label: 'Inactive',
    },
];

const SCREEN_TIMEOUT_OPTIONS = [
    {
        value: 30,
        label: '30 seconds',
    },
    {
        value: 60,
        label: '1 minute',
    },
    {
        value: 90,
        label: '90 seconds',
    },
    {
        value: 120,
        label: '2 minutes',
    },
    {
        value: 300,
        label: '5 minutes',
    },
];

// ----------------------------------------------------------------------

const schema = zod.object({
    name: zod
        .string()
        .trim()
        .min(1, 'Kiosk name is required'),

    kioskCode: zod
        .string()
        .trim()
        .min(1, 'Kiosk code is required'),

    site: zod
        .string()
        .min(1, 'Site is required'),

    status: zod
        .string()
        .min(1, 'Kiosk status is required'),

    deviceName: zod
        .string()
        .trim()
        .min(1, 'Device name is required'),

    deviceType: zod
        .string()
        .min(1, 'Device type is required'),

    checkInMethods: zod
        .array(zod.string())
        .min(1, 'Select at least one check-in method'),

    allowCheckOut: zod.boolean(),

    enableBreaks: zod.boolean(),

    phoneCheckIn: zod.boolean(),

    showPeeps: zod.boolean(),

    allowVisitorCheckIn: zod.boolean(),

    allowOfflineMode: zod.boolean(),

    screenTimeout: zod.coerce.number(),

    receptionIdentifier: zod.string().optional(),
});

// ----------------------------------------------------------------------

export default function QuickAddKioskModal({
    open,
    onClose,
    currentKiosk,
}) {
    const isEdit = Boolean(
        currentKiosk?._id || currentKiosk?.id
    );

    const defaultValues = useMemo(
        () => ({
            name: currentKiosk?.name || '',

            kioskCode:
                currentKiosk?.kioskCode || '',

            site:
                currentKiosk?.site?.code || '',

            status: currentKiosk?.status || 'offline',

            deviceName:
                currentKiosk?.device?.name || '',

            deviceType:
                currentKiosk?.device?.type || 'ipad',

            checkInMethods:
                currentKiosk?.settings?.checkInMethods || [],

            allowCheckOut:
                currentKiosk?.settings?.allowCheckOut ?? true,

            enableBreaks:
                currentKiosk?.settings?.enableBreaks ?? false,

            phoneCheckIn:
                currentKiosk?.settings?.phoneCheckIn ?? false,

            showPeeps:
                currentKiosk?.settings?.showPeeps ?? false,

            allowVisitorCheckIn:
                currentKiosk?.settings?.allowVisitorCheckIn ?? false,

            allowOfflineMode:
                currentKiosk?.settings?.allowOfflineMode ?? false,

            screenTimeout:
                currentKiosk?.settings?.screenTimeout ?? 60,

            receptionIdentifier:
                currentKiosk?.settings?.receptionIdentifier || '',
        }),
        [currentKiosk]
    );

    const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues,
    });

    const {
        reset,
        formState: { isSubmitting },
    } = methods;

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    // ----------------------------------------------------------------------

    const handleClose = () => {
        reset(defaultValues);
        onClose();
    };

    // ----------------------------------------------------------------------

    const onSubmit = async (data) => {
        try {
            const selectedSite = SITE_OPTIONS.find(
                (site) => site.value === data.site
            );

            const payload = {
                name: data.name.trim(),

                kioskCode: data.kioskCode.trim(),

                site: {
                    code: data.site,
                    name: selectedSite?.label || '',
                },

                status: data.status,

                device: {
                    name: data.deviceName.trim(),
                    type: data.deviceType,
                },

                settings: {
                    checkInMethods: data.checkInMethods,
                    allowCheckOut: data.allowCheckOut,
                    enableBreaks: data.enableBreaks,
                    phoneCheckIn: data.phoneCheckIn,
                    showPeeps: data.showPeeps,
                    allowVisitorCheckIn: data.allowVisitorCheckIn,
                    allowOfflineMode: data.allowOfflineMode,
                    screenTimeout: Number(data.screenTimeout),
                    receptionIdentifier:
                        data.receptionIdentifier?.trim() || '',
                },
            };

            console.log(
                isEdit
                    ? 'Update Kiosk:'
                    : 'Register Kiosk:',
                payload
            );

            toast.success(
                isEdit
                    ? 'Kiosk updated successfully'
                    : 'Kiosk registered successfully'
            );

            handleClose();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.data?.message ||
                'Something went wrong'
            );
        }
    };

    // ----------------------------------------------------------------------

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
        >
            <Form
                methods={methods}
                onSubmit={methods.handleSubmit(onSubmit)}
            >
                <DialogTitle>
                    {isEdit
                        ? 'Edit Kiosk'
                        : 'Register Kiosk'}
                </DialogTitle>

                <DialogContent>
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 2.5,
                            pt: 1,
                        }}
                    >
                        {/* Basic Information */}

                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                        >
                            Basic Information
                        </Typography>

                        <Field.Text
                            name="name"
                            label="Kiosk Name"
                            placeholder="e.g. Front Desk Kiosk"
                        />

                        <Field.Text
                            name="kioskCode"
                            label="Kiosk Code"
                            placeholder="e.g. KSK-001"
                            disabled={isEdit}
                        />

                        <Field.Select
                            name="site"
                            label="Site"
                        >
                            {SITE_OPTIONS.map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Field.Select>

                        <Field.Select
                            name="status"
                            label="Kiosk Status"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <MenuItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Field.Select>

                        <Divider />

                        {/* Device */}

                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                        >
                            Device Information
                        </Typography>

                        <Field.Text
                            name="deviceName"
                            label="Device Name"
                            placeholder="e.g. Reception iPad"
                        />

                        <Field.Select
                            name="deviceType"
                            label="Device Type"
                        >
                            {DEVICE_TYPE_OPTIONS.map(
                                (option) => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </MenuItem>
                                )
                            )}
                        </Field.Select>

                        <Divider />

                        {/* Attendance */}

                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                        >
                            Attendance Settings
                        </Typography>

                        <Field.MultiSelect
                            name="checkInMethods"
                            label="Check-in Methods"
                            chip
                            options={CHECK_IN_METHOD_OPTIONS}
                        />

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>

                            <Field.Checkbox name="allowCheckOut" label="Allow Check-out" />

                            <Field.Checkbox name="enableBreaks" label="Enable Breaks" />

                            <Field.Checkbox name="phoneCheckIn" label="Allow Phone Check-in" />

                        </Box>

                        <Field.Select
                            name="screenTimeout"
                            label="Screen Timeout"
                        >
                            {SCREEN_TIMEOUT_OPTIONS.map(
                                (option) => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </MenuItem>
                                )
                            )}
                        </Field.Select>

                        <Divider />

                        {/* Kiosk Access */}

                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                        >
                            Kiosk Access
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Field.Checkbox name="showPeeps" label="Show PEEPs" />

                            <Field.Checkbox
                                name="allowVisitorCheckIn"
                                label="Allow Visitor Check-in"
                            />

                            <Field.Checkbox
                                name="allowOfflineMode"
                                label="Allow Offline Mode"
                            />
                        </Box>

                        <Divider />

                        {/* Reception */}

                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                        >
                            Reception Settings
                        </Typography>

                        <Field.Text
                            name="receptionIdentifier"
                            label="Reception Identifier"
                            placeholder="e.g. FRONT-DESK"
                        />

                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>

                    <LoadingButton
                        type="submit"
                        variant="contained"
                        loading={isSubmitting}
                    >
                        {isEdit
                            ? 'Save Changes'
                            : 'Register Kiosk'}
                    </LoadingButton>
                </DialogActions>
            </Form>
        </Dialog>
    );
}