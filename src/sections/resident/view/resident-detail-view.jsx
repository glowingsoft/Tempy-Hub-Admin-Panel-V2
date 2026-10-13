import { useMemo, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { useParams, usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useGetResidentQuery } from 'src/store/Reducer/residents-api';
import { getResidentPeepById } from 'src/sections/active-sections/peen-floor-plan/mocks/data';
import { ResidentPeepDrawer } from 'src/sections/active-sections/peen-floor-plan/resident-peep-drawer';

import {
    getMockResidentById,
    RESIDENT_CARE_LEVEL_OPTIONS,
    RESIDENT_STATUS_OPTIONS,
    RESIDENT_ADMISSION_STATUS_OPTIONS,
} from '../mocks/data';
import { ResidentAddEditDialog } from '../resident-add-edit-dialog';
import { ResidentSecurityDialog } from '../resident-security-dialog';

export function ResidentDetailView() {
    const { id } = useParams();
    const router = useRouter();
    const pathname = usePathname();

    const isOwner = pathname.startsWith(paths.owner.root);
    const isLineManager = pathname.startsWith(paths.lineManager.root);

    const { organizationId: currentOrgId } = useCurrentOrganization();
    const organizationId = isOwner ? currentOrgId : null;

    const {
        data: apiResident,
        isLoading,
        isFetching,
    } = useGetResidentQuery(
        { residentId: id, organizationId },
        { skip: !isOwner || !id }
    );

    const securityDialog = useBoolean();
    const editDialog = useBoolean();
    const [showPassword, setShowPassword] = useState(false);

    const [mockResident, setMockResident] = useState(() => getMockResidentById(id));
    const [localResident, setLocalResident] = useState(null);
    const [peepResident, setPeepResident] = useState(() => getResidentPeepById(id));

    const resident = isOwner ? (localResident || apiResident) : (localResident || mockResident);

    // This view is mounted under three different dashboards (site manager,
    // line manager, owner) — resolve the right breadcrumb/back links from the
    // current URL rather than needing a prop threaded through each page.
    const { dashboardRoot, residentsRoot } = useMemo(() => {
        if (isOwner) return { dashboardRoot: paths.owner.root, residentsRoot: paths.owner.residents.root };
        if (isLineManager) return { dashboardRoot: paths.lineManager.root, residentsRoot: paths.lineManager.residents };
        return { dashboardRoot: paths.siteManager.root, residentsRoot: paths.siteManager.residents.root };
    }, [isLineManager, isOwner]);

    const statusValue = resident?.admissionStatus || resident?.status;
    const status =
        RESIDENT_ADMISSION_STATUS_OPTIONS.find((option) => option.value === statusValue) ||
        RESIDENT_STATUS_OPTIONS.find((option) => option.value === statusValue);
    const careLevel = RESIDENT_CARE_LEVEL_OPTIONS.find((option) => option.value === resident?.careLevel);

    if (isOwner && (isLoading || isFetching) && !resident) {
        return (
            <DashboardContent>
                <Box sx={{ mb: 2 }}>
                    <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
                        Back
                    </Button>
                </Box>
                <Card sx={{ p: 3, mb: 3 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                        <Skeleton variant="circular" width={56} height={56} />
                        <Stack spacing={1} sx={{ width: 1 }}>
                            <Skeleton variant="text" width="40%" height={28} />
                            <Skeleton variant="text" width="25%" height={20} />
                        </Stack>
                    </Stack>
                </Card>
            </DashboardContent>
        );
    }

    if (!resident) {
        return (
            <DashboardContent>
                <Box sx={{ mb: 2 }}>
                    <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
                        Back
                    </Button>
                </Box>
                <EmptyContent filled title="Resident not found" sx={{ py: 10 }} />
            </DashboardContent>
        );
    }

    return (
        <DashboardContent>
            <Box sx={{ mb: 2 }}>
                <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
                    Back
                </Button>
            </Box>

            <CustomBreadcrumbs
                heading="Resident details"
                links={[
                    { name: 'Dashboard', href: dashboardRoot },
                    { name: 'Residents', href: residentsRoot },
                    { name: resident.name },
                ]}
                action={
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<Iconify icon="solar:shield-keyhole-bold" />}
                            onClick={securityDialog.onTrue}
                        >
                            Edit Security
                        </Button>
                        <Button variant="contained" startIcon={<Iconify icon="solar:pen-bold" />} onClick={editDialog.onTrue}>
                            Edit Resident
                        </Button>
                    </Stack>
                }
                sx={{ mb: 3 }}
            />

            <Card sx={{ p: 3, mb: 3 }}>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={3}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent="space-between"
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar alt={resident.name} src={resident.image} sx={{ width: 56, height: 56 }}>
                            {resident.name?.charAt(0)}
                        </Avatar>
                        <Stack>
                            <Typography variant="subtitle1">{resident.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {resident.email || '—'}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={4} flexWrap="wrap" useFlexGap>
                        <InfoItem label="Room" value={resident.roomNumber || '—'} />
                        <InfoItem label="Site" value={resident.branch?.name || resident.branchName || resident.branch || '—'} />
                        <InfoItem
                            label="Care level"
                            value={
                                <Label
                                    variant="soft"
                                    color={careLevel?.value === 'high' ? 'error' : careLevel?.value === 'medium' ? 'warning' : 'success'}
                                >
                                    {careLevel?.label || '—'}
                                </Label>
                            }
                        />
                        <InfoItem label="Status" value={<Label variant="soft" color={status?.color || 'default'}>{status?.label || '—'}</Label>} />
                        <InfoItem
                            label="Security password"
                            value={
                                <Stack direction="row" spacing={0.25} alignItems="center">
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                        {showPassword ? (resident.visitorPasscode || resident.securityPassword || '—') : '••••••••'}
                                    </Typography>
                                    <IconButton size="small" onClick={() => setShowPassword((prev) => !prev)}>
                                        <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} width={16} />
                                    </IconButton>
                                </Stack>
                            }
                        />
                    </Stack>
                </Stack>
            </Card>

            <Typography variant="h6" sx={{ mb: 1.5 }}>
                PEEP record
            </Typography>
            <Card sx={{ p: peepResident ? 3 : 0 }}>
                {peepResident ? (
                    <ResidentPeepDrawer inline resident={peepResident} onUpdate={setPeepResident} />
                ) : (
                    <EmptyContent
                        title="No PEEP record for this resident"
                        description="A Personal Emergency Evacuation Plan hasn't been created for them yet."
                        sx={{ py: 6 }}
                    />
                )}
            </Card>

            <ResidentSecurityDialog
                open={securityDialog.value}
                resident={resident}
                onClose={securityDialog.onFalse}
                onSave={setLocalResident}
                organizationId={organizationId}
            />

            <ResidentAddEditDialog
                open={editDialog.value}
                currentResident={resident}
                onClose={editDialog.onFalse}
                onSave={setLocalResident}
                ownerDashboard={isOwner}
                organizationId={organizationId}
            />
        </DashboardContent>
    );
}

function InfoItem({ label, value }) {
    return (
        <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
            <Box sx={{ typography: 'body2' }}>{value}</Box>
        </Stack>
    );
}
