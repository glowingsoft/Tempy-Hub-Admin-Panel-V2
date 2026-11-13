import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';

import { useCanManage } from 'src/auth/hooks';
import { ModuleSlug } from 'src/auth/permissions';
import { DashboardContent } from 'src/layouts/dashboard';

import {
  getFloorPlanFile,
  getFloorPlanPins,
  setFloorPlanPins,
  RESIDENTS,
  setFloorPlanFile,
} from '../mocks/data';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog/confirm-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useParams, useSearchParams, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useGetPeepRecordsQuery } from 'src/store/Reducer/peep-floor-plan-api';
import {
  useCreateFloorPlanPinMutation,
  useDeleteFloorPlanPinMutation,
  useGetFloorPlanByIdQuery,
} from 'src/store/Reducer/floor-plans-api';
import { RouterLink } from 'src/routes/components';
import { toast } from 'src/components/snackbar';
import { mockBranches } from 'src/sections/branch/mocks/data';
import { FloorPlanViewer } from '../floor-plan-viewer';
import { ResidentPeepDrawer } from '../resident-peep-drawer';
import { UploadFloorPlanDialog } from '../upload-floor-plan-dialog';

export function PeepFloorPlanView({ ownerDashboard = false, siteManagerDashboard = false }) {
  const canManagePeep = useCanManage(ModuleSlug.PEEP_FLOOR_PLAN);
  // Owner and Site Manager both reach this screen with the site id in the
  // URL (Org Rollup -> site -> map) and share the same routed flow. A bare
  // dashboard (e.g. admin) mounts this without a site-scoped route at all.
  const { siteId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const floorPlanId = searchParams.get('floorPlanId');
  const { organizationId } = useCurrentOrganization();

  const {
    data: apiFloorPlan,
    isLoading: isFloorPlanLoading,
    isError: isFloorPlanError,
    error: floorPlanError,
  } = useGetFloorPlanByIdQuery(
    { floorPlanId, organizationId },
    { skip: !floorPlanId || !organizationId }
  );
  const [createFloorPlanPin, { isLoading: isCreatingPin }] = useCreateFloorPlanPinMutation();
  const [deleteFloorPlanPin, { isLoading: isDeletingPin }] = useDeleteFloorPlanPinMutation();
  const [pinToDelete, setPinToDelete] = useState(null);

  const floorPlanBranchId = apiFloorPlan?.branchId || siteId;
  const residentPickerContextKey = `${organizationId || ''}:${floorPlanBranchId || ''}:${floorPlanId || ''}`;
  const { data: apiPeepRecords } = useGetPeepRecordsQuery(
    {
      organizationId,
      branchId: floorPlanBranchId,
      page: 1,
      limit: 100,
    },
    { skip: !floorPlanId || !organizationId || !floorPlanBranchId }
  );

  const apiResidents = useMemo(
    () =>
      Array.isArray(apiPeepRecords?.data)
        ? apiPeepRecords.data.map(mapPeepRecord).filter(Boolean)
        : [],
    [apiPeepRecords]
  );
  const [additionalApiResidentState, setAdditionalApiResidentState] = useState({
    contextKey: residentPickerContextKey,
    residents: [],
  });
  const additionalApiResidents =
    additionalApiResidentState.contextKey === residentPickerContextKey
      ? additionalApiResidentState.residents
      : [];
  const apiResidentsWithSelected = useMemo(
    () => [
      ...apiResidents,
      ...additionalApiResidents.filter(
        (extraResident) => !apiResidents.some((resident) => resident.id === extraResident.id)
      ),
    ],
    [apiResidents, additionalApiResidents]
  );
  const apiPinsFromRecord = useMemo(
    () => mapFloorPlanPins(apiFloorPlan?.pins, apiResidentsWithSelected),
    [apiFloorPlan?.pins, apiResidentsWithSelected]
  );
  const apiFloorPlanForViewer = useMemo(() => {
    if (!apiFloorPlan) return null;

    const imageUrl = getTrustedS3Url(apiFloorPlan.imageUrl);
    const pdfUrl = getTrustedS3Url(apiFloorPlan.pdfUrl);

    return {
      ...apiFloorPlan,
      imageUrl,
      pdfUrl,
      url: pdfUrl,
      fileName: apiFloorPlan.name || 'Floor Plan',
    };
  }, [apiFloorPlan]);

  const siteScoped = ownerDashboard || siteManagerDashboard;
  const base = ownerDashboard ? paths.owner : siteManagerDashboard ? paths.siteManager : null;

  const mockSiteName = useMemo(
    () => mockBranches.find((branch) => branch._id === siteId)?.name,
    [siteId]
  );
  const siteName = apiFloorPlan?.branch?.name || mockSiteName;

  const [residents, setResidents] = useState(RESIDENTS);

  const [floorPlanFile, setFloorPlanFileState] = useState(() => getFloorPlanFile());

  const [selectedResidentId, setSelectedResidentId] = useState('');

  const [selectedResident, setSelectedResident] = useState(null);

  const [pins, setPins] = useState(() => getFloorPlanPins());

  const placementMode = useBoolean();

  const uploadOpen = useBoolean();

  useEffect(() => {
    setSelectedResidentId('');
    setAdditionalApiResidentState({ contextKey: residentPickerContextKey, residents: [] });
    setPinToDelete(null);
    placementMode.onFalse();
  }, [floorPlanId, floorPlanBranchId, organizationId, placementMode.onFalse, residentPickerContextKey]);

  const visibleResidents = floorPlanId ? apiResidentsWithSelected : residents;
  const visiblePins = floorPlanId ? apiPinsFromRecord : pins;
  const visibleFloorPlan = floorPlanId ? apiFloorPlanForViewer : floorPlanFile;

  const residentsById = useMemo(
    () =>
      visibleResidents.reduce((acc, resident) => {
        acc[resident.id] = resident;
        return acc;
      }, {}),
    [visibleResidents]
  );

  const handlePlanClick = async ({ x, y, togglePlacement }) => {
    if (togglePlacement) {
      placementMode.onToggle();
      return;
    }

    if (!visibleFloorPlan || !placementMode.value || !selectedResidentId) return;

    if (floorPlanId) {
      const selectedResident = apiResidentsWithSelected.find(
        (resident) => resident.id === selectedResidentId
      );
      if (!selectedResident?.residentId) {
        toast.error('This PEEP record is not linked to a resident.');
        return;
      }
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) {
        toast.error('Pin coordinates are invalid.');
        return;
      }

      const isUpdatingPin = apiPinsFromRecord.some((pin) => pin.residentId === selectedResidentId);

      try {
        await createFloorPlanPin({
          floorPlanId,
          organizationId,
          residentId: selectedResident.residentId,
          x,
          y,
        }).unwrap();
        toast.success(isUpdatingPin ? 'Pin updated successfully.' : 'Pin placed successfully.');
        setSelectedResidentId('');
        placementMode.onFalse();
      } catch (error) {
        toast.error(error?.data?.message || error?.message || 'Unable to save this pin.');
      }
      return;
    }

    const currentPins = pins;
    const filteredPins = currentPins.filter((pin) => pin.residentId !== selectedResidentId);

    const newPin = {
      id: `pin-${Date.now()}`,
      residentId: selectedResidentId,
      x,
      y,
    };

    const nextPins = [...filteredPins, newPin];
    setPins(nextPins);
    setFloorPlanPins(nextPins);

    setSelectedResidentId('');
    placementMode.onFalse();
  };

  const handlePinClick = (resident) => {
    if (floorPlanId) {
      setSelectedResidentId(resident.id);
      placementMode.onTrue();
      return;
    }
    setSelectedResident(resident);
  };

  const handleConfirmDeletePin = async () => {
    if (!floorPlanId || !organizationId || !pinToDelete?.apiPinId) {
      toast.error('Unable to delete this pin because its floor plan or pin ID is unavailable.');
      return;
    }

    try {
      await deleteFloorPlanPin({
        floorPlanId,
        floorPlanPinId: pinToDelete.apiPinId,
        organizationId,
      }).unwrap();
      toast.success('Pin deleted successfully.');
      setSelectedResidentId('');
      setPinToDelete(null);
      placementMode.onFalse();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to delete this pin.');
    }
  };

  return (
    <DashboardContent maxWidth="xl" sx={{ py: { xs: 2, md: 1.5 }, px: { xs: 2, md: 3 } }}>

      <CustomBreadcrumbs
        heading="PEEP Floor Map"
        links={[
          { name: 'Dashboard', href: siteScoped ? base.root : paths.siteManager.root },
          {
            name: 'PEEP & Floor Plans',
            href: siteScoped ? base.peepAndFloorPlans.root : undefined,
          },
          ...(siteId && siteName
            ? [{ name: siteName, href: siteScoped ? base.peepAndFloorPlans.site(siteId) : undefined }]
            : siteName ? [{ name: siteName }] : []),
          { name: 'Floor Map' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Stack spacing={2} sx={{ minWidth: 0, p: { xs: 0.5, md: 2.5 } }}>
        {floorPlanId && isFloorPlanError && (
          <Alert severity="error">
            {floorPlanError?.data?.message || floorPlanError?.message || 'Unable to load this floor plan.'}
          </Alert>
        )}
        {floorPlanId && !organizationId && (
          <Alert severity="error">Organization context is unavailable.</Alert>
        )}
        <FloorPlanViewer
          pins={visiblePins}
          floorPlan={visibleFloorPlan}
          residentsById={residentsById}
          residents={visibleResidents}
          organizationId={organizationId}
          branchId={floorPlanBranchId}
          floorPlanId={floorPlanId}
          placementMode={placementMode.value}
          selectedResidentId={selectedResidentId}
          onResidentChange={(option) => {
            setSelectedResidentId(option?.value || '');
            if (floorPlanId && option?.resident) {
              setAdditionalApiResidentState((current) => {
                const currentResidents =
                  current.contextKey === residentPickerContextKey ? current.residents : [];
                return {
                  contextKey: residentPickerContextKey,
                  residents: [
                    ...currentResidents.filter(
                      (resident) => resident.id !== option.resident.id
                    ),
                    option.resident,
                  ],
                };
              });
            }
          }}
          onPlanClick={handlePlanClick}
          onPinClick={handlePinClick}
          onDeletePin={canManagePeep ? setPinToDelete : undefined}
          isDeletingPin={isDeletingPin}
          loading={Boolean(floorPlanId) && isFloorPlanLoading}
          showEmptyWhenMissing
          pinPlacementDisabled={!canManagePeep || !visibleFloorPlan || isCreatingPin}
          pinPlacementBusy={isCreatingPin}
        />
      </Stack>

      <ConfirmDialog
        open={Boolean(pinToDelete)}
        onClose={() => {
          if (!isDeletingPin) setPinToDelete(null);
        }}
        title="Delete pin"
        content="Are you sure you want to delete this pin from the floor plan?"
        action={
          <LoadingButton
            variant="contained"
            color="error"
            loading={isDeletingPin}
            onClick={handleConfirmDeletePin}
          >
            Delete
          </LoadingButton>
        }
      />

      {!floorPlanId && (
        <ResidentPeepDrawer
          resident={selectedResident}
          open={Boolean(selectedResident)}
          onClose={() => setSelectedResident(null)}
          onUpdate={(updatedResident) => {
            setResidents((current) => current.map((resident) => (resident.id === updatedResident.id ? updatedResident : resident)));
            setSelectedResident(updatedResident);
          }}
        />
      )}

      {!floorPlanId && (
        <UploadFloorPlanDialog
          open={uploadOpen.value}
          onClose={uploadOpen.onFalse}
          onUpload={async (file) => {
            const imagePreview = { imageUrl: URL.createObjectURL(file) };
            const updated = setFloorPlanFile(file, imagePreview);
            setFloorPlanFileState(updated);
            setPins([]);
            setSelectedResidentId('');
            placementMode.onFalse();
          }}
        />
      )}
    </DashboardContent>
  );
}

function getTrustedS3Url(value) {
  if (typeof value !== 'string' || !value) return '';

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const isS3Host =
      hostname === 's3.amazonaws.com' ||
      (hostname.startsWith('s3.') && hostname.endsWith('.amazonaws.com')) ||
      (hostname.endsWith('.amazonaws.com') && hostname.includes('.s3.'));

    return url.protocol === 'https:' && isS3Host ? url.href : '';
  } catch {
    return '';
  }
}

function mapPeepRecord(record) {
  const resident = record?.resident && typeof record.resident === 'object' ? record.resident : {};
  const rawResidentId =
    resident._id ||
    resident.id ||
    record?.residentId ||
    (typeof record?.resident === 'string' ? record.resident : null);
  const residentId =
    typeof rawResidentId === 'object'
      ? rawResidentId?._id || rawResidentId?.id || null
      : rawResidentId;
  const recordId = record?._id || record?.id;
  const id = residentId || recordId;

  if (!id) return null;

  const residentName = `${resident.firstName || ''} ${resident.lastName || ''}`.trim();

  return {
    ...record,
    id: String(id),
    residentId: residentId ? String(residentId) : null,
    peepRecordId: recordId || null,
    name: record?.name || record?.residentName || resident.name || residentName || '—',
    email: record?.email || resident.email || '',
    image: resident.avatar || resident.imageUrl || resident.image || record?.image || '',
    roomNumber: record?.roomNumber || resident.roomNumber || record?.room?.number || record?.room || '—',
    peepLevel: record?.peepLevel || record?.level || 'low',
    peepSummary: record?.supportNeeds || record?.peepSummary || '',
  };
}

function mapFloorPlanPins(pins, residents) {
  if (!Array.isArray(pins)) return [];

  const residentIds = new Set(residents.map((resident) => resident.id));

  return pins.flatMap((pin, index) => {
    const residentId = typeof pin?.residentId === 'string' ? pin.residentId : '';
    const x = Number(pin?.x);
    const y = Number(pin?.y);

    if (
      !residentIds.has(residentId) ||
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      x < 0 ||
      x > 1 ||
      y < 0 ||
      y > 1
    ) {
      return [];
    }

    const rawPinId = pin?._id || pin?.id;
    const apiPinId =
      typeof rawPinId === 'string' || typeof rawPinId === 'number'
        ? String(rawPinId)
        : null;

    return [
      {
        ...pin,
        id: apiPinId || `pin-${index}`,
        apiPinId,
        residentId,
        x,
        y,
      },
    ];
  });
}