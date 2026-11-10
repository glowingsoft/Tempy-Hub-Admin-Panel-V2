import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
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
  onSetEntitlement,
  canBookShift = true,
  canSetEntitlement = false,
}) {
  if (!cellData) return null;

  const { staff, day } = cellData;

  const handleBookShift = () => {
    onClose();
    onBookShift(cellData);
  };

  const handleSetEntitlement = () => {
    onClose();
    onSetEntitlement(cellData);
  };

  if (!canBookShift && !canSetEntitlement) return null;

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
        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
          {staff?.name || 'Staff Member'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {day?.label || day?.date || 'Selected Date'}
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <MenuList sx={{ p: 0.75 }}>
        {canBookShift && (
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
            Create Shift
          </MenuItem>
        )}

        {canSetEntitlement && onSetEntitlement && (
          <MenuItem
            onClick={handleSetEntitlement}
            sx={{
              py: 1,
              px: 1.25,
              borderRadius: 0.75,
              typography: 'body2',
              fontWeight: 500,
              gap: 1.5,
              '&:hover': {
                bgcolor: (theme) => `${theme.palette.info.lighter}80`,
                color: 'info.darker',
              },
            }}
          >
            <Iconify icon="solar:document-add-bold" width={18} sx={{ color: 'info.main' }} />
            Set Entitlement
          </MenuItem>
        )}
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
  onSetEntitlement: PropTypes.func,
  canBookShift: PropTypes.bool,
  canSetEntitlement: PropTypes.bool,
};
