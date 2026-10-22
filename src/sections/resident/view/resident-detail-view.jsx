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
import { LoadingScreen } from 'src/components/loading-screen';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { useParams, usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fDateTime } from 'src/utils/format-time';

import { useGetResidentQuery } from 'src/store/Reducer/residents-api';
import { useGetPeepRecordsQuery } from 'src/store/Reducer/peep-floor-plan-api';
import { getPeepLevelMeta, getPeepRecordById, PEEP_RECORDS } from 'src/sections/peep-records/mocks/data';

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

    const { organizationId } = useCurrentOrganization();

    const {
        data: apiResident,
        isLoading,
        isFetching,
    } = useGetResidentQuery(
        { residentId: id, organizationId },
        { skip: !organizationId || !id }
    );

    // Fetch PEEP records from PEEP records API
    const {
        data: apiPeepData,
        isLoading: isPeepLoading,
        isFetching: isPeepFetching,
    } = useGetPeepRecordsQuery(
        { organizationId, residentId: id, limit: 100 },
        { skip: !organizationId || !id }
    );

    const securityDialog = useBoolean();
    const editDialog = useBoolean();
    const [showPassword, setShowPassword] = useState(false);

    const [mockResident, setMockResident] = useState(() => getMockResidentById(id));
    const [localResident, setLocalResident] = useState(null);

    const resident = localResident || apiResident || mockResident;

    const peepRecordId =
        resident?.peepRecordId ||
        resident?.peepId ||
        resident?.peepRecord?._id ||
        resident?.peepRecord?.id ||
        resident?.peep?._id ||
        resident?.peep?.id ||
        (typeof resident?.peepRecord === 'string' ? resident.peepRecord : null) ||
        (typeof resident?.peep === 'string' ? resident.peep : null);

    const mockPeepRecord = useMemo(() => {
        if (!id && !resident?._id) return null;
        const lookupId = peepRecordId || resident?._id || id;
        return (
            getPeepRecordById(lookupId) ||
            PEEP_RECORDS.find((r) => r.residentId === id || r.residentId === resident?._id || r.id === lookupId) ||
            null
        );
    }, [id, resident?._id, peepRecordId]);

    const peepRecord = useMemo(() => {
        if (apiPeepData?.data && Array.isArray(apiPeepData.data)) {
            const found = apiPeepData.data.find((item) => {
                const itemResidentId =
                    (typeof item.resident === 'object' ? (item.resident?._id || item.resident?.id) : null) ||
                    item.residentId ||
                    (typeof item.resident === 'string' ? item.resident : null);
                return String(itemResidentId) === String(id) || String(item._id) === String(id);
            });
            if (found) return found;
        }
        return (
            (typeof resident?.peepRecord === 'object' && resident?.peepRecord ? resident.peepRecord : null) ||
            (typeof resident?.peep === 'object' && resident?.peep ? resident.peep : null) ||
            mockPeepRecord
        );
    }, [apiPeepData, id, resident?.peepRecord, resident?.peep, mockPeepRecord]);

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

    if ((isLoading || isFetching) && !resident) {
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
                            color="primary"
                            startIcon={<Iconify icon="solar:shield-keyhole-bold" />}
                            onClick={securityDialog.onTrue}
                        >
                            Edit Security
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Iconify icon="solar:pen-bold" />}
                            onClick={editDialog.onTrue}
                        >
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
                        <Avatar alt={resident.name} src={resident.image} sx={{ width: 56, height: 56, textTransform: 'capitalize' }}>
                            {resident.name?.charAt(0)}
                        </Avatar>
                        <Stack>
                            <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>{resident.name}</Typography>
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
            <Card sx={{ p: isPeepLoading || isPeepFetching ? 3 : peepRecord ? 3 : 0 }}>
                {isPeepLoading || isPeepFetching ? (
                    <LoadingScreen sx={{ py: 6 }} />
                ) : peepRecord ? (
                    <Box
                        sx={{
                            display: 'grid',
                            rowGap: 2.5,
                            columnGap: 3,
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                        }}
                    >
                        <DetailItem
                            label="Resident"
                            sx={{ textTransform: 'capitalize' }}
                            value={
                                peepRecord?.resident?.name ||
                                peepRecord?.residentName ||
                                (peepRecord?.resident
                                    ? `${peepRecord.resident.firstName || ''} ${peepRecord.resident.lastName || ''}`.trim()
                                    : '') ||
                                peepRecord?.name ||
                                '—'
                            }
                        />
                        <DetailItem
                            label="Email"
                            value={
                                peepRecord?.resident?.email ||
                                peepRecord?.email ||
                                '—'
                            }
                        />
                        <DetailItem
                            label="Room"
                            value={
                                peepRecord?.resident?.roomNumber ||
                                peepRecord?.roomNumber ||
                                '—'
                            }
                        />
                        <DetailItem
                            label="Site"
                            value={
                                (typeof peepRecord?.branch === 'object' ? peepRecord.branch?.name : null) ||
                                peepRecord?.branchName ||
                                (typeof peepRecord?.branch === 'string' ? peepRecord.branch : null) ||
                                '—'
                            }
                        />
                        <DetailItem
                            label="Floor"
                            value={
                                peepRecord?.floor ||
                                peepRecord?.pin?.floorPlan?.name ||
                                peepRecord?.floorPlan?.name ||
                                peepRecord?.floorNumber ||
                                '—'
                            }
                        />
                        <DetailItem
                            label="PEEP Level"
                            value={
                                (() => {
                                    const levelMeta = getPeepLevelMeta(
                                        peepRecord?.peepLevel || peepRecord?.level
                                    );
                                    return (
                                        <Label variant="soft" color={levelMeta.color}>
                                            {levelMeta.label}
                                        </Label>
                                    );
                                })()
                            }
                        />
                        <DetailItem label="Consent Status" value={formatStatus(peepRecord.consentStatus)} />
                        <DetailItem label="Review Due" value={formatDate(peepRecord.reviewDueAt)} />
                        <DetailItem label="Last Reviewed" value={formatDate(peepRecord.lastReviewedAt)} />
                        <DetailItem label="Primary Route" value={peepRecord.primaryRoute} />
                        <DetailItem label="Secondary Route" value={peepRecord.secondaryRoute} />
                        <DetailItem label="Equipment Required" value={peepRecord.equipmentRequired} />
                        <DetailItem label="Responsible Staff" value={peepRecord.responsibleStaff} />
                        <DetailItem
                            label="Support Needs"
                            value={peepRecord.supportNeeds || peepRecord.peepSummary}
                            sx={{ gridColumn: { sm: 'span 2' } }}
                        />
                        {peepRecord.mcaBestInterestNotes && (
                            <DetailItem
                                label="MCA Best-Interest Notes"
                                value={peepRecord.mcaBestInterestNotes}
                                sx={{ gridColumn: { sm: 'span 2' } }}
                            />
                        )}
                    </Box>
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

function DetailItem({ label, value, sx }) {
    const content = value === null || value === undefined || value === '' ? '—' : value;

    return (
        <Stack spacing={0.5} sx={sx}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {label}
            </Typography>
            <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
                {content}
            </Typography>
        </Stack>
    );
}

function formatDate(value) {
    return value ? fDateTime(value) : '—';
}

function formatStatus(value) {
    if (!value) return '—';

    return value
        .split(/[\s_-]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
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