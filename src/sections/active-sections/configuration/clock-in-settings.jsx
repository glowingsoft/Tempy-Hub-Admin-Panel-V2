import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { mockEmployees } from 'src/sections/user/mocks/data';

import { DEFAULT_CLOCK_IN_SETTINGS } from './mocks/data';
import { StaffTableRow } from './staff-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 60 },
  { id: 'name', label: 'Name' },
  { id: 'department', label: 'Department' },
  { id: 'date', label: 'Date', align: 'center', minWidth: 140 },
  { id: 'clockIn', label: 'Clock In', align: 'center', minWidth: 140 },
  { id: 'clockOut', label: 'Clock Out', align: 'center', minWidth: 140 },
  { id: 'breakIn', label: 'Break In', align: 'center', minWidth: 140 },
  { id: 'breakOut', label: 'Break Out', align: 'center', minWidth: 140 },
  { id: 'total', label: 'Total', align: 'center', minWidth: 140 },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
];

// ----------------------------------------------------------------------

function CompactToggleCard({ icon, label, sublabel, checked, onChange }) {
  return (
    <Card
      variant="outlined"
      onClick={() => onChange(!checked)}
      sx={{
        py: 1,
        px: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        borderRadius: 1.25,
        borderColor: checked ? 'primary.main' : 'divider',
        bgcolor: (theme) =>
          checked
            ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.04)
            : 'background.paper',
        transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
        <Iconify
          icon={icon}
          width={20}
          sx={{ color: checked ? 'primary.main' : 'text.disabled', flexShrink: 0 }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13 }} noWrap>
            {label}
          </Typography>
          {sublabel && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {sublabel}
            </Typography>
          )}
        </Box>
      </Stack>

      <Switch
        size="small"
        checked={Boolean(checked)}
        onChange={(e) => {
          e.stopPropagation();
          onChange(e.target.checked);
        }}
        sx={{ ml: 1, flexShrink: 0 }}
      />
    </Card>
  );
}

CompactToggleCard.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  sublabel: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

// ----------------------------------------------------------------------

function ClockInSettings({ title, subHeader }) {
  const table = useTable();
  const filters = useSetState({ name: '', status: 'all' });
  const openStatusChangeModal = useBoolean();

  // Unified settings state without unnecessary hooks
  const [settings, setSettings] = useState(DEFAULT_CLOCK_IN_SETTINGS);

  const handleUpdate = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_CLOCK_IN_SETTINGS);
    toast.info('Clock in settings reverted to default');
  };

  const handleSaveSettings = () => {
    toast.success('Clock in settings saved successfully!');
  };

  const apiUsers = mockEmployees || [];
  const meta = {};

  const tableData = apiUsers.map((user) => ({
    id: user._id,
    image: user.image,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    status: user.status || 'Active',
    indicators: {
      attendance: user.indicators?.attendance || 'Good',
      performance: user.indicators?.performance || 'Good',
    },
    lastSeen: user.lastSeen || '—',
    date: user.date || '—',
    clockIn: user.clockIn || '08:57 AM',
    clockOut: user.clockOut || '05:42 PM',
    breakIn: user.breakIn || '01:00 PM',
    breakOut: user.breakOut || '02:00 PM',
    total: user.total || '07h 45m',
  }));

  const handleEditRow = useCallback(() => {
    openStatusChangeModal.onTrue();
  }, [openStatusChangeModal]);

  return (
    <Stack spacing={3}>
      {/* 1. Wireframe Clock In Settings Card (Top) */}
      <Card>
        <CardHeader
          title="Clock In Settings"
          subheader="Configure mobile check-in, break tracking, tolerance, and allowance rules"
          action={
            <Label
              color="primary"
              variant="soft"
              startIcon={<Iconify icon="solar:clock-circle-bold" width={14} />}
              sx={{ fontWeight: 700 }}
            >
              Shift Rules
            </Label>
          }
          sx={{ pb: 1.5 }}
        />

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 2.5 } }}>
          {/* Toggles Row */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <CompactToggleCard
                icon="solar:smartphone-bold"
                label="Phone check-in"
                sublabel="Allow staff to check in via the mobile app"
                checked={settings.phoneCheckIn}
                onChange={(val) => handleUpdate('phoneCheckIn', val)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CompactToggleCard
                icon="solar:cup-bold"
                label="Break tracking"
                sublabel="Enable Start/Stop break at the kiosk"
                checked={settings.breakTracking}
                onChange={(val) => handleUpdate('breakTracking', val)}
              />
            </Grid>
          </Grid>

          {/* Fields Row */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={5} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Late tolerance window"
                value={settings.lateTolerance}
                onChange={(e) => handleUpdate('lateTolerance', e.target.value)}
                placeholder="10 minutes"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:history-bold-duotone" width={18} sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={7} md={8}>
              <TextField
                fullWidth
                size="small"
                label="Unpaid break allowance"
                value={settings.unpaidBreakAllowance}
                onChange={(e) => handleUpdate('unpaidBreakAllowance', e.target.value)}
                placeholder="1 hr unpaid per 12-hour shift · 0.5 hr unpaid per 6-hour shift"
                helperText="Break rule per client request"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:alarm-sleep-bold-duotone" width={18} sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

          {/* Actions */}
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" color="inherit" size="small" onClick={handleResetSettings}>
              Cancel
            </Button>
            <Button variant="contained" size="small" color="primary" onClick={handleSaveSettings}>
              Save changes
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* 2. Remaining Clock In Table Card */}
      <Card>
        <CardHeader
          title={title || 'Automatic staff clock-out'}
          subheader={subHeader || 'Clock out staff automatically at shift end'}
          action={
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(settings.autoClockOut)}
                  onChange={(e) => handleUpdate('autoClockOut', e.target.checked)}
                />
              }
              label=""
            />
          }
          sx={{ mb: 1 }}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                numSelected={table.selected.length}
              />

              <TableBody>
                {tableData?.length > 0 ? (
                  tableData.map((row, index) => (
                    <StaffTableRow
                      key={row.id}
                      row={row}
                      serialNumber={index + 1 + table.page * table.rowsPerPage}
                      selected={table.selected.includes(row.id)}
                      onEditRow={handleEditRow}
                    />
                  ))
                ) : (
                  <TableNoData notFound />
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={meta?.totalRecords || tableData.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </Stack>
  );
}

ClockInSettings.propTypes = {
  title: PropTypes.string,
  subHeader: PropTypes.string,
};

export default ClockInSettings;