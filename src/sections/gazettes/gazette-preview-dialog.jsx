import { useState, useEffect, useRef } from 'react';
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
import Card from '@mui/material/Card';
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

  // PDF to Image rendering state (matching Peep Floor Plan viewer)
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
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
    setCurrentPage(0);

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
  const handleZoomIn = () => setZoom((prev) => Math.min(2.5, Number((prev + 0.25).toFixed(2))));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))));
  const handleResetZoom = () => setZoom(1);

  // Pagination controls
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(0, prev - 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1));

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

  // Open external tab
  const handleOpenExternal = () => {
    window.open(pdfUrl, '_blank');
  };

  const activePageObj = pages[currentPage];
  const activeImageSrc = activePageObj?.imageUrl || activePageObj?.dataUrl;

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
              <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 0.5}>
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
              <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 2.5}>
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

      {/* Main Preview Container matching Peep Floor Plan viewer */}
      <DialogContent dividers sx={{ p: 2, bgcolor: 'grey.100', overflow: 'hidden' }}>
        <Card
          sx={{
            width: '100%',
            height: { xs: 520, md: 700 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            bgcolor: 'common.white',
            position: 'relative',
            borderRadius: 1.5,
            boxShadow: theme.customShadows?.z8,
          }}
        >
          {loading ? (
            /* Loading State matching peep floor plan viewer */
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
              }}
            >
              <CircularProgress size={36} />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Rendering PDF preview...
              </Typography>
            </Box>
          ) : error || !activeImageSrc ? (
            /* Direct PDF Iframe Fallback if conversion fails */
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
            /* High-Res Canvas/Image Rendering matching peep floor plan */
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
                p: 2,
              }}
            >
              <Box
                component="img"
                src={activeImageSrc}
                alt={`${resident.resident} Gazette Page ${currentPage + 1}`}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  borderRadius: 1,
                  userSelect: 'none',
                }}
              />
            </Box>
          )}

          {/* Multiple Pages Selector if PDF has multiple pages */}
          {pages.length > 1 && !loading && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                position: 'absolute',
                bottom: 16,
                bgcolor: 'rgba(33, 43, 54, 0.85)',
                color: 'common.white',
                px: 2,
                py: 0.75,
                borderRadius: 3,
                boxShadow: theme.customShadows?.z12,
                zIndex: 2,
              }}
            >
              <IconButton
                size="small"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                sx={{ color: 'common.white', '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' } }}
              >
                <Iconify icon="solar:alt-arrow-left-bold" width={18} />
              </IconButton>
              <Typography variant="caption" fontWeight={700}>
                Page {currentPage + 1} of {pages.length}
              </Typography>
              <IconButton
                size="small"
                onClick={handleNextPage}
                disabled={currentPage === pages.length - 1}
                sx={{ color: 'common.white', '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' } }}
              >
                <Iconify icon="solar:alt-arrow-right-bold" width={18} />
              </IconButton>
            </Stack>
          )}
        </Card>
      </DialogContent>

      {/* Action Buttons */}
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleOpenExternal}
          startIcon={<Iconify icon="solar:square-top-down-bold" />}
          sx={{ fontWeight: 600 }}
        >
          Open in New Tab
        </Button>

        <Stack direction="row" spacing={1.5}>
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
        </Stack>
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
