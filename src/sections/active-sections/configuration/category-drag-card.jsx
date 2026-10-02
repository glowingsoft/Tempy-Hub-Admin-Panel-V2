import { Box, Card, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

export default function CategoryDragCard({ item, snapshot, index, showLabel, onEdit, onDelete }) {

  const { name, description, color = '#161C24', parentCategory, status } = item;

  return (
    <Card
      elevation={0}

      sx={{
        p: 2,
        borderRadius: 2,
        cursor: 'grab',
        userSelect: 'none',
        transition: '0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        boxShadow: snapshot.isDragging ? (theme) => theme.customShadows.z24 : undefined,
        transform: snapshot.isDragging ? 'rotate(1deg)' : 'none',
        borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
      }}
    >
      <Box sx={{ display: 'flex', color: 'text.disabled', cursor: 'grab' }}>
        <Iconify icon="mynaui:grip-dots-vertical" width={18} />
      </Box>

      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: color,
          flexShrink: 0,
        }}
      />

      <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>

        </Stack>
        {description && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {description}
          </Typography>
        )}
        {parentCategory && (
          <Box>
            <Label color={"primary"} >{parentCategory}</Label>
          </Box>
        )}
      </Stack>

      {status && (
        <Label color={status === 'active' ? 'success' : 'error'} >{status}</Label>
      )}

      <Typography variant="caption" color="text.disabled" sx={{ width: 24, textAlign: 'center' }}>
        {index}
      </Typography>

      <Tooltip title="Edit" arrow placement="top">
        <IconButton onClick={() => onEdit(item)}>
          <Iconify icon="solar:pen-bold" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete" arrow placement="top">
        <IconButton color="error" onClick={() => onDelete(item)}>
          <Iconify icon="solar:trash-bin-trash-bold" />
        </IconButton>
      </Tooltip>
    </Card>
  );
}

CategoryDragCard.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    color: PropTypes.string,
  }).isRequired,
  snapshot: PropTypes.object,
  index: PropTypes.number,
  showLabel: PropTypes.string,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
