import { useEffect, useMemo, useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { toast } from 'src/components/snackbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { LoadingScreen } from 'src/components/loading-screen';
import { DashboardContent } from 'src/layouts/dashboard';
import { useParams, usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useGetAssignmentQuery, useUpdateAssignmentMutation } from 'src/store/Reducer/assignments-api';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { fDate, fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

const STATUS_COLORS = {
    valid: 'success',
    completed: 'success',
    in_progress: 'warning',
    overdue: 'error',
    expired: 'error',
};

function displayDate(value) {
    return value ? fDate(value) : '—';
}

function displayDateTime(value) {
    return value ? fDateTime(value) : '—';
}

function displayFiles(files) {
    const entries = Array.isArray(files) ? files : files ? [files] : [];
    return (
        entries
            .map((file) => (typeof file === 'string' ? file : file?.name || file?.fileName))
            .filter(Boolean)
            .join(', ') || '—'
    );
}

/** Resolve staff display name from whatever shape the API returns */
function resolveStaffName(assignment) {
    const staffObj = assignment?.staffId;
    if (staffObj && typeof staffObj === 'object') {
        return (
            staffObj.name ||
            staffObj.fullName ||
            staffObj.displayName ||
            `${staffObj.firstName || ''} ${staffObj.lastName || ''}`.trim() ||
            staffObj.email ||
            staffObj._id
        );
    }
    return (
        assignment?.staffName ||
        assignment?.staff?.name ||
        assignment?.staff?.fullName ||
        assignment?.staff?.email ||
        (typeof staffObj === 'string' ? staffObj : null) ||
        '—'
    );
}

function resolveStaffEmail(assignment) {
    const staffObj = assignment?.staffId;
    if (staffObj && typeof staffObj === 'object') {
        return staffObj.email || '';
    }
    return assignment?.staff?.email || '';
}

// ----------------------------------------------------------------------

function AssignmentDetailView() {
    const { id } = useParams();
    const pathname = usePathname();
    const router = useRouter();

    // Edit-due-date modal state
    const [editOpen, setEditOpen] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [renewalMonthsOverride, setRenewalMonthsOverride] = useState('');
    const [saveError, setSaveError] = useState('');

    const { organizationId } = useCurrentOrganization();
    const { data, isLoading, isError } = useGetAssignmentQuery(
        { assignmentId: id, organizationId },
        { skip: !id }
    );
    const [updateAssignment, { isLoading: isSaving }] = useUpdateAssignmentMutation();

    const assignment = data?.data ?? data;
    const requirement = assignment?.requirement || {};
    const records = Array.isArray(assignment?.records) ? assignment.records : [];
    const status = assignment?.status || 'unknown';
    const staffName = resolveStaffName(assignment);
    const staffEmail = resolveStaffEmail(assignment);

    const dashboardRoutes = useMemo(() => {
        if (pathname.startsWith(paths.siteManager.root)) {
            return { dashboard: paths.siteManager.root, compliance: paths.siteManager.teamCompliance };
        }
        if (pathname.startsWith(paths.owner.root)) {
            return { dashboard: paths.owner.root, compliance: paths.owner.teamCompliance };
        }
        return { dashboard: paths.lineManager.root, compliance: paths.lineManager.teamCompliance };
    }, [pathname]);

    // Sync local state when assignment loads
    useEffect(() => {
        if (!assignment) return;
        setDueDate(assignment.dueDate ? String(assignment.dueDate).slice(0, 10) : '');
        const months = assignment.renewalMonthsOverride ?? requirement.renewalMonths;
        setRenewalMonthsOverride(months == null ? '' : String(months));
        setSaveError('');
    }, [assignment, requirement.renewalMonths]);

    const handleOpenEdit = () => {
        setDueDate(assignment?.dueDate ? String(assignment.dueDate).slice(0, 10) : '');
        const months = assignment?.renewalMonthsOverride ?? requirement.renewalMonths;
        setRenewalMonthsOverride(months == null ? '' : String(months));
        setSaveError('');
        setEditOpen(true);
    };

    const handleCloseEdit = () => {
        if (isSaving) return;
        setEditOpen(false);
        setSaveError('');
    };

    const handleSave = async () => {
        if (!dueDate) {
            setSaveError('Due date is required.');
            return;
        }
        const renewalMonths = Number(renewalMonthsOverride);
        if (!renewalMonthsOverride || !Number.isInteger(renewalMonths) || renewalMonths < 0) {
            setSaveError('Renewal months must be a whole number of 0 or greater.');
            return;
        }
        setSaveError('');
        try {
            await updateAssignment({
                assignmentId: id,
                organizationId,
                data: { dueDate, renewalMonthsOverride: renewalMonths },
            }).unwrap();
            toast.success('Assignment updated successfully');
            setEditOpen(false);
        } catch (error) {
            const message = error?.data?.message || error?.message || 'Failed to update assignment';
            setSaveError(message);
            toast.error(message);
        }
    };

    // ── Loading / Error states ──────────────────────────────────────────────

    if (isLoading) {
        return (
            <DashboardContent>
                <Box sx={{ mb: 2 }}>
                    <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
                        Back
                    </Button>
                </Box>
                <LoadingScreen sx={{ py: 10 }} />
            </DashboardContent>
        );
    }

    if (isError || !assignment) {
        return (
            <DashboardContent>
                <Box sx={{ mb: 2 }}>
                    <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
                        Back
                    </Button>
                </Box>
                <EmptyContent
                    filled
                    title="Assignment not found"
                    description="Could not load the requested assignment details."
                    action={
                        <Button variant="contained" onClick={() => router.push(dashboardRoutes.compliance)}>
                            Return to Team Compliance
                        </Button>
                    }
                    sx={{ py: 10 }}
                />
            </DashboardContent>
        );
    }

    // ── Main render ─────────────────────────────────────────────────────────

    return (
        <DashboardContent>
            {/* Back button above breadcrumbs — same as appraisal detail */}
            <Box sx={{ mb: 2 }}>
                <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
                    Back
                </Button>
            </Box>

            {/* Breadcrumbs + Edit button */}
            <CustomBreadcrumbs
                heading="Assignment Detail"
                links={[
                    { name: 'Dashboard', href: dashboardRoutes.dashboard },
                    { name: 'Team Compliance', href: dashboardRoutes.compliance },
                    { name: requirement.name || 'Assignment' },
                ]}
                action={
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Iconify icon="solar:pen-bold" />}
                        onClick={handleOpenEdit}
                    >
                        Edit due date
                    </Button>
                }
                sx={{ mb: 3 }}
            />

            {/* Details Card */}
            <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
                <Stack spacing={2.5}>
                    {/* Staff / Requirement / Status header */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                        <Box>
                            <Typography variant="overline" color="text.secondary">
                                Staff
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                                {staffName}
                            </Typography>
                            {staffEmail && (
                                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'none' }}>
                                    {staffEmail}
                                </Typography>
                            )}
                        </Box>

                        <Box>
                            <Typography variant="overline" color="text.secondary">
                                Requirement
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={700}>
                                {requirement.name || '—'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                {requirement.type || '—'}
                            </Typography>
                        </Box>

                        <Label
                            variant="soft"
                            color={STATUS_COLORS[status] || 'default'}
                            sx={{ alignSelf: 'flex-start', textTransform: 'capitalize' }}
                        >
                            {status.replace(/_/g, ' ')}
                        </Label>
                    </Stack>

                    <Divider />

                    {/* Date / meta grid */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Due</Typography>
                            <Typography variant="body2" fontWeight={600}>{displayDate(assignment.dueDate)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Source</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                                {assignment.source || '—'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Assigned</Typography>
                            <Typography variant="body2" fontWeight={600}>{displayDateTime(assignment.assignedAt)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Expires</Typography>
                            <Typography variant="body2" fontWeight={600}>{displayDate(assignment.expiresAt)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Completed</Typography>
                            <Typography variant="body2" fontWeight={600}>{displayDate(assignment.completedAt)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Renewal months override</Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {assignment.renewalMonthsOverride ?? '—'}
                            </Typography>
                        </Grid>
                    </Grid>
                </Stack>
            </Card>

            {/* Records Card */}
            <Card>
                <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6">Records</Typography>
                </Box>
                <Box sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 640 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Completed</TableCell>
                                <TableCell>Expires</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell>Files</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {records.length ? (
                                records.map((record, index) => (
                                    <TableRow key={record._id || index}>
                                        <TableCell>{displayDate(record.completedAt)}</TableCell>
                                        <TableCell>{displayDate(record.expiresAt)}</TableCell>
                                        <TableCell>{record.notes || '—'}</TableCell>
                                        <TableCell>{displayFiles(record.files)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary' }}>
                                        No records
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </Card>

            {/* ── Edit Due Date Modal ────────────────────────────────────────── */}
            <Dialog open={editOpen} onClose={handleCloseEdit} maxWidth="xs" fullWidth>
                <DialogTitle>Edit Due Date</DialogTitle>

                <DialogContent>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        {saveError && (
                            <Alert severity="error" onClose={() => setSaveError('')}>
                                {saveError}
                            </Alert>
                        )}

                        <TextField
                            label="Due date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            label="Renewal months override"
                            type="number"
                            value={renewalMonthsOverride}
                            onChange={(e) => setRenewalMonthsOverride(e.target.value)}
                            inputProps={{ min: 0, step: 1 }}
                            fullWidth
                            required
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button color="inherit" onClick={handleCloseEdit} disabled={isSaving}>
                        Cancel
                    </Button>
                    <LoadingButton variant="contained" color="primary" onClick={handleSave} loading={isSaving}>
                        Save changes
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </DashboardContent>
    );
}

export default AssignmentDetailView;
