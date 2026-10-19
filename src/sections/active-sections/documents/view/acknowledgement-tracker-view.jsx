import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { DashboardContent } from 'src/layouts/dashboard';
import { useParams, usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { getDocumentById } from '../mocks/data';
import { AcknowledgementStaffTable } from './acknowledgement-staff-table';
import { AcknowledgementSummaryCard } from './acknowledgement-summary-card';

const SUMMARY_ITEMS = [
    { title: 'Assigned', key: 'assigned', color: 'primary', icon: 'ic-users' },
    { title: 'Acknowledged', key: 'acknowledged', color: 'success', icon: 'ic-check' },
    { title: 'Pending', key: 'pending', color: 'warning', icon: 'ic-clock' },
    { title: 'Overdue', key: 'overdue', color: 'error', icon: 'ic-compliance' },
];

export function AcknowledgementTrackerView() {
    const { id } = useParams();
    const pathname = usePathname();
    const document = getDocumentById(id);

    if (!document) {
        return (
            <DashboardContent>
                <EmptyContent filled title="Document not found" sx={{ py: 10 }} />
            </DashboardContent>
        );
    }

    const stats = document.acknowledgementStats || {};
    const assignedCount = stats.assigned || 0;
    const summary = {
        assigned: assignedCount,
        acknowledged: stats.acknowledged || 0,
        pending: Math.max(assignedCount - (stats.acknowledged || 0), 0),
        overdue: Math.min(stats.overdue || 0, Math.max(assignedCount - (stats.acknowledged || 0), 0)),
    };
    const documentsPath = `${pathname.slice(0, pathname.indexOf('/documents/'))}/documents`;
    const dashboardPath = pathname.startsWith('/owner-dashboard')
        ? paths.owner.root
        : pathname.startsWith('/line-manager')
            ? paths.lineManager.root
            : paths.siteManager.root;

    return (
        <DashboardContent maxWidth="xl">
            <CustomBreadcrumbs
                heading="Acknowledgement tracker"
                links={[
                    { name: 'Dashboard', href: dashboardPath },
                    { name: 'Documents', href: documentsPath },
                    { name: 'Acknowledgements' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                    {SUMMARY_ITEMS.map((item) => (
                        <Grid key={item.key} xs={12} sm={6} md={3}>
                            <AcknowledgementSummaryCard
                                title={item.title}
                                total={summary[item.key]}
                                color={item.color}
                                icon={item.icon}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <AcknowledgementStaffTable documentId={id} />
        </DashboardContent>
    );
}