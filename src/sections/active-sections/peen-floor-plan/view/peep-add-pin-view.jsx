import { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { useParams, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { mockBranches } from 'src/sections/branch/mocks/data';

import { FloorPlanPin } from '../floor-plan-pin';
import { FloorPlanDrawing, PdfImageFallback } from '../floor-plan-viewer';
import {
    createResidentPeepPin,
    FLOOR_PLAN,
    FLOOR_PLAN_PINS,
    getFloorPlanFile,
    getFloorPlanPins,
    PEEP_LEVELS,
    RESIDENTS,
} from '../mocks/data';

const EMPTY_PEEP = {
    peepLevel: 'low',
    supportNeeds: '',
    primaryRoute: '',
    secondaryRoute: '',
    equipmentRequired: '',
    responsibleStaff: '',
};

export function PeepAddPinView({ ownerDashboard = true }) {
    const router = useRouter();
    const { siteId } = useParams();
    const base = ownerDashboard ? paths.owner : paths.siteManager;

    const site = useMemo(() => mockBranches.find((branch) => branch._id === siteId), [siteId]);
    const mapPath = base.peepAndFloorPlans.map(siteId);

    // Uploaded PDF or fallback to default site floor plan
    const floorPlanFile = useMemo(() => getFloorPlanFile() || FLOOR_PLAN, []);

    const [mode, setMode] = useState('existing');
    const [residentId, setResidentId] = useState('');
    const [newResident, setNewResident] = useState({ name: '', roomNumber: '' });
    const [peep, setPeep] = useState(EMPTY_PEEP);
    const [pendingPoint, setPendingPoint] = useState(null);
    const [imgError, setImgError] = useState(false);

    const residentsById = useMemo(
        () => RESIDENTS.reduce((acc, resident) => ({ ...acc, [resident.id]: resident }), {}),
        []
    );

    const currentPins = useMemo(() => getFloorPlanPins() || [], []);

    const unpinnedResidents = useMemo(
        () => RESIDENTS.filter((resident) => !currentPins.some((pin) => pin.residentId === resident.id)),
        [currentPins]
    );

    const isWhoStepValid =
        mode === 'existing' ? !!residentId : !!(newResident.name.trim() && newResident.roomNumber.trim());
    const canSave = isWhoStepValid && !!pendingPoint && !!floorPlanFile;

    const handlePlanClick = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPendingPoint({
            x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
            y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
        });
    };

    const handleSave = () => {
        if (!canSave) return;

        const { resident } = createResidentPeepPin({
            resident:
                mode === 'existing'
                    ? { id: residentId }
                    : { name: newResident.name.trim(), roomNumber: newResident.roomNumber.trim() },
            peep,
            pin: pendingPoint,
        });

        toast.success(`${resident.name}'s PEEP record and pin were saved.`);
        router.push(mapPath);
    };

    return (
        <DashboardContent>
            <Box sx={{ mb: 2 }}>
                <Button onClick={() => router.push(mapPath)} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
                    Back to floor map
                </Button>
            </Box>

            <CustomBreadcrumbs
                heading="Add Pin"
                links={[
                    { name: 'Dashboard', href: base.root },
                    { name: 'PEEP & Floor Plans', href: base.peepAndFloorPlans.root },
                    { name: site?.name || 'Site', href: base.peepAndFloorPlans.site(siteId) },
                    { name: 'Floor Map', href: mapPath },
                    { name: 'Add Pin' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Stack spacing={3}>
                <Card sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                        Step 1 — Who is this pin for?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                        Choose an existing resident, or add a new one without leaving this screen.
                    </Typography>

                    <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
                        <Button
                            fullWidth
                            variant={mode === 'existing' ? 'contained' : 'outlined'}
                            onClick={() => setMode('existing')}
                        >
                            Existing resident
                        </Button>
                        <Button
                            fullWidth
                            variant={mode === 'new' ? 'contained' : 'outlined'}
                            startIcon={<Iconify icon="mingcute:add-line" />}
                            onClick={() => setMode('new')}
                        >
                            New resident
                        </Button>
                    </Stack>

                    {mode === 'existing' ? (
                        <TextField
                            select
                            fullWidth
                            label="Resident"
                            value={residentId}
                            onChange={(event) => {
                                const id = event.target.value;
                                setResidentId(id);
                                const selected = residentsById[id];
                                if (selected) {
                                    setPeep((prev) => ({
                                        ...prev,
                                        peepLevel: selected.peepLevel || prev.peepLevel,
                                        supportNeeds: selected.supportNeeds || prev.supportNeeds,
                                        primaryRoute: selected.primaryRoute || prev.primaryRoute,
                                        secondaryRoute: selected.secondaryRoute || prev.secondaryRoute,
                                        equipmentRequired: selected.equipmentRequired || prev.equipmentRequired,
                                        responsibleStaff: selected.responsibleStaff || prev.responsibleStaff,
                                    }));
                                }
                            }}
                            helperText="Select a resident to place or update their room pin on the floor plan"
                        >
                            {RESIDENTS.map((resident) => {
                                const isPinned = currentPins.some((pin) => pin.residentId === resident.id);
                                return (
                                    <MenuItem key={resident.id} value={resident.id}>
                                        Room {resident.roomNumber} — {resident.name} {isPinned ? '(Pinned)' : ''}
                                    </MenuItem>
                                );
                            })}
                        </TextField>
                    ) : (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                label="Full name"
                                placeholder="e.g. George Hall"
                                value={newResident.name}
                                onChange={(event) => setNewResident((prev) => ({ ...prev, name: event.target.value }))}
                            />
                            <TextField
                                fullWidth
                                label="Room number"
                                placeholder="e.g. 205"
                                value={newResident.roomNumber}
                                onChange={(event) => setNewResident((prev) => ({ ...prev, roomNumber: event.target.value }))}
                            />
                        </Stack>
                    )}
                </Card>

                <Card sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                        Step 2 — PEEP record for this resident
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                        Set their evacuation plan now, or leave the level as "Low" and complete it later.
                    </Typography>

                    <Stack spacing={2.5}>
                        <TextField
                            select
                            fullWidth
                            label="PEEP level"
                            value={peep.peepLevel}
                            onChange={(event) => setPeep((prev) => ({ ...prev, peepLevel: event.target.value }))}
                        >
                            {Object.entries(PEEP_LEVELS).map(([value, level]) => (
                                <MenuItem key={value} value={value}>
                                    {level.label} - {level.description}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Support needs"
                            placeholder="e.g. Requires two-person assist, uses a wheelchair full-time..."
                            value={peep.supportNeeds}
                            onChange={(event) => setPeep((prev) => ({ ...prev, supportNeeds: event.target.value }))}
                        />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                label="Primary evacuation route"
                                placeholder="e.g. West fire exit"
                                value={peep.primaryRoute}
                                onChange={(event) => setPeep((prev) => ({ ...prev, primaryRoute: event.target.value }))}
                            />
                            <TextField
                                fullWidth
                                label="Secondary evacuation route"
                                placeholder="e.g. South corridor"
                                value={peep.secondaryRoute}
                                onChange={(event) => setPeep((prev) => ({ ...prev, secondaryRoute: event.target.value }))}
                            />
                        </Stack>

                        <TextField
                            fullWidth
                            label="Equipment required"
                            placeholder="e.g. Evacuation chair"
                            value={peep.equipmentRequired}
                            onChange={(event) => setPeep((prev) => ({ ...prev, equipmentRequired: event.target.value }))}
                        />

                        <TextField
                            fullWidth
                            label="Responsible staff"
                            placeholder="e.g. Sarah K., Maria R."
                            value={peep.responsibleStaff}
                            onChange={(event) => setPeep((prev) => ({ ...prev, responsibleStaff: event.target.value }))}
                        />
                    </Stack>
                </Card>

                <Card sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                        Step 3 — Place the pin
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                        Click the correct room on the floor plan below.
                    </Typography>

                    {!floorPlanFile ? (
                        <Alert severity="warning">
                            No floor plan has been uploaded yet. Go back to the floor map and upload a PDF before
                            placing a pin.
                        </Alert>
                    ) : (
                        <>
                            <Box
                                onClick={handlePlanClick}
                                sx={{
                                    position: 'relative',
                                    width: 1,
                                    aspectRatio: '1.55',
                                    bgcolor: 'common.white',
                                    boxShadow: (theme) => theme.customShadows?.z8,
                                    cursor: 'crosshair',
                                    overflow: 'hidden',
                                    borderRadius: 1,
                                }}
                            >
                                {floorPlanFile.imageUrl && !imgError ? (
                                    <Box
                                        component="img"
                                        src={floorPlanFile.imageUrl}
                                        alt={floorPlanFile.fileName || 'Floor Plan'}
                                        onError={() => setImgError(true)}
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            width: 1,
                                            height: 1,
                                            objectFit: 'contain',
                                            bgcolor: 'common.white',
                                            pointerEvents: 'none',
                                            userSelect: 'none',
                                        }}
                                    />
                                ) : floorPlanFile.url || floorPlanFile.file ? (
                                    <PdfImageFallback plan={floorPlanFile} />
                                ) : (
                                    <FloorPlanDrawing />
                                )}

                                {currentPins.map((pin) => {
                                    const resident = residentsById[pin.residentId];
                                    if (!resident) return null;
                                    return (
                                        <FloorPlanPin
                                            key={pin.id}
                                            pin={pin}
                                            resident={resident}
                                            onClick={(event) => event.stopPropagation()}
                                        />
                                    );
                                })}

                                {pendingPoint && (
                                    <FloorPlanPin
                                        pin={{
                                            id: 'pending-point-pin',
                                            residentId: residentId || 'new-resident',
                                            x: pendingPoint.x,
                                            y: pendingPoint.y,
                                        }}
                                        resident={{
                                            id: residentId || 'new-resident',
                                            name:
                                                mode === 'existing'
                                                    ? residentsById[residentId]?.name || 'Selected resident'
                                                    : newResident.name || 'New resident',
                                            roomNumber:
                                                mode === 'existing'
                                                    ? residentsById[residentId]?.roomNumber || ''
                                                    : newResident.roomNumber || '',
                                            peepLevel: peep.peepLevel || 'low',
                                        }}
                                        onClick={(event) => event.stopPropagation()}
                                    />
                                )}
                            </Box>

                            {!pendingPoint && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Click anywhere on the plan to drop the pin.
                                </Typography>
                            )}
                        </>
                    )}
                </Card>

                <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                    <Button color="inherit" onClick={() => router.push(mapPath)}>
                        Cancel
                    </Button>
                    <Button variant="contained" disabled={!canSave} onClick={handleSave}>
                        Save resident, PEEP record &amp; pin
                    </Button>
                </Stack>
            </Stack>
        </DashboardContent>
    );
}
