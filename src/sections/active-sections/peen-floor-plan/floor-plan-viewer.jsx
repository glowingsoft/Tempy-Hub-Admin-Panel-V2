import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { convertPdfToImage } from 'src/utils/pdf-to-image';

import { FloorPlanPin } from './floor-plan-pin';

export function FloorPlanViewer({ floorPlan, pins, residentsById, placementMode, selectedResidentId, residents, onResidentChange, onPlanClick, onPinClick }) {
  const [imgError, setImgError] = useState(false);
  const selectedResident = residentsById?.[selectedResidentId];

  useEffect(() => {
    setImgError(false);
  }, [floorPlan?.imageUrl]);

  const handleClick = (event) => {
    if (!placementMode) return;

    const rect = event.currentTarget.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    onPlanClick({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    });
  };

  return (
    <Card
      sx={{
        minWidth: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ sm: 'center' }}
        sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', flexWrap: 'wrap', gap: 1.5 }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 240 } }}>
          <InputLabel id="floor-plan-resident-label">Room / resident</InputLabel>
          <Select
            labelId="floor-plan-resident-label"
            value={selectedResidentId}
            label="Room / resident"
            onChange={(event) => onResidentChange(event.target.value)}
          >
            <MenuItem value="">
              <em>Select a resident</em>
            </MenuItem>
            {residents.map((resident) => {
              const isPinned = pins.some((pin) => pin.residentId === resident.id);
              return (
                <MenuItem key={resident.id} value={resident.id}>
                  Room {resident.roomNumber} - {resident.name}
                  {isPinned ? ' (pinned)' : ''}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        {selectedResident && (
          <Label
            variant="soft"
            color={
              selectedResident.peepLevel === 'high'
                ? 'error'
                : selectedResident.peepLevel === 'medium'
                ? 'warning'
                : 'success'
            }
            sx={{
              textTransform: 'capitalize',
              fontWeight: 700,
              height: 32,
              px: 1.5,
              fontSize: 12,
              borderRadius: 1,
            }}
          >
            PEEP: {selectedResident.peepLevel}
          </Label>
        )}

        <Tooltip
          title={
            !floorPlan
              ? 'Upload a floor plan PDF first'
              : !selectedResidentId
              ? 'Select a resident from the dropdown first to place their pin'
              : placementMode
              ? 'Click anywhere on the floor plan image below to drop the pin (or click here to cancel)'
              : `Click to activate pin placement for Room ${selectedResident?.roomNumber} (${selectedResident?.name})`
          }
          arrow
        >
          <Button
            size="small"
            variant="contained"
            startIcon={
              <Iconify
                icon={placementMode ? 'solar:cursor-bold' : 'solar:map-point-wave-bold'}
                sx={{
                  width: 19,
                  height: 19,
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
                }}
              />
            }
            onClick={() => {
              if (!floorPlan) {
                toast.info('Please upload a floor plan PDF first.');
                return;
              }
              if (!selectedResidentId) {
                toast.info('Please select a resident from the dropdown first to place their pin.');
                return;
              }
              onPlanClick({ togglePlacement: true });
            }}
            sx={{
              height: 40,
              fontWeight: 700,
              fontSize: 13.5,
              textTransform: 'none',
              px: 2.5,
              borderRadius: 1.25,
              color: '#ffffff',
              letterSpacing: '0.2px',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              ...(placementMode
                ? {
                    bgcolor: '#0284C7',
                    boxShadow: '0 0 0 4px rgba(14, 165, 233, 0.35), 0 4px 14px rgba(14, 165, 233, 0.4)',
                    animation: 'pulsePlacePin 1.6s infinite ease-in-out',
                    '&:hover': {
                      bgcolor: '#0369A1',
                      boxShadow: '0 0 0 5px rgba(14, 165, 233, 0.45), 0 6px 18px rgba(14, 165, 233, 0.5)',
                    },
                  }
                : {
                    bgcolor: '#0EA5E9',
                    boxShadow: '0 2px 8px 0 rgba(14, 165, 233, 0.35)',
                    '&:hover': {
                      bgcolor: '#0284C7',
                      boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.45)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }),
              '@keyframes pulsePlacePin': {
                '0%': {
                  boxShadow: '0 0 0 0 rgba(14, 165, 233, 0.6), 0 2px 8px rgba(14, 165, 233, 0.35)',
                  transform: 'scale(1)',
                },
                '50%': {
                  boxShadow: '0 0 0 8px rgba(14, 165, 233, 0), 0 4px 14px rgba(14, 165, 233, 0.45)',
                  transform: 'scale(1.02)',
                },
                '100%': {
                  boxShadow: '0 0 0 0 rgba(14, 165, 233, 0), 0 2px 8px rgba(14, 165, 233, 0.35)',
                  transform: 'scale(1)',
                },
              },
            }}
          >
            {placementMode ? 'Click plan to place' : 'Place pin'}
          </Button>
        </Tooltip>

        <Typography variant="caption" color="text.secondary" sx={{ ml: { sm: 'auto' } }}>
          Pin colour follows the resident&apos;s current PEEP level.
        </Typography>
      </Stack>

      <Box>
        {!floorPlan && (
          <Box sx={{ minHeight: 360, display: 'grid', placeItems: 'center', p: 4, bgcolor: 'grey.50', textAlign: 'center' }}>
            <Stack spacing={1} alignItems="center">
              <Typography variant="subtitle1">No floor plan uploaded</Typography>
              <Typography variant="body2" color="text.secondary">
                Add PEEP records now. Upload a PDF when the plan is available to place room pins.
              </Typography>
            </Stack>
          </Box>
        )}

        {floorPlan && (
          <Box
            sx={{
              position: 'relative',
              width: 1,
              aspectRatio: floorPlan.aspectRatio ? `${floorPlan.aspectRatio}` : '1.55',
              bgcolor: 'common.white',
              boxShadow: (theme) => theme.customShadows?.z8,
              overflow: 'hidden',
            }}
          >
            {floorPlan.imageUrl && !imgError ? (
              <Box
                component="img"
                src={floorPlan.imageUrl}
                alt={floorPlan.fileName || 'Floor Plan'}
                onError={() => setImgError(true)}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: 1,
                  height: 1,
                  objectFit: 'contain',
                  bgcolor: 'common.white',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            ) : floorPlan.url || floorPlan.file ? (
              <PdfImageFallback plan={floorPlan} />
            ) : (
              <FloorPlanDrawing />
            )}

            <Box
              onClick={handleClick}
              sx={{
                position: 'absolute',
                inset: 0,
                cursor: placementMode ? 'crosshair' : 'default',
                pointerEvents: placementMode ? 'auto' : 'none',
              }}
            />

            {pins.map((pin) => {
              const resident = residentsById[pin.residentId];

              if (!resident) return null;

              return (
                <FloorPlanPin
                  key={pin.id}
                  pin={pin}
                  resident={resident}
                  onClick={(event) => {
                    event.stopPropagation();
                    onPinClick(resident);
                  }}
                />
              );
            })}
          </Box>
        )}
      </Box>
    </Card>
  );
}

export function PdfImageFallback({ plan, onConverted }) {
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const target = plan?.file || plan?.url;
    if (!target) {
      setLoading(false);
      return;
    }

    setLoading(true);
    convertPdfToImage(target)
      .then((res) => {
        if (isMounted) {
          const resolved = res.imageUrl || res.dataUrl;
          setImgUrl(resolved);
          setLoading(false);
          if (onConverted) onConverted(res);
        }
      })
      .catch((err) => {
        console.warn('Failed converting PDF to image in fallback:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [plan?.url, plan?.file, onConverted]);

  if (loading) {
    return (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50',
          gap: 1.5,
        }}
      >
        <CircularProgress size={32} />
        <Typography variant="caption" color="text.secondary">
          Rendering floor plan image...
        </Typography>
      </Box>
    );
  }

  if (imgUrl) {
    return (
      <Box
        component="img"
        src={imgUrl}
        alt={plan?.fileName || 'Floor Plan'}
        sx={{
          position: 'absolute',
          inset: 0,
          width: 1,
          height: 1,
          objectFit: 'contain',
          bgcolor: 'common.white',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    );
  }

  return <FloorPlanDrawing />;
}

export function FloorPlanDrawing() {
  return (
    <svg viewBox="0 0 1000 690" width="100%" height="100%" preserveAspectRatio="none">
      <rect x="70" y="50" width="860" height="590" fill="#fff" stroke="#202124" strokeWidth="7" />

      {/* Rooms */}
      <rect x="80" y="60" width="210" height="210" fill="#fff" stroke="#333" strokeWidth="4" />
      <rect x="290" y="60" width="210" height="210" fill="#fff" stroke="#333" strokeWidth="4" />
      <rect x="500" y="60" width="210" height="210" fill="#fff" stroke="#333" strokeWidth="4" />
      <rect x="710" y="60" width="210" height="210" fill="#fff" stroke="#333" strokeWidth="4" />

      <rect x="80" y="390" width="210" height="240" fill="#fff" stroke="#333" strokeWidth="4" />
      <rect x="710" y="390" width="210" height="240" fill="#fff" stroke="#333" strokeWidth="4" />

      {/* Central corridor */}
      <rect x="290" y="270" width="420" height="120" fill="#fafafa" stroke="#333" strokeWidth="4" />

      {/* Stair */}
      <rect x="420" y="390" width="160" height="180" fill="#fafafa" stroke="#333" strokeWidth="4" />

      {[0, 1, 2, 3, 4, 5].map((index) => (
        <line key={index} x1={440} y1={410 + index * 25} x2={560} y2={410 + index * 25} stroke="#777" strokeWidth="2" />
      ))}

      {/* Room labels */}
      <text x="185" y="155" textAnchor="middle" fontSize="28" fontWeight="600">
        101
      </text>

      <text x="395" y="155" textAnchor="middle" fontSize="28" fontWeight="600">
        102
      </text>

      <text x="605" y="155" textAnchor="middle" fontSize="28" fontWeight="600">
        103
      </text>

      <text x="815" y="155" textAnchor="middle" fontSize="28" fontWeight="600">
        104
      </text>

      <text x="185" y="510" textAnchor="middle" fontSize="28" fontWeight="600">
        105
      </text>

      <text x="815" y="510" textAnchor="middle" fontSize="28" fontWeight="600">
        106
      </text>
    </svg>
  );
}
