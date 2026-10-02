// employee-info-item.jsx

import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function EmployeeInfoItem({ label, value }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 0.5,
          color: 'text.disabled',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
        }}
      >
        {label}
      </Typography>

      <Typography variant="body2" fontWeight={600}>
        {value || '--'}
      </Typography>
    </Box>
  );
}

EmployeeInfoItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
};