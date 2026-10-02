import PropTypes from 'prop-types';
import { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';


function SortableRow({ id, index, renderItem, item }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ mb: 1 }}>
      {renderItem({
        item,
        index,
        snapshot: { isDragging },
        dragHandleProps: { ...attributes, ...listeners },
      })}
    </Box>
  );
}

SortableRow.propTypes = {
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  renderItem: PropTypes.func.isRequired,
  item: PropTypes.object.isRequired,
};


export default function DragDropList({ data, isLoading, renderItem, updateOrder }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = useMemo(() => data.map((item) => item._id), [data]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const sourceIndex = data.findIndex((item) => item._id === active.id);
    const destinationIndex = data.findIndex((item) => item._id === over.id);

    if (sourceIndex === -1 || destinationIndex === -1) return;

    const item = data[sourceIndex];
    updateOrder?.({ item, sourceIndex, destinationIndex });
  };

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (!data?.length) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
        <Typography variant="body2" color="text.secondary">
          Nothing here yet.
        </Typography>
      </Stack>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <Box>
          {data.map((item, index) => (
            <SortableRow key={item._id} id={item._id} index={index} item={item} renderItem={renderItem} />
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
}

DragDropList.propTypes = {
  data: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  renderItem: PropTypes.func.isRequired,
  updateOrder: PropTypes.func,
};