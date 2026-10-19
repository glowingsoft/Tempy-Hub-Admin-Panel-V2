import { useCallback, useEffect, useState } from 'react';

import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { Iconify } from 'src/components/iconify';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';

// ----------------------------------------------------------------------

export const ALL_BRANCHES_VALUE = 'all';

export function useOwnerBranchFilter() {
  const [branchId, setBranchId] = useState(ALL_BRANCHES_VALUE);

  const onBranchChange = useCallback((nextBranchId) => {
    setBranchId(nextBranchId);
  }, []);

  return { branchId, onBranchChange };
}

export function OwnerBranchSelect({ value, onChange }) {
  const { organizationId } = useCurrentOrganization();

  const { branches } = useOrganizationLookups({
    organizationId,
    branches: !!organizationId,
    jobTitles: false,
    departments: false,
    limit: 100,
  });

  useEffect(() => {
    if (!branches.length) {
      if (value !== ALL_BRANCHES_VALUE) onChange(ALL_BRANCHES_VALUE);
      return;
    }

    const isSelectedAvailable =
      value === ALL_BRANCHES_VALUE || branches.some((branch) => branch._id === value);
    if (!isSelectedAvailable) {
      onChange(ALL_BRANCHES_VALUE);
    }
  }, [branches, onChange, value]);

  return (
    <TextField
      select
      size="small"
      label="Site"
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
      disabled={!branches.length}
      sx={{ minWidth: { xs: 1, sm: 260 } }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="solar:buildings-2-bold-duotone" width={20} sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        ),
      }}
    >
      <MenuItem value={ALL_BRANCHES_VALUE}>All sites</MenuItem>
      {branches.length ? (
        branches.map((branch) => (
          <MenuItem key={branch._id} value={branch._id} sx={{ textTransform: 'capitalize' }}>
            {branch.name}
          </MenuItem>
        ))
      ) : (
        <MenuItem value="">No sites available</MenuItem>
      )}
    </TextField>
  );
}

export function OwnerBranchFilterActions({ value, onChange, children }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', sm: 'center' }}
    >
      <OwnerBranchSelect value={value} onChange={onChange} />
      {children}
    </Stack>
  );
}
