import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { useGetPeepRecordsQuery } from 'src/store/Reducer/peep-floor-plan-api';
import { convertPdfToImage } from 'src/utils/pdf-to-image';

import { FloorPlanPin } from './floor-plan-pin';

export function FloorPlanViewer({
  floorPlan,
  pins = [],
  residentsById = {},
  placementMode = false,
  selectedResidentId = '',
  residents = [],
  organizationId,
  branchId,
  floorPlanId,
  onResidentChange = () => {},
  onPlanClick = () => {},
  onPinClick = () => {},
  onDeletePin = () => {},
  isDeletingPin = false,
  loading = false,
  showEmptyWhenMissing = false,
  pinPlacementDisabled = false,
  pinPlacementBusy = false,
}) {
  const [imgError, setImgError] = useState(false);
  const selectedResident = residentsById?.[selectedResidentId];
  const isUpdatingPin = pins.some((pin) => pin.residentId === selectedResidentId);
  const selectedPin = pins.find(
    (pin) => pin.residentId === selectedResidentId && pin.apiPinId
  );
  const residentOptions = residents.map((resident) => mapResidentOption(resident, pins));
  const mapResidentRecordOption = useCallback(
    (record) => mapPeepRecordOption(record, pins),
    [pins]
  );
  const handleResidentChange = useCallback(
    (option) => onResidentChange(option),
    [onResidentChange]
  );
  const selectedResidentOption = selectedResident
    ? mapResidentOption(selectedResident, pins)
    : null;

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
        <InfiniteAutocomplete
          key={`${organizationId || 'no-organization'}-${branchId || 'no-branch'}-${floorPlanId || 'mock'}`}
          value={selectedResidentOption}
          onChange={handleResidentChange}
          useQuery={useGetPeepRecordsQuery}
          queryArgs={{ organizationId, branchId }}
          mapOption={mapResidentRecordOption}
          extraOptions={residentOptions}
          enabled={Boolean(floorPlanId && organizationId && branchId)}
          limit={100}
          label="Room / resident"
          placeholder="Select a resident"
          sx={{
            width: {
              xs: '100%',
              sm: selectedResidentOption
                ? Math.max(255, selectedResidentOption.label.length * 8 + 80)
                : 255,
            },
            minWidth: { xs: '100%', sm: 255 },
            maxWidth: '100%',
          }}
        />

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
            pinPlacementBusy
              ? 'Saving pin...'
              : pinPlacementDisabled
              ? 'Pin placement is unavailable for this floor plan'
              : !floorPlan
              ? 'Upload a floor plan PDF first'
              : !selectedResidentId
              ? 'Select a resident from the dropdown first to place their pin'
              : placementMode
              ? `Click the plan to ${isUpdatingPin ? 'update' : 'place'} this resident's pin (or click here to cancel)`
              : `Click to ${isUpdatingPin ? 'update' : 'place'} a pin for Room ${selectedResident?.roomNumber} (${selectedResident?.name})`
          }
          arrow
        >
          <Button
            size="small"
            variant="contained"
            disabled={pinPlacementDisabled || pinPlacementBusy}
            startIcon={pinPlacementBusy ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Iconify
                icon={placementMode ? 'solar:cursor-bold' : 'solar:map-point-wave-bold'}
                sx={{
                  width: 19,
                  height: 19,
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
                }}
              />
            )}
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
            {pinPlacementBusy
              ? 'Saving pin...'
              : placementMode
              ? `Click plan to ${isUpdatingPin ? 'update' : 'place'}`
              : isUpdatingPin
                ? 'Update pin'
                : 'Place pin'}
          </Button>
        </Tooltip>

        {floorPlanId && selectedPin && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            disabled={isDeletingPin}
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => onDeletePin(selectedPin)}
            sx={{ height: 40, fontWeight: 700, textTransform: 'none' }}
          >
            Delete pin
          </Button>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ ml: { sm: 'auto' } }}>
          Pin colour follows the resident&apos;s current PEEP level.
        </Typography>
      </Stack>

      <Box>
        {loading ? (
          <Box sx={{ minHeight: 360, display: 'grid', placeItems: 'center', p: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : !floorPlan ? (
          <Box sx={{ minHeight: 360, display: 'grid', placeItems: 'center', p: 4, bgcolor: 'grey.50', textAlign: 'center' }}>
            <Stack spacing={1} alignItems="center">
              <Typography variant="subtitle1">
                {showEmptyWhenMissing ? 'Floor plan not found' : 'No floor plan uploaded'}
              </Typography>
              {!showEmptyWhenMissing && (
                <Typography variant="body2" color="text.secondary">
                  Add PEEP records now. Upload a PDF when the plan is available to place room pins.
                </Typography>
              )}
            </Stack>
          </Box>
        ) : (
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
            ) : showEmptyWhenMissing ? (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  p: 3,
                  bgcolor: 'grey.50',
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No floor plan image or PDF is available.
                </Typography>
              </Box>
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

function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapResidentOption(resident, pins) {
  const id = String(resident.id);
  const isPinned = pins.some((pin) => pin.residentId === id);
  const resName = capitalizeWords(resident.name || '');

  return {
    value: id,
    label: `Room ${resident.roomNumber || '—'} - ${resident.name || '—'}${isPinned ? ' (pinned)' : ''}`,
    resident,
    label: `Room ${resident.roomNumber || '—'} - ${resName || '—'}${isPinned ? ' (pinned)' : ''}`,
    resident: { ...resident, name: resName || resident.name },
  };
}

function mapPeepRecordOption(record, pins) {
  const resident =
    record?.resident && typeof record.resident === 'object' ? record.resident : {};
  const rawResidentId =
    resident._id ||
    resident.id ||
    record?.residentId ||
    (typeof record?.resident === 'string' ? record.resident : null);
  const residentId =
    typeof rawResidentId === 'object'
      ? rawResidentId?._id || rawResidentId?.id || null
      : rawResidentId;
  const id = residentId || record?._id || record?.id;

  if (!id) return null;

  const residentName = `${resident.firstName || ''} ${resident.lastName || ''}`.trim();

  const recordId = record?._id || record?.id;
  const mappedResident = {
    ...record,
    id: String(id),
    residentId: residentId ? String(residentId) : null,
    peepRecordId: recordId || null,
    name: record?.name || record?.residentName || resident.name || residentName || '—',
    roomNumber:
      record?.roomNumber || resident.roomNumber || record?.room?.number || record?.room || '—',
    peepLevel: record?.peepLevel || record?.level || 'low',
  };

  return mapResidentOption(mappedResident, pins);
}

export function PdfImageFallback({ plan, onConverted }) {
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [renderError, setRenderError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const target = plan?.file || plan?.url;
    setImgUrl(null);
    setRenderError(false);

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
        if (isMounted) {
          setRenderError(true);
          setLoading(false);
          toast.error(
            'Unable to display this floor plan PDF. Verify the file URL and S3 CORS configuration.'
          );
        }
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

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        p: 3,
        bgcolor: 'grey.50',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" color={renderError ? 'error.main' : 'text.secondary'}>
        {renderError ? 'Unable to render this floor plan PDF.' : 'No floor plan preview available.'}
      </Typography>
    </Box>
  );
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