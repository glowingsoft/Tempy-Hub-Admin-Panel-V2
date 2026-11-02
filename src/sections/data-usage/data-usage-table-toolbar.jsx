import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function DataUsageTableToolbar({
  searchQuery,
  onSearchChange,
  selectedOrg,
  onOrgChange,
  organizations = [],
  showOrgFilter = true,
  onResetFilters,
  canReset,
}) {
  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ p: 2.5 }}
    >
      {showOrgFilter && (
      <FormControl sx={{ flexShrink: 0, width: { xs: 1, sm: 260 } }}>
        <InputLabel id="org-filter-select-label">Filter by Organization</InputLabel>
        <Select
          labelId="org-filter-select-label"
          id="org-filter-select"
          value={selectedOrg}
          onChange={(e) => onOrgChange(e.target.value)}
          label="Filter by Organization"
          renderValue={(selected) => {
            if (selected === 'all') return 'All Organizations';
            const found = organizations.find((o) => o.id === selected);
            return found ? found.name : selected;
          }}
          MenuProps={{
            PaperProps: {
              sx: { height: 280, maxHeight: 280, overflowY: 'auto' },
            },
          }}
        >
          <MenuItem value="all">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="solar:globus-bold-duotone" width={20} sx={{ color: 'primary.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                All Organizations
              </Typography>
            </Stack>
          </MenuItem>
          {organizations.map((org) => (
            <MenuItem key={org.id} value={org.id}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:buildings-bold-duotone" width={20} sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" noWrap>
                  {org.name}
                </Typography>
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      )}

      {/* Expanded Search Input Bar */}
      <TextField
        fullWidth
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search organization or owner..."
        sx={{ flexGrow: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onSearchChange('')} edge="end">
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Reset Filter Button */}
      {canReset && (
        <Button
          color="error"
          sx={{ flexShrink: 0 }}
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Reset
        </Button>
      )}
    </Stack>
  );
}
