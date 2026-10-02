import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PeepRecordNewEditForm } from '../peep-record-new-edit-form';

export function PeepRecordNewEditView({ currentRecord, ownerDashboard = true }) {
    const isEdit = Boolean(currentRecord);
    const base = ownerDashboard ? paths.owner : paths.siteManager;

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading={isEdit ? 'Edit PEEP record' : 'Create PEEP record'}
                links={[
                    { name: 'Dashboard', href: base.root },
                    { name: 'PEEP & Floor Plans', href: base.peepAndFloorPlans.root },
                    { name: 'PEEP Records', href: base.peepAndFloorPlans.records.root },
                    { name: isEdit ? currentRecord.name : 'New' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />
            <PeepRecordNewEditForm currentRecord={currentRecord} ownerDashboard={ownerDashboard} />
        </DashboardContent>
    );
}
