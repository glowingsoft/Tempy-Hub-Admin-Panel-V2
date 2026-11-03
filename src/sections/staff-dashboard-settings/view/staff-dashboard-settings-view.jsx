import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { TableHeadCustom, TableSkeleton } from 'src/components/table';
import { DashboardContent } from 'src/layouts/dashboard';

import {
  useGetStaffDashboardSettingsQuery,
  useUpdateStaffDashboardSettingsMutation,
} from 'src/store/Reducer/organizations-api';

import {
  STAFF_DASHBOARD_WIDGET_CATALOG,
  setStaffDashboardWidgetVisibility,
} from 'src/sections/staff/mocks/data';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'widget', label: 'Home screen card', minWidth: 280 },
  { id: 'visible', label: 'Show to staff', width: 140, align: 'center' },
];

const DEFAULT_CATALOG = STAFF_DASHBOARD_WIDGET_CATALOG.map((item) => ({
  key: item.key,
  title: item.label,
  description: item.description,
  showToStaff: false,
}));

// ----------------------------------------------------------------------
// Lets the owner decide which optional cards appear on their staff's home
// screen — e.g. Check In attendance card, Pending Leave card, etc.
// ----------------------------------------------------------------------

export function StaffDashboardSettingsView() {
  const { organizationId } = useCurrentOrganization();

  const { data, isLoading, isFetching } = useGetStaffDashboardSettingsQuery(
    organizationId,
    { skip: !organizationId }
  );

  const [updateStaffDashboardSettings, { isLoading: isUpdating }] =
    useUpdateStaffDashboardSettingsMutation();

  const initialCards = useMemo(() => {
    if (data?.cards && typeof data.cards === 'object') {
      return data.cards;
    }
    if (Array.isArray(data?.catalog) && data.catalog.length > 0) {
      return data.catalog.reduce((acc, item) => {
        acc[item.key] = Boolean(item.showToStaff);
        return acc;
      }, {});
    }
    return {
      checkIn: false,
      pendingLeave: false,
    };
  }, [data]);

  const [cards, setCards] = useState(initialCards);

  useEffect(() => {
    setCards(initialCards);
  }, [initialCards]);

  const catalogItems = useMemo(() => {
    if (Array.isArray(data?.catalog) && data.catalog.length > 0) {
      return data.catalog;
    }
    return DEFAULT_CATALOG;
  }, [data]);

  const isDirty = useMemo(() => {
    const allKeys = Array.from(new Set([...Object.keys(cards), ...Object.keys(initialCards)]));
    return allKeys.some((k) => Boolean(cards[k]) !== Boolean(initialCards[k]));
  }, [cards, initialCards]);

  const handleToggle = (key) => {
    setCards((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleReset = () => {
    setCards(initialCards);
  };

  const handleSave = async () => {
    if (!organizationId) {
      toast.error('No organization selected');
      return;
    }

    try {
      await updateStaffDashboardSettings({
        organizationId,
        cards,
      }).unwrap();

      // Keep local mock helpers in sync if referenced elsewhere in staff views
      Object.entries(cards).forEach(([key, visible]) => {
        setStaffDashboardWidgetVisibility(key, visible);
      });

      toast.success('Staff dashboard settings updated successfully!');
    } catch (error) {
      console.error('Update staff dashboard settings error:', error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.msg ||
        error?.data?.error ||
        error?.error ||
        error?.message ||
        'Failed to update staff dashboard settings';
      toast.error(errorMessage);
    }
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
              <Button
                variant="outlined"
                color="inherit"
                disabled={!isDirty || isUpdating}
                onClick={handleReset}
              >
                Reset
              </Button>
              <LoadingButton
                variant="contained"
                color="primary"
                disabled={!isDirty}
                loading={isUpdating}
                onClick={handleSave}
              >
                Save changes
              </LoadingButton>
            </Box>
          }
        />

        <Box sx={{ position: 'relative' }}>
          {isFetching && !isLoading && (
            <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9 }} />
          )}

          <Scrollbar>
            <Table sx={{ minWidth: 560 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {isLoading ? (
                  [...Array(2)].map((_, index) => <TableSkeleton key={index} />)
                ) : (
                  catalogItems.map((item) => (
                    <TableRow key={item.key} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{item.title || item.label}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {item.description}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Switch
                          checked={Boolean(cards[item.key])}
                          onChange={() => handleToggle(item.key)}
                          inputProps={{ 'aria-label': `Toggle ${item.title || item.label}` }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>
      </Card>
    </DashboardContent>
  );
}
