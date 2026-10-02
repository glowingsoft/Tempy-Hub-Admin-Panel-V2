import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Renders as a dropdown ("All locations (3)") matching the Staff page
// header. TextField's `select` prop wraps MUI <Select>, which requires
// MenuItem children with a `value` — not ListItemButton — so it can
// track selection and fire onChange itself.
// ----------------------------------------------------------------------

export default function RotaLocationList({ locations, selectedId, onSelect }) {
  return (
    <TextField
      select
      fullWidth
      value={selectedId}
      onChange={(event) => onSelect(event.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="solar:map-point-linear" sx={{ color: 'primary.main' }} />
          </InputAdornment>
        ),
      }}
    >
      {locations.map((location) => (
        <MenuItem key={location.id} value={location.id}>
          <Typography variant="body2">
            {location.name} ({location.count})
          </Typography>
        </MenuItem>
      ))}
    </TextField>
  );
}