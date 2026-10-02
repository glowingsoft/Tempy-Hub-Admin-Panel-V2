import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { formatStr } from 'src/utils/format-time';

import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { TableHeadCustom, TableSkeleton } from 'src/components/table';

import { useGetOrganizationModuleAccessQuery } from 'src/store/Reducer/organizations-api';

import { MODULE_CATALOG, mockModuleAccessResponse } from './mocks/data';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'module', label: 'Module', minWidth: 280 },
  { id: 'enabled', label: 'Access', width: 120, align: 'center' },
  { id: 'purchasedAt', label: 'Activation At', width: 240 },
  { id: 'expiresAt', label: 'Expiry date', width: 220 },
];

const FALLBACK_MODULES = mockModuleAccessResponse.data.moduleAccess;

// Merge the API's module-access list onto the full catalog so every module is
// represented (enabled or not), matching the payload requirement.
function mergeWithCatalog(apiModules = []) {
  const bySlug = new Map(apiModules.map((item) => [item.moduleSlug, item]));

  return MODULE_CATALOG.map((mod) => {
    const match = bySlug.get(mod.moduleSlug);
    return {
      moduleSlug: mod.moduleSlug,
      name: match?.name || mod.name,
      description: match?.description || mod.description,
      enabled: match?.enabled ?? false,
      // Activation time. `null` => activate immediately when access is applied.
      purchasedAt: match?.purchasedAt ?? null,
      expiresAt: match?.expiresAt ?? null,
    };
  });
}

// ----------------------------------------------------------------------

export function OrganizationModuleAccess({ organizationId }) {
  const { data, isLoading, isFetching, isError } = useGetOrganizationModuleAccessQuery(
    organizationId,
    { skip: !organizationId }
  );

  const initialModules = useMemo(
    () => mergeWithCatalog(isError ? FALLBACK_MODULES : data ?? []),
    [data, isError]
  );

  const [modules, setModules] = useState(initialModules);

  useEffect(() => {
    setModules(initialModules);
  }, [initialModules]);

  const isDirty = useMemo(
    () => JSON.stringify(modules) !== JSON.stringify(initialModules),
    [modules, initialModules]
  );

  const handleToggle = (moduleSlug) => {
    setModules((prev) =>
      prev.map((mod) =>
        mod.moduleSlug === moduleSlug ? { ...mod, enabled: !mod.enabled } : mod
      )
    );
  };

  const handleDateChange = (moduleSlug, key, newValue) => {
    const value =
      newValue && dayjs(newValue).isValid() ? dayjs(newValue).toISOString() : null;

    setModules((prev) =>
      prev.map((mod) => (mod.moduleSlug === moduleSlug ? { ...mod, [key]: value } : mod))
    );
  };

  // All modules go into the payload, enabled or not.
  // `purchasedAt` is optional — only sent when an Activation At value is chosen;
  // otherwise the backend activates the module immediately.
  const buildPayload = () => ({
    moduleAccess: modules.map(({ moduleSlug, enabled, expiresAt, purchasedAt }) => {
      const entry = { moduleSlug, enabled, expiresAt };
      if (purchasedAt) entry.purchasedAt = purchasedAt;
      return entry;
    }),
  });

  const handleSave = () => {
    const payload = buildPayload();
    // TODO: call updateOrganizationModuleAccess({ organizationId, ...payload }) once wired.
    console.log('[module-access] prepared payload', payload);
    // toast.info('Module access payload prepared — update API is not wired up yet.');
  };

  const handleReset = () => setModules(initialModules);

  return (
    <Card>
      <CardHeader
        title="Module Access"
        subheader="Enable modules for this organization. Leave Activation At empty to activate immediately; set an optional expiry date."
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

      {/* {isError && (
        <Alert severity="warning" sx={{ mx: 3, mb: 1 }}>
          Could not load module access from the server — showing default values.
        </Alert>
      )} */}

      <Box sx={{ position: 'relative' }}>
        {isFetching && (
          <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9 }} />
        )}

        <Scrollbar>
          <Table sx={{ minWidth: 640 }}>
            <TableHeadCustom headLabel={TABLE_HEAD} />

            <TableBody>
              {isLoading ? (
                [...Array(6)].map((_, index) => <TableSkeleton key={index} />)
              ) : (
                modules.map((mod) => (
                  <TableRow key={mod.moduleSlug} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{mod.name}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {mod.description}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Switch
                        checked={mod.enabled}
                        onChange={() => handleToggle(mod.moduleSlug)}
                        inputProps={{ 'aria-label': `Toggle ${mod.name}` }}
                      />
                    </TableCell>

                    <TableCell>
                      <DatePicker
                        value={mod.purchasedAt ? dayjs(mod.purchasedAt) : null}
                        onChange={(newValue) =>
                          handleDateChange(mod.moduleSlug, 'purchasedAt', newValue)
                        }
                        format={formatStr.split.date}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            helperText: mod.purchasedAt ? undefined : 'Activates immediately',
                          },
                          field: { clearable: true },
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <DatePicker
                        value={mod.expiresAt ? dayjs(mod.expiresAt) : null}
                        onChange={(newValue) =>
                          handleDateChange(mod.moduleSlug, 'expiresAt', newValue)
                        }
                        format={formatStr.split.date}
                        slotProps={{
                          textField: { fullWidth: true, size: 'small' },
                          field: { clearable: true },
                        }}
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
  );
}
