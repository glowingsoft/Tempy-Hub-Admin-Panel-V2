import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export function SignaturePad({ onSign }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [hasStrokes, setHasStrokes] = useState(false);

  const getPos = (canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    const e = event.touches ? event.touches[0] : event;
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    isDrawing.current = true;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(canvas, e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setHasStrokes(true);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  const handleSign = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSign(dataUrl);
  };

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          border: (theme) => `1.5px dashed ${theme.palette.divider}`,
          borderRadius: 1.5,
          bgcolor: 'background.paper',
          overflow: 'hidden',
          cursor: 'crosshair',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        <Box
          component="canvas"
          ref={canvasRef}
          width={600}
          height={160}
          sx={{ display: 'block', width: 1, height: 160 }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </Box>

      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
        <Button variant="outlined" color="inherit" onClick={handleClear} disabled={!hasStrokes}>
          Clear
        </Button>
        <Button variant="contained" onClick={handleSign} disabled={!hasStrokes}>
          Sign document
        </Button>
      </Stack>
    </Stack>
  );
}
