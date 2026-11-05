import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';

// ----------------------------------------------------------------------

const PREVIEW_LIMIT = 5;

const STATUS_COLOR = {
  pending: 'warning',
  overdue: 'error',
  duesoon: 'warning',
  'due soon': 'warning',
  completed: 'success',
  ontrack: 'success',
  'on track': 'success',
  notyetdue: 'info',
  'not yet due': 'info',
};

function statusColor(value = '') {
  const key = String(value).replace(/[\s_-]/g, '').toLowerCase();
  const spaced = String(value).replace(/_/g, ' ').toLowerCase();
  return STATUS_COLOR[key] || STATUS_COLOR[spaced] || 'default';
}

function CellValue({ column, value }) {
  if (value == null || value === '' || value === '—') {
    return (
      <Typography variant="body2" color="text.disabled">
        —
      </Typography>
    );
  }

  if (column.id === 'status' || column.type === 'status') {
    return (
      <Label variant="soft" color={statusColor(value)}>
        {value}
      </Label>
    );
  }

  const text = String(value);

  if (text.length > 28) {
    return (
      <Tooltip title={text} arrow>
        <Typography variant="body2" noWrap>
          {text}
        </Typography>
      </Tooltip>
    );
  }

  return (
    <Typography variant="body2" noWrap>
      {text}
    </Typography>
  );
}

function GlanceTable({ columns, rows }) {
  return (
    <Table size="small" sx={{ minWidth: 280 }}>
      <TableHeadCustom headLabel={columns} />
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            {columns.map((column) => (
              <TableCell key={column.id} align={column.align || 'left'} sx={{ py: 1.25 }}>
                <CellValue column={column} value={row[column.id]} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function DashboardGlanceTable({
  title,
  subheader,
  columns = [],
  rows = [],
  previewLimit = PREVIEW_LIMIT,
  sx,
  ...other
}) {
  const [open, setOpen] = useState(false);
  const previewRows = useMemo(() => rows.slice(0, previewLimit), [rows, previewLimit]);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', ...sx }} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ mb: 1 }} />

      {!rows.length ? (
        <EmptyContent
          filled
          title="No data available"
          slotProps={{ img: { maxWidth: 96 } }}
          sx={{ height: 'auto', flex: 1, minHeight: 0, m: 2.5, mt: 0, py: 3, overflow: 'hidden' }}
        />
      ) : (
        <>
          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            <GlanceTable columns={columns} rows={previewRows} />
          </Scrollbar>

          <Divider sx={{ borderStyle: 'dashed' }} />
          <Box sx={{ p: 2, textAlign: 'right' }}>
            <Button
              size="small"
              color="inherit"
              onClick={() => setOpen(true)}
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
            >
              View all
            </Button>
          </Box>
        </>
      )}

      <Dialog fullWidth maxWidth="md" open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {title}
          <IconButton onClick={() => setOpen(false)}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          {subheader ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {subheader}
            </Typography>
          ) : null}
          <Scrollbar sx={{ maxHeight: 480 }}>
            <GlanceTable columns={columns} rows={rows} />
          </Scrollbar>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
