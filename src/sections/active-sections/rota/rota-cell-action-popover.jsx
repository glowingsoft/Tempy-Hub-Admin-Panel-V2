import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function RotaCellActionPopover({
  open,
  anchorEl,
  onClose,
  cellData,
  onBookShift,
  onCreateLeave,
}) {
  if (!cellData) return null;

  const { staff, day } = cellData;

  const handleBookShift = () => {
    onClose();
    onBookShift(cellData);
  };

  const handleCreateLeave = () => {
    onClose();
    onCreateLeave(cellData);
  };

  return (
    <CustomPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{
        arrow: { placement: 'top-left' },
      }}
      sx={{ width: 220, p: 0 }}
    >
      {/* Popover Header with Staff Name & Date */}
      <Box sx={{ p: 1.5, pb: 1 }}>
        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
          {staff?.name || 'Staff Member'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {day?.label || day?.date || 'Selected Date'}
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <MenuList sx={{ p: 0.75 }}>
        <MenuItem
          onClick={handleBookShift}
          sx={{
            py: 1,
            px: 1.25,
            borderRadius: 0.75,
            typography: 'body2',
            fontWeight: 500,
            gap: 1.5,
            '&:hover': {
              bgcolor: (theme) => `${theme.palette.primary.lighter}80`,
              color: 'primary.darker',
            },
          }}
        >
          <Iconify icon="solar:calendar-add-bold" width={18} sx={{ color: 'primary.main' }} />
          Book Shift
        </MenuItem>

        <MenuItem
          onClick={handleCreateLeave}
          sx={{
            py: 1,
            px: 1.25,
            borderRadius: 0.75,
            typography: 'body2',
            fontWeight: 500,
            gap: 1.5,
            '&:hover': {
              bgcolor: (theme) => `${theme.palette.warning.lighter}80`,
              color: 'warning.darker',
            },
          }}
        >
          <Iconify icon="solar:sun-2-bold" width={18} sx={{ color: 'warning.main' }} />
          Create Leave
        </MenuItem>
      </MenuList>
    </CustomPopover>
  );
}

RotaCellActionPopover.propTypes = {
  open: PropTypes.bool,
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  cellData: PropTypes.shape({
    staff: PropTypes.object,
    day: PropTypes.object,
  }),
  onBookShift: PropTypes.func,
  onCreateLeave: PropTypes.func,
};
