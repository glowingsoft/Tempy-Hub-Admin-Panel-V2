import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { convertPdfToImage } from 'src/utils/pdf-to-image';
import { SAMPLE_GAZETTE_PDF } from './mocks/data';

// ----------------------------------------------------------------------

export function GazettePreviewDialog({
  open,
  onClose,
  resident,
  issueTitle = 'Issue 14',
}) {
  const theme = useTheme();

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(false);

  const pdfUrl = resident?.pdfUrl || SAMPLE_GAZETTE_PDF;

  useEffect(() => {
    let isMounted = true;

    if (!open || !pdfUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    setZoom(1);

    convertPdfToImage(pdfUrl, { scale: 2.0 })
      .then((res) => {
        if (isMounted) {
          if (res.pages && res.pages.length > 0) {
            setPages(res.pages);
          } else if (res.imageUrl || res.dataUrl) {
            setPages([{ pageNumber: 1, imageUrl: res.imageUrl || res.dataUrl }]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('PDF conversion fallback to direct render:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, pdfUrl]);

  if (!resident) return null;

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(2.0, Number((prev + 0.2).toFixed(2))));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.6, Number((prev - 0.2).toFixed(2))));
  const handleResetZoom = () => setZoom(1);

  // Print handler
  const handlePrint = () => {
    toast.success(`Sending ${resident.resident}'s Gazette to printer...`);
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      window.print?.();
    }
  };

  // Download handler
  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${resident.resident.replace(/\s+/g, '_')}_Gazette_${issueTitle}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${resident.resident} - Gazette ${issueTitle}.pdf`);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="solar:document-text-bold-duotone" width={24} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {resident.resident} · Gazette {issueTitle}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Room {resident.room} · Florence House Autumn Gazette PDF Preview
              {pages.length > 0 ? ` · ${pages.length} ${pages.length === 1 ? 'Page' : 'Pages'}` : ''}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          {/* Zoom controls */}
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{
              bgcolor: 'background.neutral',
              borderRadius: 1,
              px: 1,
              py: 0.5,
            }}
          >
            <Tooltip title="Zoom out">
              <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 0.6}>
                <Iconify icon="solar:magnifer-minus-linear" width={18} />
              </IconButton>
            </Tooltip>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ minWidth: 42, textAlign: 'center', cursor: 'pointer' }}
              onClick={handleResetZoom}
            >
              {Math.round(zoom * 100)}%
            </Typography>
            <Tooltip title="Zoom in">
              <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 2.0}>
                <Iconify icon="solar:magnifer-plus-linear" width={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset zoom">
              <IconButton size="small" onClick={handleResetZoom}>
                <Iconify icon="solar:restart-bold" width={16} />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Close Dialog */}
          <IconButton onClick={onClose} size="small">
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* Main Preview Container: Continuous vertical scroll for all pages without extra gaps */}
      <DialogContent
        dividers
        sx={{
          p: 0,
          bgcolor: (t) => (t.palette.mode === 'light' ? '#EAECEF' : 'grey.900'),
          height: { xs: 540, md: 720 },
          maxHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              minHeight: 360,
              gap: 1.5,
            }}
          >
            <CircularProgress size={36} />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Rendering PDF preview...
            </Typography>
          </Box>
        ) : error || pages.length === 0 ? (
          <Box
            component="iframe"
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            title={`${resident.resident} Gazette PDF`}
            sx={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
          />
        ) : (
          <Stack
            spacing={1}
            alignItems="center"
            sx={{
              py: 2,
              px: { xs: 1, sm: 2 },
              width: '100%',
              maxWidth: `${Math.round(860 * zoom)}px`,
              transition: 'max-width 0.15s ease-out',
            }}
          >
            {pages.map((p, idx) => {
              const imgSrc = p.imageUrl || p.dataUrl;
              return (
                <Box
                  key={p.pageNumber || idx}
                  component="img"
                  src={imgSrc}
                  alt={`${resident.resident} Gazette Page ${p.pageNumber || idx + 1}`}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    boxShadow: '0 3px 12px rgba(0,0,0,0.15)',
                    borderRadius: 0.5,
                    bgcolor: 'common.white',
                    userSelect: 'none',
                  }}
                />
              );
            })}
          </Stack>
        )}
      </DialogContent>

      {/* Action Buttons */}
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleDownloadPdf}
          startIcon={<Iconify icon="solar:file-download-bold" />}
          sx={{ fontWeight: 600 }}
        >
          Download PDF
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handlePrint}
          startIcon={<Iconify icon="solar:printer-bold" />}
          sx={{ fontWeight: 700 }}
        >
          Print Gazette
        </Button>
      </DialogActions>
    </Dialog>
  );
}

GazettePreviewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  resident: PropTypes.object,
  issueTitle: PropTypes.string,
};

export default GazettePreviewDialog;
