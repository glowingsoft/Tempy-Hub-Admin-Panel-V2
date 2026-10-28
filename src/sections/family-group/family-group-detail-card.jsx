import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function FamilyGroupDetailCard({ title, children }) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6">{title}</Typography>
      <Divider sx={{ my: 2 }} />
      {children}
    </Card>
  );
}

FamilyGroupDetailCard.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};

export function FamilyGroupDetailItem({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}

FamilyGroupDetailItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.node,
};

export function FamilyGroupDetailGrid({ children }) {
  return (
    <Box
      sx={{
        display: 'grid',
        rowGap: 2.5,
        columnGap: 3,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
      }}
    >
      {children}
    </Box>
  );
}

FamilyGroupDetailGrid.propTypes = {
  children: PropTypes.node,
};
