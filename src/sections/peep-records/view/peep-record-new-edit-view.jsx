import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { LoadingScreen } from 'src/components/loading-screen';
import { EmptyContent } from 'src/components/empty-content';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';
import { useGetPeepRecordByIdQuery } from 'src/store/Reducer/peep-floor-plan-api';

import { getPeepRecordById } from '../mocks/data';
import { PeepRecordNewEditForm } from '../peep-record-new-edit-form';

export function PeepRecordNewEditView({ currentRecord: initialRecord, ownerDashboard = true }) {
    const { id } = useParams();
    const { user } = useSelector((state) => state.user);
    const { organizationId: currentOrgId } = useCurrentOrganization();
    const activeOrgId = currentOrgId || getOwnerOrganizationId(user);

    const mockRecord = useMemo(() => (id ? getPeepRecordById(id) : null), [id]);

    const {
        data: apiRecord,
        isLoading: isRecordLoading,
        isFetching: isRecordFetching,
        isError,
    } = useGetPeepRecordByIdQuery(
        { peepRecordId: id, organizationId: activeOrgId },
        { skip: !id || Boolean(mockRecord) }
    );

    const currentRecord = initialRecord || apiRecord || mockRecord;
    const isEdit = Boolean(id || currentRecord);
    const base = ownerDashboard ? paths.owner : paths.siteManager;

    const isLoadingRecord = Boolean(
        id && !mockRecord && !isError && (isRecordLoading || isRecordFetching || !currentRecord)
    );

    if (isLoadingRecord) {
        return (
            <DashboardContent>
                <CustomBreadcrumbs
                    heading="Edit PEEP record"
                    links={[
                        { name: 'Dashboard', href: base.root },
                        { name: 'PEEP & Floor Plans', href: base.peepAndFloorPlans.root },
                        { name: 'PEEP Records', href: base.peepAndFloorPlans.records.root },
                        { name: 'Loading...' },
                    ]}
                    sx={{ mb: { xs: 3, md: 5 } }}
                />
                <LoadingScreen sx={{ py: 10 }} />
            </DashboardContent>
        );
    }

    if (id && isError && !currentRecord) {
        return (
            <DashboardContent>
                <CustomBreadcrumbs
                    heading="Edit PEEP record"
                    links={[
                        { name: 'Dashboard', href: base.root },
                        { name: 'PEEP & Floor Plans', href: base.peepAndFloorPlans.root },
                        { name: 'PEEP Records', href: base.peepAndFloorPlans.records.root },
                        { name: 'Error' },
                    ]}
                    sx={{ mb: { xs: 3, md: 5 } }}
                />
                <EmptyContent filled title="PEEP record not found" sx={{ py: 10 }} />
            </DashboardContent>
        );
    }

    const recordDisplayName =
        currentRecord?.resident?.name ||
        currentRecord?.residentName ||
        currentRecord?.name ||
        (isEdit ? 'Edit record' : 'New');

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading={isEdit ? 'Edit PEEP record' : 'Create PEEP record'}
                links={[
                    { name: 'Dashboard', href: base.root },
                    { name: 'PEEP & Floor Plans', href: base.peepAndFloorPlans.root },
                    { name: 'PEEP Records', href: base.peepAndFloorPlans.records.root },
                    { name: recordDisplayName },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />
            <PeepRecordNewEditForm
                currentRecord={currentRecord}
                ownerDashboard={ownerDashboard}
            />
        </DashboardContent>
    );
}