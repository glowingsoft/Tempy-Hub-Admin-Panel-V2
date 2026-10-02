import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { TableHeadCustom } from 'src/components/table';
import { DashboardContent } from 'src/layouts/dashboard';

import {
  STAFF_DASHBOARD_WIDGET_CATALOG,
  staffDashboardWidgetSettings,
  setStaffDashboardWidgetVisibility,
} from 'src/sections/staff/mocks/data';

// import { useUpdateStaffDashboardSettingsMutation } from 'src/store/Reducer/staff-dashboard-settings-api';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'widget', label: 'Home screen card', minWidth: 280 },
  { id: 'visible', label: 'Show to staff', width: 140, align: 'center' },
];

// Same shape as the catalog, seeded from the current (mock) settings.
const buildWidgets = () =>
  STAFF_DASHBOARD_WIDGET_CATALOG.map((widget) => ({
    ...widget,
    visible: staffDashboardWidgetSettings[widget.key] !== false,
  }));

// ----------------------------------------------------------------------
// Lets the owner decide which optional cards show up on their staff's home
// screen — a display preference, separate from Organization → Module Access
// (that screen gates whether a feature/module is available at all).
//
// Mirrors OrganizationModuleAccess's shape (Card + Switch table, dirty-gated
// Save/Reset) — not called yet, mutates the mock in place on Save.
// ----------------------------------------------------------------------

export function StaffDashboardSettingsView() {
  const initialWidgets = useMemo(buildWidgets, []);
  const [widgets, setWidgets] = useState(initialWidgets);

  const isDirty = useMemo(
    () => JSON.stringify(widgets) !== JSON.stringify(initialWidgets),
    [widgets, initialWidgets]
  );

  const handleToggle = (key) => {
    setWidgets((prev) =>
      prev.map((widget) => (widget.key === key ? { ...widget, visible: !widget.visible } : widget))
    );
  };

  const handleReset = () => setWidgets(initialWidgets);

  const handleSave = () => {
    // TODO: replace with the real mutation once the endpoint is wired up:
    // await updateStaffDashboardSettings({ organizationId, widgets }).unwrap();
    widgets.forEach((widget) => setStaffDashboardWidgetVisibility(widget.key, widget.visible));

    toast.success('Staff dashboard settings updated!');
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Staff Dashboard Settings"
        links={[{ name: 'Dashboard', href: paths.owner.root }, { name: 'Staff Dashboard Settings' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <CardHeader
          title="Home screen cards"
          subheader="Choose which cards appear on your staff's home screen."
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" disabled={!isDirty} onClick={handleReset}>
                Reset
              </Button>
              <Button variant="contained" disabled={!isDirty} onClick={handleSave}>
                Save changes
              </Button>
            </Box>
          }
        />

        <Scrollbar>
          <Table sx={{ minWidth: 560 }}>
            <TableHeadCustom headLabel={TABLE_HEAD} />

            <TableBody>
              {widgets.map((widget) => (
                <TableRow key={widget.key} hover>
                  <TableCell>
                    <Typography variant="subtitle2">{widget.label}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {widget.description}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Switch
                      checked={widget.visible}
                      onChange={() => handleToggle(widget.key)}
                      inputProps={{ 'aria-label': `Toggle ${widget.label}` }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>
    </DashboardContent>
  );
}
