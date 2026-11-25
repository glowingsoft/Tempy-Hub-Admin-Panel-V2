import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';

const PIN_COLORS = {
  low: 'success.main',
  medium: 'warning.main',
  high: 'error.main',
};

export function FloorPlanPin({
  pin,
  resident,
  isSelected = false,
  canDrag = false,
  onDragMove,
  onDragEnd,
  onDragCancel,
  onClick,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef(null);
  const lastWasMovedRef = useRef(false);

  const normalizedPeepLevel = String(resident?.peepLevel || '').trim().toLowerCase();
  const color = PIN_COLORS[normalizedPeepLevel] || 'grey.500';

  const handlePointerDown = (event) => {
    if (!canDrag || event.button !== 0) return;

    event.stopPropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (err) {
      // ignore
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      isDown: true,
      hasMoved: false,
    };
  };

  const handlePointerMove = (event) => {
    const state = dragStateRef.current;
    if (!state?.isDown) return;

    event.stopPropagation();
    const dist = Math.hypot(event.clientX - state.startX, event.clientY - state.startY);

    if (!state.hasMoved && dist >= 2) {
      state.hasMoved = true;
      setIsDragging(true);
    }

    if (state.hasMoved && onDragMove) {
      onDragMove(pin, event.clientX, event.clientY);
    }
  };

  const handlePointerUp = (event) => {
    const state = dragStateRef.current;
    if (!state?.isDown) return;

    event.stopPropagation();
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (err) {
      // ignore
    }

    const wasMoved = state.hasMoved;
    lastWasMovedRef.current = wasMoved;
    dragStateRef.current = null;
    setIsDragging(false);

    if (wasMoved) {
      if (onDragEnd) {
        onDragEnd(pin, event.clientX, event.clientY);
      }
    }
  };

  const handlePointerCancel = (event) => {
    const state = dragStateRef.current;
    if (!state?.isDown) return;

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch (err) {
      // ignore
    }

    const wasMoved = state.hasMoved;
    lastWasMovedRef.current = false;
    dragStateRef.current = null;
    setIsDragging(false);

    if (wasMoved && onDragCancel) {
      onDragCancel(pin);
    }
  };

  const handleClick = (event) => {
    event.stopPropagation();
    if (lastWasMovedRef.current) {
      lastWasMovedRef.current = false;
      return;
    }
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Tooltip
      title={`Room ${resident.roomNumber} · ${resident.name}`}
      placement="top"
      open={isDragging ? false : undefined}
      disableHoverListener={isDragging}
    >
      <Box
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        sx={{
          position: 'absolute',
          left: `${pin.x * 100}%`,
          top: `${pin.y * 100}%`,
          transform: isDragging
            ? 'translate(-50%, -100%) scale(1.2)'
            : isSelected
            ? 'translate(-50%, -100%) scale(1.15)'
            : 'translate(-50%, -100%)',
          zIndex: isDragging ? 25 : isSelected ? 15 : 5,
          cursor: canDrag ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
          color,
          touchAction: 'none',
          userSelect: 'none',
          filter: isDragging
            ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.35))'
            : isSelected
            ? 'drop-shadow(0 0 10px currentColor)'
            : undefined,
          transition: isDragging ? 'none' : 'transform 0.15s ease, filter 0.2s ease',
          '&:hover': {
            transform: isDragging
              ? 'translate(-50%, -100%) scale(1.2)'
              : 'translate(-50%, -100%) scale(1.15)',
          },
        }}
      >
        {isSelected && !isDragging && (
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '38%',
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: '2px solid currentColor',
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%)',
              animation: 'selectedPinPulse 1.6s infinite ease-out',
              '@keyframes selectedPinPulse': {
                '0%': {
                  transform: 'translate(-50%, -50%) scale(0.85)',
                  opacity: 0.9,
                },
                '100%': {
                  transform: 'translate(-50%, -50%) scale(1.85)',
                  opacity: 0,
                },
              },
            }}
          />
        )}

        <Iconify
          icon="solar:map-point-bold"
          width={38}
          height={38}
        />

        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '35%',
            transform: 'translate(-50%, -50%)',
            width: 8,
            height: 8,
            bgcolor: 'common.white',
            borderRadius: '50%',
          }}
        />
      </Box>
    </Tooltip>
  );
}
