import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { Iconify } from 'src/components/iconify';

import { mockBranches } from 'src/sections/branch/mocks/data';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';

// import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';

// ----------------------------------------------------------------------

export function StatsBranchSelect({ value, onChange }) {
  const { user } = useSelector((state) => state.user);
  const organizationId = getOwnerOrganizationId(user);

  // TODO: swap for the real query once the endpoint is wired up:
  // const { data, isLoading } = useGetBranchesQuery(
  //   { organizationId, page: 1, limit: 100 },
  //   { skip: !organizationId }
  // );
  // const branches = data?.data ?? [];

  const branches = useMemo(
    () =>
      mockBranches.filter((branch) => !organizationId || branch.organizationId === organizationId),
    [organizationId]
  );

  useEffect(() => {
    if (!branches.length) {
      if (value) onChange('');
      return;
    }

    const isSelectedAvailable = branches.some((branch) => branch._id === value);
    if (!isSelectedAvailable) {
      onChange(branches[0]._id);
    }
  }, [branches, onChange, value]);

  return (
    <TextField
      select
      size="small"
      label="Branch"
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
      {branches.length ? (
        branches.map((branch) => (
          <MenuItem key={branch._id} value={branch._id}>
            {branch.name}
          </MenuItem>
        ))
      ) : (
        <MenuItem value="">No branches available</MenuItem>
      )}
    </TextField>
  );
}
