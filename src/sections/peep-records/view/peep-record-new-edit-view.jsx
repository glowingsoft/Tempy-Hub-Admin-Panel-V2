import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import LinearProgress from '@mui/material/LinearProgress';

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

    const recordDisplayName =
        currentRecord?.resident?.name ||
        currentRecord?.residentName ||
        currentRecord?.name ||
        (isEdit ? 'Edit record' : 'New');

    return (
        <DashboardContent>
            {isLoadingRecord && (
                <LinearProgress
                    color="primary"
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        height: 3,
                    }}
                />
            )}

            <CustomBreadcrumbs
                heading={isEdit ? 'Edit PEEP record' : 'Create PEEP record'}
                links={[
                    { name: 'Dashboard', href: base.root },
                    { name: 'PEEP & Floor Plans', href: base.peepAndFloorPlans.root },
                    { name: 'PEEP Records', href: base.peepAndFloorPlans.records.root },
                    { name: isEdit ? (isLoadingRecord ? 'Loading...' : recordDisplayName) : 'New' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />
            <PeepRecordNewEditForm
                currentRecord={currentRecord}
                isLoadingRecord={isLoadingRecord}
                ownerDashboard={ownerDashboard}
            />
        </DashboardContent>
    );
}