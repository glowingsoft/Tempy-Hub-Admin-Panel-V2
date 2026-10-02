import { useState, useMemo, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { Avatar, Link, MenuItem, Stack, TextField, Tooltip } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

const OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'staff', label: 'Staff' },
  { value: 'residents', label: 'Residents' },
  { value: 'contractors', label: 'Contractors' },
  { value: 'visitors', label: 'Visitors' },
  { value: 'professionals', label: 'Professionals' },
];

const TYPE_COLOR = {
  staff: 'primary',
  visitor: 'info',
  contractor: 'warning',
  resident: 'success',
  professional: 'secondary',
};

const STATUS_COLOR = {
  on_site: 'primary',
  on_break: 'warning',
  checked_out: 'default',
};

function formatText(str = '') {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// ----------------------------------------------------------------------

export function PeopleOnSiteNow({ title, subheader, tableData = [], headLabel, onClick, ...other }) {
  const [filterType, setFilterType] = useState('all');
  const [dataList, setDataList] = useState(tableData);

  useEffect(() => {
    setDataList(tableData);
  }, [tableData]);

  const handleCheckout = useCallback((id) => {
    setDataList((prev) =>
      prev.map((row) => (row._id === id ? { ...row, status: 'checked_out' } : row))
    );
  }, []);

  const filteredData = useMemo(() => {
    if (filterType === 'all') return dataList;
    return dataList.filter((row) => {
      const type = (row.type || '').toLowerCase();
      if (filterType === 'staff') return type === 'staff';
      if (filterType === 'residents') return type === 'resident' || type === 'residents';
      if (filterType === 'contractors') return type === 'contractor' || type === 'contractors';
      if (filterType === 'visitors') return type === 'visitor' || type === 'visitors';
      if (filterType === 'professionals') return type === 'professional' || type === 'professionals';
      return type === filterType;
    });
  }, [dataList, filterType]);

  return (
    <Card {...other}>
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{ mb: 3 }}
        action={
          <TextField
            select
            size="small"
            label="People"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            {OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        }
      />

      <Scrollbar sx={{ minHeight: 402 }}>
        <Table sx={{ minWidth: 720 }}>
          <TableHeadCustom headLabel={headLabel} />

          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headLabel?.length || 5} sx={{ py: 6, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No {filterType} currently on site.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <RowItem key={row._id} row={row} onCheckout={handleCheckout} />
              ))
            )}
          </TableBody>
        </Table>
      </Scrollbar>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button
          size="small"
          color="inherit"
          onClick={onClick}
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
        >
          View all
        </Button>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

function RowItem({ row, onCheckout }) {
  const router = useRouter();

  const isCheckedOut = row.status === 'checked_out';

  const handleView = () => {
    router.push(paths.siteManager.directory.detail(row._id));
  };

  return (
    <TableRow
      hover
      onClick={handleView}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      {/* Person Name and Email */}
      <TableCell>
        <Stack spacing={2} direction="row" alignItems="center">
          <Avatar alt={row.name} src={row.image} />

          <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
            <Link
              color="inherit"
              onClick={(e) => {
                e.stopPropagation();
                handleView();
              }}
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {row?.name?.length > 30 ? (
                <Tooltip title={row.name} arrow placement="bottom">
                  <span>{row.name.slice(0, 30)}...</span>
                </Tooltip>
              ) : (
                row.name || '--'
              )}
            </Link>

            <Box component="span" sx={{ color: 'text.disabled' }}>
              {row?.email?.length > 30 ? (
                <Tooltip title={row.email} arrow placement="bottom">
                  <span>{row.email.slice(0, 30)}...</span>
                </Tooltip>
              ) : (
                row.email || '--'
              )}
            </Box>
          </Stack>
        </Stack>
      </TableCell>

      {/* Person Type Badge */}
      <TableCell align="center">
        <Label variant="soft" color={TYPE_COLOR[row.type] || 'default'}>
          {formatText(row.type)}
        </Label>
      </TableCell>

      {/* Check In Time */}
      <TableCell>{fDateTime(row.checkedInAt)}</TableCell>

      {/* Status Badge */}
      <TableCell align="center">
        <Label variant="soft" color={STATUS_COLOR[row.status] || 'default'}>
          {formatText(row.status)}
        </Label>
      </TableCell>

      {/* Actions Cell with Check Out Button */}
      <TableCell
        align="center"
        onClick={(e) => e.stopPropagation()}
      >
        <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
          {isCheckedOut ? (
            <Label variant="soft" color="default" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
              Checked Out
            </Label>
          ) : (
            <Button
              size="small"
              variant="soft"
              color="error"
              startIcon={<Iconify icon="solar:logout-2-bold" width={16} />}
              onClick={(e) => {
                e.stopPropagation();
                onCheckout?.(row._id);
              }}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                height: 28,
                px: 1.25,
                textTransform: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Check Out
            </Button>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}
