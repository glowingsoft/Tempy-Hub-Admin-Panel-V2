// compliance-status-pill.jsx

import { Avatar, Stack, TableCell, TableRow, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { Label } from 'src/components/label';

// A module entry looks like: { state: 'overdue' | 'due_soon' | 'pending' | 'scheduled' | 'na', date, note }
// 'state' drives color; 'date' (or a fixed word like "Pending"/"N/A") drives the text shown.
const STATE_COLOR = {
  overdue: 'error',
  due_soon: 'warning',
  pending: 'warning',
  scheduled: 'success',
  na: 'default',
};

const STATE_LABEL = {
  overdue: 'Overdue',
  pending: 'Pending',
  na: 'N/A',
};

function ComplianTableRow({ row, columns, serialNumber }) {
  return (
    <TableRow key={row.id} hover>
      <TableCell>{serialNumber}</TableCell>
      <TableCell >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar alt={row?.name} src={row?.avatar}>
            {row?.name?.charAt(0)}
          </Avatar>
          <Stack>
            <Typography variant="body2" fontWeight={600}>
              {row?.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" color="text.secondary">
                {row?.role}
              </Typography>
              {row?.overallCompliance !== undefined && (
                <Label
                  variant="soft"
                  color={
                    row.overallCompliance >= 90
                      ? 'success'
                      : row.overallCompliance >= 75
                      ? 'warning'
                      : 'error'
                  }
                  sx={{ height: 18, fontSize: '0.65rem' }}
                >
                  {row.overallCompliance}% compliant
                </Label>
              )}
            </Stack>
          </Stack>
        </Stack>
      </TableCell>

      {columns?.map((col) => (
        <TableCell key={col.key} align="center">
          <ComplianceStatusPill entry={row.modules[col.key]} />
        </TableCell>
      ))}
    </TableRow>
  )
}

export default ComplianTableRow;

function ComplianceStatusPill({ entry }) {
  if (!entry) {
    return <Label color="default">N/A</Label>;
  }

  const text = STATE_LABEL[entry.state] || entry.date || '—';
  const color = STATE_COLOR[entry.state] || 'default';

  return (
    <Tooltip title={entry.note || ''} arrow disableHoverListener={!entry.note}>
      <Label color={color} >{text}</Label>
    </Tooltip>
  );
}
