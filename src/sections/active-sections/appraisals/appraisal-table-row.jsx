import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fDate } from 'src/utils/format-time';

const STATUS_COLOR = {
  overdue: 'error',
  due_soon: 'warning',
  completed: 'success',
  scheduled: 'info',
};

const STATUS_LABEL = {
  overdue: 'Overdue',
  due_soon: 'Due Soon',
  completed: 'Completed',
  scheduled: 'Scheduled',
};

export default function AppraisalTableRow({ row, serialNumber, onLogReview }) {
  const router = useRouter();
  const detailPath = paths.lineManager.appraisalDetail(row.id);

  return (
    <TableRow
      hover
      tabIndex={-1}
      sx={{ cursor: 'pointer' }}
      onClick={() => router.push(detailPath)}
    >
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar alt={row?.name} src={row?.avatar}>
            {row?.name?.charAt(0)}
          </Avatar>
          <Stack>
            <Typography variant="body2" fontWeight={600} sx={{ '&:hover': { textDecoration: 'underline' } }}>
              {row?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row?.role} · {row?.department}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell>{row.period || 'Annual 2026'}</TableCell>

      <TableCell>{fDate(row.lastReview)}</TableCell>

      <TableCell>{fDate(row.nextDue)}</TableCell>

      <TableCell align="center">
        <Label variant="soft" color={STATUS_COLOR[row.status] || 'default'}>
          {STATUS_LABEL[row.status] || row.status}
        </Label>
      </TableCell>

      <TableCell align="center">
        <Button
          size="small"
          variant="soft"
          color="primary"
          onClick={(event) => {
            event.stopPropagation();
            onLogReview(row);
          }}
        >
          Log Review
        </Button>
      </TableCell>
    </TableRow>
  );
}
