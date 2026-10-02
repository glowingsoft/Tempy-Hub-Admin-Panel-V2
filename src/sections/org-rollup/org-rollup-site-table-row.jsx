import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

function getFloorSummaryMeta({ total, uploaded }) {
  if (!total) return { label: 'No floors yet', color: 'default' };
  if (uploaded === total) return { label: `${uploaded}/${total} uploaded`, color: 'success' };
  if (uploaded === 0) return { label: `0/${total} uploaded`, color: 'error' };
  return { label: `${uploaded}/${total} uploaded`, color: 'warning' };
}

// ----------------------------------------------------------------------
// One row of the "all sites" rollup table. The whole row (and the explicit
// "View" action) both just select this site — driven by the same
// `useOwnerBranchFilter` state the Site dropdown uses — swapping the table
// for the single-site detail panel.
// ----------------------------------------------------------------------

export function OrgRollupSiteTableRow({ row, serialNumber, onSelect }) {
  const { site, levels, floorsSummary } = row;
  const floorMeta = getFloorSummaryMeta(floorsSummary);

  const actions = [{ key: 'view', icon: 'solar:eye-bold', tooltip: 'View site', onClick: onSelect }];

  return (
    <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={onSelect}>
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {site.name}
        </Typography>
      </TableCell>

      <TableCell align="center">{levels.total}</TableCell>

      <TableCell align="center">
        <Label color="success">{levels.low}</Label>
      </TableCell>

      <TableCell align="center">
        <Label color="warning">{levels.medium}</Label>
      </TableCell>

      <TableCell align="center">
        <Label color="error">{levels.high}</Label>
      </TableCell>

      <TableCell>
        <Label color={floorMeta.color}>{floorMeta.label}</Label>
      </TableCell>

      <TableCell align="center">
        <Box onClick={(event) => event.stopPropagation()} sx={{ display: 'flex', justifyContent: 'center' }}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}
