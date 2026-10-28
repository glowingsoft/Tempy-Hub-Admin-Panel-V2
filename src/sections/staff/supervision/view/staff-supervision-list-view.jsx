import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useTable, TableHeadCustom, TableNoData, TablePaginationCustom } from 'src/components/table';
import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { fDate, fDateTime } from 'src/utils/format-time';

import { StaffDocumentPreviewDialog } from '../../documents/view/staff-document-preview-dialog';
import {
    staffSupervisionSessions,
    staffSupervisionSummary,
    staffUpcomingSupervision,
    getStaffSupervisionStatus,
    signOffMockActionPoint,
} from '../mocks/data';

const TABLE_HEAD = [
    { id: 'expand', label: '', width: 48 },
    { id: 'date', label: 'Date', width: 150 },
    { id: 'type', label: 'Type', width: 160 },
    { id: 'conductedBy', label: 'Conducted by', minWidth: 180 },
    { id: 'actionPoints', label: 'Action points', minWidth: 160 },
    { id: 'document', label: 'Document', width: 130 },
    { id: 'status', label: 'Status', width: 130, align: 'center' },
];

const STATUS_META = {
    current: { label: 'Current', color: 'success' },
    dueSoon: { label: 'Due soon', color: 'warning' },
    overdue: { label: 'Overdue', color: 'error' },
    upcoming: { label: 'Upcoming', color: 'info' },
    completed: { label: 'Completed', color: 'success' },
};

function StatusLabel({ status }) {
    const meta = STATUS_META[status] || { label: status, color: 'default' };
    return <Label variant="soft" color={meta.color}>{meta.label}</Label>;
}

export function StaffSupervisionListView({ heading, dashboardHref, type: explicitType }) {
    const pathname = usePathname();
    const table = useTable();
    const currentMonth = dayjs();

    const viewType = useMemo(() => {
        if (explicitType) return explicitType;
        if (pathname?.includes('/appraisals') || pathname?.includes('/appraisal')) return 'appraisal';
        if (pathname?.includes('/supervision')) return 'supervision';
        return 'all';
    }, [explicitType, pathname]);

    const supervisionStatus = getStaffSupervisionStatus(staffSupervisionSummary.supervision.nextDueAt, currentMonth);
    const appraisalStatus = getStaffSupervisionStatus(staffSupervisionSummary.appraisal.nextDueAt, currentMonth);

    const filteredSessions = useMemo(() => {
        if (viewType === 'supervision') {
            return staffSupervisionSessions.filter((s) => s.type === 'supervision');
        }
        if (viewType === 'appraisal') {
            return staffSupervisionSessions.filter((s) => s.type === 'appraisal');
        }
        return staffSupervisionSessions;
    }, [viewType]);

    const paginatedSessions = useMemo(() => {
        const start = table.page * table.rowsPerPage;
        return filteredSessions.slice(start, start + table.rowsPerPage);
    }, [table.page, table.rowsPerPage, filteredSessions]);

    const resolvedDashboardHref = useMemo(() => {
        if (dashboardHref) return dashboardHref;
        if (pathname?.startsWith('/owner-dashboard')) return paths.owner.root;
        if (pathname?.startsWith('/site-manager')) return paths.siteManager.root;
        return paths.staff.dashboard;
    }, [dashboardHref, pathname]);

    const resolvedHeading = useMemo(() => {
        if (heading) return heading;
        if (viewType === 'supervision') return 'Supervision';
        if (viewType === 'appraisal') return 'Appraisal';
        if (pathname?.startsWith('/owner-dashboard') || pathname?.startsWith('/site-manager')) {
            return 'Supervision & Appraisal';
        }
        return 'My Supervision & Appraisal';
    }, [heading, pathname, viewType]);

    // Bumped after a sign-off so rows re-render — `signOffMockActionPoint`
    // mutates the mock array in place rather than replacing it.
    const [reloadKey, setReloadKey] = useState(0);
    const [previewDocument, setPreviewDocument] = useState(null);

    const handleSignOff = (sessionId, actionPointId) => {
        signOffMockActionPoint(sessionId, actionPointId);
        setReloadKey((key) => key + 1);
    };

    const showSupervisionCard = viewType === 'supervision' || viewType === 'all';
    const showAppraisalCard = viewType === 'appraisal' || viewType === 'all';
    const hasUpcoming = staffUpcomingSupervision && (viewType === 'all' || staffUpcomingSupervision.type === viewType);

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading={resolvedHeading}
                links={[{ name: 'Dashboard', href: resolvedDashboardHref }, { name: resolvedHeading }]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Grid container spacing={3} sx={{ mb: 3 }}>
                {showSupervisionCard && (
                    <Grid xs={12} md={showAppraisalCard ? 6 : 12}>
                        <SummaryCard
                            title="Supervision"
                            frequency={staffSupervisionSummary.supervision.frequency}
                            summary={`${staffSupervisionSummary.supervision.completedThisYear} of ${staffSupervisionSummary.supervision.expectedThisYear} completed this year`}
                            lastDate={staffSupervisionSummary.supervision.lastCompletedAt}
                            nextDate={staffSupervisionSummary.supervision.nextDueAt}
                            status={supervisionStatus}
                        />
                    </Grid>
                )}
                {showAppraisalCard && (
                    <Grid xs={12} md={showSupervisionCard ? 6 : 12}>
                        <SummaryCard
                            title="Appraisal"
                            frequency={staffSupervisionSummary.appraisal.frequency}
                            summary={`${staffSupervisionSummary.appraisal.completedThisYear} of ${staffSupervisionSummary.appraisal.expectedThisYear} completed this year`}
                            lastDate={staffSupervisionSummary.appraisal.lastCompletedAt}
                            nextDate={staffSupervisionSummary.appraisal.nextDueAt}
                            status={appraisalStatus}
                        />
                    </Grid>
                )}
            </Grid>

            {hasUpcoming && (
                <>
                    <Typography variant="h6" sx={{ mb: 1.5 }}>Upcoming</Typography>
                    <Card sx={{ mb: 3, p: 2.5 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between">
                            <Box>
                                <Typography variant="body1" fontWeight={600}>
                                    {staffUpcomingSupervision.type[0].toUpperCase() + staffUpcomingSupervision.type.slice(1)} session — {fDateTime(staffUpcomingSupervision.sessionDate)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    With {staffUpcomingSupervision.conductedBy} · {staffUpcomingSupervision.location}
                                </Typography>
                            </Box>
                            <StatusLabel status={staffUpcomingSupervision.status} />
                        </Stack>
                    </Card>
                </>
            )}

            <Typography variant="h6" sx={{ mb: 1.5 }}>History</Typography>
            <Card>
                <TableContainer>
                    <Scrollbar>
                        <Table size={table.dense ? 'small' : 'medium'}>
                            <TableHeadCustom headLabel={TABLE_HEAD} />
                            <TableBody key={reloadKey}>
                                {paginatedSessions.map((session) => (
                                    <SessionRow
                                        key={session._id}
                                        session={session}
                                        onSignOff={handleSignOff}
                                        onViewDocument={setPreviewDocument}
                                    />
                                ))}
                                <TableNoData notFound={!filteredSessions.length} title="No sessions recorded" />
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </TableContainer>
                <TablePaginationCustom
                    page={table.page}
                    dense={table.dense}
                    count={filteredSessions.length}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    onChangeDense={table.onChangeDense}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                />
            </Card>

            <StaffDocumentPreviewDialog
                document={previewDocument}
                open={!!previewDocument}
                onClose={() => setPreviewDocument(null)}
            />
        </DashboardContent>
    );
}

function SessionRow({ session, onSignOff, onViewDocument }) {
    const expanded = useBoolean();
    const actionPoints = session.actionPoints || [];
    const signedOffCount = actionPoints.filter((item) => item.signedOff).length;

    return (
        <>
            <TableRow hover>
                <TableCell>
                    {!!actionPoints.length && (
                        <IconButton size="small" onClick={expanded.onToggle}>
                            <Iconify
                                icon="eva:arrow-ios-downward-fill"
                                sx={{ transform: expanded.value ? 'rotate(180deg)' : 'none' }}
                            />
                        </IconButton>
                    )}
                </TableCell>
                <TableCell>{fDate(session.sessionDate)}</TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>{session.type}</TableCell>
                <TableCell>{session.conductedBy}</TableCell>
                <TableCell>
                    {actionPoints.length ? `${signedOffCount}/${actionPoints.length} signed off` : '—'}
                </TableCell>
                <TableCell>
                    {session.document ? (
                        <Button
                            size="small"
                            color="inherit"
                            startIcon={<Iconify icon="solar:file-text-bold" width={18} />}
                            onClick={() => onViewDocument(session.document)}
                        >
                            View
                        </Button>
                    ) : '—'}
                </TableCell>
                <TableCell align="center"><StatusLabel status={session.status} /></TableCell>
            </TableRow>

            {!!actionPoints.length && (
                <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} sx={{ py: 0, borderBottom: expanded.value ? undefined : 'none' }}>
                        <Collapse in={expanded.value} unmountOnExit>
                            <Stack spacing={0.5} sx={{ py: 1.5, pl: 5 }}>
                                {actionPoints.map((point) => (
                                    <Stack key={point.id} direction="row" alignItems="center" spacing={1}>
                                        <Checkbox
                                            size="small"
                                            checked={point.signedOff}
                                            onChange={() => onSignOff(session._id, point.id)}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: point.signedOff ? 'text.disabled' : 'text.primary',
                                                textDecoration: point.signedOff ? 'line-through' : 'none',
                                            }}
                                        >
                                            {point.text}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

function SummaryCard({ title, frequency, summary, lastDate, nextDate, status }) {
    return (
        <Card sx={{ p: 2.5, height: '100%' }}>
            <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
                    <StatusLabel status={status} />
                </Stack>
                <Typography variant="body2" color="text.secondary">Frequency: {frequency}</Typography>
                <Typography variant="body2" color="text.secondary">{summary}</Typography>
                <Typography variant="body2" color="text.secondary">Last completed: {fDate(lastDate)}</Typography>
                <Typography variant="body2" color={status === 'overdue' ? 'error.main' : 'text.secondary'}>Next due: {fDate(nextDate)}</Typography>
            </Stack>
        </Card>
    );
}

StaffSupervisionListView.propTypes = {
    heading: PropTypes.string,
    dashboardHref: PropTypes.string,
    type: PropTypes.string,
};