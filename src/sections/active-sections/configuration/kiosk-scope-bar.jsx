import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';

// ----------------------------------------------------------------------

const mapBranchOption = (branch) => ({
  value: branch._id,
  label: branch.name,
});

export function KioskScopeBar({
  organizationId,
  currentBranch,
  onChangeBranchId,
  kiosks = [],
  currentKioskId,
  onChangeKioskId,
  ownerDashboard = false,
  branchDisabled = false,
  sx,
}) {
  return (
    <Card
      sx={{
        p: { xs: 2, sm: 2.5 },
        bgcolor: 'background.paper',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        ...sx,
      }}
    >
      <Stack spacing={2}>
        {/* Header Row */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
              }}
            >
              <Iconify icon="solar:settings-minimalistic-bold-duotone" width={20} />
            </Box>

            <div>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Target Scope & Location
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Select the care home site and device scope to configure branding rules.
              </Typography>
            </div>
          </Stack>

          {ownerDashboard && (
            <Label
              color="warning"
              variant="soft"
              startIcon={<Iconify icon="solar:crown-bold" width={14} />}
              sx={{ width: 'fit-content', fontWeight: 700, fontSize: 11, alignSelf: { xs: 'flex-start', sm: 'center' } }}
            >
              Owner-Level Control
            </Label>
          )}
        </Stack>

        {/* Dropdowns Row */}
        <Grid container spacing={2} alignItems="center">
          {/* Site / Branch Dropdown */}
          <Grid item xs={12} sm={6} md={6}>
            <InfiniteAutocomplete
              key={organizationId || 'no-organization'}
              value={currentBranch}
              onChange={(branch) => {
                if (branchDisabled) return;
                onChangeBranchId(branch);
                onChangeKioskId('all');
              }}
              useQuery={useGetBranchesQuery}
              queryArgs={{ organizationId }}
              mapOption={mapBranchOption}
              limit={100}
              label="Site / Branch"
              placeholder="Search site..."
              disabled={!organizationId || branchDisabled}
              disableClearable
              fullWidth
              size="small"
              textFieldProps={{
                helperText: branchDisabled ? 'Site selection is locked to your assigned site' : undefined,
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:buildings-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          {/* Applying To Kiosk Dropdown */}
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Applying to"
              value={currentKioskId || 'all'}
              onChange={(e) => onChangeKioskId(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="solar:monitor-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="all">
                All kiosks at this site (default)
              </MenuItem>
              {kiosks.map((kiosk) => (
                <MenuItem key={kiosk._id} value={kiosk._id}>
                  {kiosk.name || kiosk.code || `Kiosk ${kiosk._id.slice(-4)}`}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

        </Grid>
      </Stack>
    </Card>
  );
}
