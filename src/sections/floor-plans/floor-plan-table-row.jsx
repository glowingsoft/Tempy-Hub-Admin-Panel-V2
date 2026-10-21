import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';

import { getFloorStatusMeta } from './mocks/data';

// ----------------------------------------------------------------------

export function FloorPlanTableRow({ row, serialNumber, onUpload, ownerDashboard = true, clickable = false }) {
  const router = useRouter();
  const base = ownerDashboard ? paths.owner : paths.siteManager;
  const statusMeta = getFloorStatusMeta(row.status);
  const isUploaded = row.status === 'uploaded';

  const openFloorPlan = () => {
    const floorPlanId = row.id || row._id;
    const branchId = row.branchId || row.branch?._id;
    if (!floorPlanId || !branchId) return;

    const mapPath = base.peepAndFloorPlans.map(branchId);
    router.push(`${mapPath}?floorPlanId=${encodeURIComponent(floorPlanId)}`);
  };

  const actions = [
    {
      key: 'open',
      icon: 'solar:eye-bold',
      tooltip: 'Open plan',
      hidden: !isUploaded,
      onClick: openFloorPlan,
    },
    {
      key: 'upload',
      icon: 'solar:import-bold',
      tooltip: isUploaded ? 'Replace plan' : 'Upload plan',
      onClick: () => onUpload(row),
    },
  ];

  return (
    <TableRow
      hover
      onClick={(event) => {
        if (clickable && !event.target.closest('button')) openFloorPlan();
      }}
      onKeyDown={(event) => {
        if (clickable && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          openFloorPlan();
        }
      }}
      tabIndex={clickable ? 0 : undefined}
      sx={clickable ? { cursor: 'pointer' } : undefined}
    >
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.name}
        </Typography>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.branch || '—'}</TableCell>

      <TableCell>
        <Label color={statusMeta.color}>{statusMeta.label}</Label>
      </TableCell>

      <TableCell align="center">{isUploaded ? `v${row.version}` : '—'}</TableCell>

      <TableCell align="center">{row.pinsCount || 0}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {row.uploadedAt ? fDateTime(row.uploadedAt) : '—'}
      </TableCell>

      <TableCell align="center">
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}
