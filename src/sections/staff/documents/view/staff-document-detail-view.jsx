// staff-document-detail-view.jsx
// Staff-facing document detail page.
// Renders the full document inline and — when the document's actionType is
// "sign" — shows a signature pad so the staff member can sign right there.
// For "continue" (read & acknowledge) documents a simple Acknowledge button
// is shown instead.

import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { useParams, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { convertPdfToImage } from 'src/utils/pdf-to-image';

import { SignaturePad } from '../signature-pad';
import { getDocumentById, getFolderLabel, updateDocument } from 'src/sections/active-sections/documents/mocks/data';

// ----------------------------------------------------------------------

function isImage(fileType) {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes((fileType || '').toLowerCase());
}

// ----------------------------------------------------------------------
// Document viewer — renders ALL pages of PDF via PDF.js canvas with iframe fallback
// ----------------------------------------------------------------------

function DocumentViewer({ fileUrl, fileType, name }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const isPdf =
    (fileType || '').toLowerCase() === 'pdf' ||
    (typeof fileUrl === 'string' &&
      (fileUrl.toLowerCase().includes('.pdf') || fileUrl.startsWith('blob:')));

  useEffect(() => {
    let isMounted = true;
    if (!fileUrl) return;

    if (isImage(fileType)) {
      setPages([{ pageNumber: 1, imageUrl: fileUrl, dataUrl: fileUrl }]);
      setLoading(false);
      return;
    }

    if (isPdf) {
      setLoading(true);
      setError(false);
      const targetUrl =
        typeof fileUrl === 'string' && !fileUrl.startsWith('blob:')
          ? encodeURI(fileUrl)
          : fileUrl;

      convertPdfToImage(targetUrl, { scale: 1.8 })
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
          console.warn('PDF to image conversion fallback to iframe:', err);
          if (isMounted) {
            setError(true);
            setLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [fileUrl, fileType, isPdf]);

  if (!fileUrl) {
    return (
      <EmptyContent
        title="No document attached"
        description="The document file is not yet available."
        sx={{ py: 10 }}
      />
    );
  }

  if (loading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          py: 12,
          bgcolor: 'background.neutral',
          borderRadius: 1,
          gap: 1.5,
        }}
      >
        <CircularProgress size={36} />
        <Typography variant="body2" color="text.secondary">
          Rendering document preview…
        </Typography>
      </Stack>
    );
  }

  // If rendered as image pages (multi-page PDF or single image)
  if (pages.length > 0 && !error) {
    return (
      <Box
        sx={{
          width: 1,
          bgcolor: 'background.neutral',
          borderRadius: 1.5,
          p: { xs: 1, sm: 2 },
          border: (theme) => `1px solid ${theme.palette.divider}`,
          maxHeight: { xs: 580, md: 800 },
          overflowY: 'auto',
        }}
      >
        <Stack spacing={2} sx={{ width: 1, alignItems: 'center' }}>
          {pages.map((page, index) => (
            <Box
              key={page.pageNumber || index}
              sx={{
                width: 1,
                bgcolor: 'common.white',
                borderRadius: 1,
                boxShadow: (theme) => theme.customShadows?.z4 || '0 2px 8px rgba(0,0,0,0.08)',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {pages.length > 1 && (
                <Box
                  sx={{
                    width: 1,
                    px: 2,
                    py: 0.75,
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Page {page.pageNumber || index + 1} of {pages.length}
                  </Typography>
                </Box>
              )}

              <Box
                component="img"
                src={page.imageUrl || page.dataUrl}
                alt={`${name} - Page ${page.pageNumber || index + 1}`}
                sx={{
                  width: 1,
                  height: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  // Fallback: iframe with encoded URI
  const safeUrl = typeof fileUrl === 'string' ? encodeURI(fileUrl) : fileUrl;

  return (
    <Box
      component="iframe"
      src={safeUrl}
      title={name}
      sx={{
        width: 1,
        height: { xs: 520, md: 740 },
        border: 0,
        borderRadius: 1,
        bgcolor: 'background.neutral',
      }}
    />
  );
}

// ----------------------------------------------------------------------
// Metadata row helper
// ----------------------------------------------------------------------

function MetaRow({ icon, label, children }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Iconify icon={icon} width={18} sx={{ color: 'text.secondary', mt: 0.25, flexShrink: 0 }} />
      <Box>
        <Typography variant="caption" color="text.disabled" display="block" sx={{ lineHeight: 1.4 }}>
          {label}
        </Typography>
        <Box sx={{ mt: 0.5 }}>{children}</Box>
      </Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function StaffDocumentDetailView() {
  const { id } = useParams();
  const router = useRouter();

  const document_ = getDocumentById(id);

  // Local state initialized from document record:
  // acknowledged  — whether the staff member has already acknowledged / signed
  // signature     — data URL of the drawn signature, set after signing
  const [acknowledged, setAcknowledged] = useState(
    () => Boolean(document_?.signed || document_?.isSigned || document_?.acknowledged)
  );
  const [signature, setSignature] = useState(
    () => document_?.signature || null
  );

  const handleAcknowledge = useCallback(() => {
    setAcknowledged(true);
    if (document_?._id) {
      updateDocument(document_._id, {
        acknowledged: true,
        acknowledgedAt: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }
    toast.success('Document acknowledged!');
  }, [document_]);

  const handleSign = useCallback((dataUrl) => {
    setSignature(dataUrl);
    setAcknowledged(true);
    if (document_?._id) {
      updateDocument(document_._id, {
        signed: true,
        isSigned: true,
        signature: dataUrl,
        signedAt: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }
    toast.success('Document signed successfully!');
  }, [document_]);

  if (!document_) {
    return (
      <DashboardContent>
        <Button
          onClick={router.back}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Document not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  const requiresSignature = document_.actionType === 'sign';

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={document_.name}
        links={[
          { name: 'Dashboard', href: paths.staff.dashboard },
          { name: 'Documents', href: paths.staff.documents.root },
          { name: document_.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
          alignItems: 'flex-start',
        }}
      >
        {/* ── Document Viewer ── */}
        <Stack spacing={3}>
          <Card sx={{ overflow: 'hidden' }}>
            {/* Viewer header */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 3, py: 2, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify
                  icon={
                    isImage(document_.fileType)
                      ? 'solar:gallery-bold-duotone'
                      : 'solar:file-text-bold-duotone'
                  }
                  width={22}
                  sx={{ color: 'primary.main' }}
                />
                <Typography variant="subtitle2">{document_.name}</Typography>
              </Stack>
            </Stack>

            <Box sx={{ p: 2 }}>
              <DocumentViewer
                fileUrl={document_.fileUrl}
                fileType={document_.fileType}
                name={document_.name}
              />
            </Box>
          </Card>

          {/* ── Action Card (sign / acknowledge) ── */}
          {acknowledged ? (
            <Card>
              <CardContent>
                <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: 'success.lighter',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Iconify
                      icon="solar:check-circle-bold-duotone"
                      width={32}
                      sx={{ color: 'success.main' }}
                    />
                  </Box>
                  <Typography variant="h6" textAlign="center">
                    {requiresSignature ? 'Document signed' : 'Document acknowledged'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    {requiresSignature
                      ? 'Your signature has been recorded. Thank you.'
                      : 'You have acknowledged this document. Thank you.'}
                  </Typography>

                  {signature && (
                    <Box
                      sx={{
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        p: 1,
                        bgcolor: 'background.neutral',
                        width: 1,
                        maxWidth: 400,
                      }}
                    >
                      <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 0.5 }}>
                        Your signature
                      </Typography>
                      <Box
                        component="img"
                        src={signature}
                        alt="Signature"
                        sx={{ width: 1, height: 80, objectFit: 'contain' }}
                      />
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                {requiresSignature ? (
                  <Stack spacing={3}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1">Sign document</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Please read the document above carefully, then draw your signature below to confirm you
                        have read and agree to its contents.
                      </Typography>
                    </Stack>

                    <Divider />

                    <SignaturePad onSign={handleSign} />
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1">Acknowledge document</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Please read the document above carefully, then click the button below to confirm you
                        have read and understood its contents.
                      </Typography>
                    </Stack>

                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      size="large"
                      startIcon={<Iconify icon="solar:check-circle-bold" />}
                      onClick={handleAcknowledge}
                    >
                      I have read and acknowledge this document
                    </Button>
                  </Stack>
                )}
              </CardContent>
            </Card>
          )}
        </Stack>

        {/* ── Metadata Panel ── */}
        <Card sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2.5 }}>
            Document details
          </Typography>

          <Stack spacing={2.5}>
            <MetaRow icon="solar:tag-bold" label="Category">
              <Typography variant="body2">{document_.category?.replace(/_/g, ' ') || '—'}</Typography>
            </MetaRow>

            {document_.folder && (
              <MetaRow icon="solar:folder-bold" label="Folder">
                <Typography variant="body2">{getFolderLabel(document_.folder)}</Typography>
              </MetaRow>
            )}

            <MetaRow icon="solar:shield-check-bold" label="Required action">
              {requiresSignature ? (
                <Label variant="soft" color="error">
                  Signature required
                </Label>
              ) : (
                <Label variant="soft" color="info">
                  Read & acknowledge
                </Label>
              )}
            </MetaRow>

            <MetaRow icon="solar:shield-check-bold" label="Status">
              {acknowledged ? (
                <Label variant="soft" color="success">
                  {requiresSignature ? 'Signed' : 'Acknowledged'}
                </Label>
              ) : (
                <Label variant="soft" color="warning">
                  Pending
                </Label>
              )}
            </MetaRow>

            {document_.version && (
              <MetaRow icon="solar:layers-bold" label="Version">
                <Typography variant="body2">{document_.version}</Typography>
              </MetaRow>
            )}

            <MetaRow icon="solar:calendar-bold" label="Last updated">
              <Typography variant="body2">{document_.updatedAt || '—'}</Typography>
            </MetaRow>

            {document_.uploadedBy && (
              <MetaRow icon="solar:user-id-bold" label="Issued by">
                <Typography variant="body2">{document_.uploadedBy}</Typography>
              </MetaRow>
            )}
          </Stack>

          {document_.description && (
            <>
              <Divider sx={{ my: 2.5 }} />
              <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 1 }}>
                About this document
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {document_.description}
              </Typography>
            </>
          )}
        </Card>
      </Box>
    </DashboardContent>
  );
}
