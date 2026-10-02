import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';

import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';

import {
  FLOOR_PLAN,
  FLOOR_PLAN_PINS,
  getFloorPlanFile,
  getFloorPlanPins,
  setFloorPlanPins,
  PEEP_LEVELS,
  RESIDENTS,
  setFloorPlanFile,
} from '../mocks/data';

import { Avatar, CardHeader, Link } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';
import { TableHeadCustom, TablePaginationCustom, useTable } from 'src/components/table';
import { useBoolean } from 'src/hooks/use-boolean';
import { useParams, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { toast } from 'src/components/snackbar';
import { mockBranches } from 'src/sections/branch/mocks/data';
import { OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';
import { FloorPlanViewer } from '../floor-plan-viewer';
import { ResidentPeepDrawer } from '../resident-peep-drawer';
import { UploadFloorPlanDialog } from '../upload-floor-plan-dialog';
import { Scrollbar } from 'src/components/scrollbar';
import { convertPdfToImage } from 'src/utils/pdf-to-image';

export function PeepFloorPlanView({ ownerDashboard = false, siteManagerDashboard = false }) {
  const router = useRouter();

  // Owner and Site Manager both reach this screen with the site id in the
  // URL (Org Rollup -> site -> map) and share the same routed flow. A bare
  // dashboard (e.g. admin) mounts this without a site-scoped route at all.
  const { siteId } = useParams();

  const siteScoped = ownerDashboard || siteManagerDashboard;
  const base = ownerDashboard ? paths.owner : siteManagerDashboard ? paths.siteManager : null;

  const { branchId, onBranchChange } = useOwnerBranchFilter();

  useEffect(() => {
    if (siteScoped && siteId) onBranchChange(siteId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteScoped, siteId]);

  // Switching sites from the dropdown should update the URL too, so the
  // address bar and breadcrumb always match what's on screen.
  const handleSiteChange = (nextSiteId) => {
    if (!siteScoped) {
      onBranchChange(nextSiteId);
      return;
    }

    if (!nextSiteId || nextSiteId === 'all') {
      router.push(base.peepAndFloorPlans.root);
    } else {
      router.push(base.peepAndFloorPlans.map(nextSiteId));
    }
  };

  const siteName = useMemo(
    () => mockBranches.find((branch) => branch._id === siteId)?.name,
    [siteId]
  );

  const [residents, setResidents] = useState(RESIDENTS);

  // Uploaded PDF is kept in a plain in-memory module (see mocks/data.js) —
  // fallback to default site floor plan if no custom PDF has been uploaded
  const [floorPlanFile, setFloorPlanFileState] = useState(
    () => getFloorPlanFile() || FLOOR_PLAN
  );

  const [selectedResidentId, setSelectedResidentId] = useState('');

  const [selectedResident, setSelectedResident] = useState(null);

  const [pins, setPins] = useState(() => (getFloorPlanFile() ? getFloorPlanPins() : FLOOR_PLAN_PINS));

  const placementMode = useBoolean();

  const uploadOpen = useBoolean();

  const residentsById = useMemo(
    () =>
      residents.reduce((acc, resident) => {
        acc[resident.id] = resident;
        return acc;
      }, {}),
    [residents]
  );

  const handlePlanClick = ({ x, y, togglePlacement }) => {
    if (togglePlacement) {
      placementMode.onToggle();
      return;
    }

    if (!floorPlanFile || !placementMode.value || !selectedResidentId) return;

    // Remove existing pin for this resident if re-placing or moving
    const filteredPins = pins.filter((pin) => pin.residentId !== selectedResidentId);

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
    setSelectedResident(resident);
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
        action={
          siteScoped ? (
            <OwnerBranchFilterActions value={branchId} onChange={handleSiteChange}>
              <Button
                component={RouterLink}
                href={base.peepAndFloorPlans.addPin(branchId)}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                disabled={branchId === 'all'}
                sx={{ display: { xs: 'none', md: 'inline-flex' } }}
              >
                Add pin
              </Button>
              <Button
                variant="outlined"
                onClick={uploadOpen.onTrue}
                startIcon={<Iconify icon="solar:import-bold" />}
                sx={{ display: { xs: 'none', md: 'inline-flex' } }}
              >
                Upload Floor Plan Pdf
              </Button>
            </OwnerBranchFilterActions>
          ) : (
            <Stack direction={{ md: 'row', xs: 'column' }} sx={{ display: { md: 'flex', xs: 'none' } }} spacing={1.5}>
              <Button variant="outlined" onClick={uploadOpen.onTrue} startIcon={<Iconify icon="solar:import-bold" />}>
                Upload Floor Plan Pdf
              </Button>
            </Stack>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Stack direction={{ md: 'row', xs: 'column' }} sx={{ display: { md: "none", xs: "flex" } }} spacing={1.5}>
        {siteScoped && (
          <Button
            component={RouterLink}
            href={base.peepAndFloorPlans.addPin(branchId)}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={branchId === 'all'}
          >
            Add pin
          </Button>
        )}
        <Button variant="outlined" onClick={uploadOpen.onTrue} startIcon={<Iconify icon="solar:import-bold" />}>
          Upload Floor Plan Pdf
        </Button>
      </Stack>
      <Stack spacing={2} sx={{ minWidth: 0, p: { xs: 0.5, md: 2.5 } }}>
        <FloorPlanViewer
          pins={pins}
          floorPlan={floorPlanFile}
          residentsById={residentsById}
          residents={residents}
          placementMode={placementMode.value}
          selectedResidentId={selectedResidentId}
          onResidentChange={setSelectedResidentId}
          onPlanClick={handlePlanClick}
          onPinClick={handlePinClick}
        />

        <PeepRecords
          residents={residents}
          onSelect={(resident) => {
            setSelectedResident(resident);
            setSelectedResidentId(resident.id);
          }}
        />
      </Stack>

      <ResidentPeepDrawer
        resident={selectedResident}
        open={Boolean(selectedResident)}
        onClose={() => setSelectedResident(null)}
        onUpdate={(updatedResident) => {
          setResidents((current) => current.map((resident) => (resident.id === updatedResident.id ? updatedResident : resident)));
          setSelectedResident(updatedResident);
        }}
      />

      <UploadFloorPlanDialog
        open={uploadOpen.value}
        onClose={uploadOpen.onFalse}
        onUpload={async (file, imageResult) => {
          let converted = imageResult;
          if (!converted && file) {
            try {
              converted = await convertPdfToImage(file);
            } catch (err) {
              console.warn('PDF conversion error in view:', err);
            }
          }
          const updated = setFloorPlanFile(file, converted);
          setFloorPlanFileState(updated);
          setPins([]);
          setSelectedResidentId('');
          placementMode.onFalse();
        }}
      />
    </DashboardContent>
  );
}

function PeepRecords({ residents, onSelect }) {
  const TABLE_HEAD = [
    { id: 'sr#', label: 'Sr#', width: 60 },
    { id: 'name', label: 'Name', minWidth: 220 },
    { id: 'room', label: 'Room', minWidth: 180 },
    { id: 'level', label: 'Level', minWidth: 160, align: 'center' },
    { id: 'actions', label: 'Actions', minWidth: 180, align: 'center' },
  ];

  const table = useTable();

  const PEEP_LEVEL_COLORS = {
    low: 'success',
    medium: 'warning',
    high: 'error',
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 1, boxShadow: 'none' }}>
      <CardHeader title="PEEP records List" sx={{ mb: 1 }} />
      <TableContainer>
        <Scrollbar>
          <Table>
            <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={TABLE_HEAD} numSelected={table.selected.length} />
            <TableBody>
              {residents.map((resident, index) => {
                const level = PEEP_LEVELS[resident.peepLevel];
                const actions = [
                  {
                    key: 'details',
                    icon: 'solar:pen-bold',
                    tooltip: 'View / edit PEEP record',
                    onClick: (event) => {
                      event.stopPropagation();
                      onSelect(resident);
                    },
                  },
                ];

                return (
                  <TableRow key={resident.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Stack spacing={2} direction="row" alignItems="center">
                        <Avatar alt={resident.name} src={resident.image}>
                          {resident.name?.charAt(0)}
                        </Avatar>

                        <Stack
                          sx={{
                            typography: 'body2',
                            flex: '1 1 auto',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Link color="inherit" sx={{ cursor: 'pointer' }}>
                            {resident.name || '—'}
                          </Link>

                          <Box
                            sx={{
                              color: 'text.secondary',
                              typography: 'caption',
                            }}
                          >
                            {resident.email || '—'}
                          </Box>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>{resident.roomNumber}</TableCell>

                    <TableCell align="center">
                      <Label color={PEEP_LEVEL_COLORS[resident.peepLevel] || 'default'}>{resident.peepLevel}</Label>
                    </TableCell>

                    <TableCell align="center">
                      <Box onClick={(event) => event.stopPropagation()} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <GenericTableRowActions actions={actions} />
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Scrollbar>
        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={residents.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </TableContainer>
    </Card>
  );
}
