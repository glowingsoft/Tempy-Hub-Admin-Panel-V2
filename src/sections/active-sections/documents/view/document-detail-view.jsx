// document-detail-view.jsx
// Document detail page supporting inline multi-page PDF viewing, metadata,
// and replacement. Signature pad is NOT shown to line manager, site manager,
// or owner — signing is reserved for the designated staff member.

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { useParams, useRouter, usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { DashboardContent } from 'src/layouts/dashboard';
import { convertPdfToImage } from 'src/utils/pdf-to-image';

import { AcknowledgementTrackerCard } from './acknowledgement-tracker-card';
import { getFolderLabel, getDocumentById } from '../mocks/data';
import UploadDocumentModal from '../upload-document-modal';

// ----------------------------------------------------------------------

const SCOPE_COLOR = {
  all_staff: 'info',
  site: 'warning',
  department: 'secondary',
  role: 'default',
  specific_staff: 'primary',
  personal: 'error',
};

const ACTION_TYPE_META = {
  sign: { label: 'Signature required', color: 'error', icon: 'solar:pen-new-square-bold' },
  continue: { label: 'Read & acknowledge', color: 'info', icon: 'solar:eye-bold' },
};

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
        description="Replace this record to attach a file."
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

export function DocumentDetailView({ ownerDashboard = false, basePath }) {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const document_ = getDocumentById(id);
  const replaceModal = useBoolean();

  const listPath =
    basePath ||
    pathname.substring(0, pathname.lastIndexOf('/')) ||
    (ownerDashboard ? paths.owner.documents.root : paths.siteManager.documents.root);

  const dashboardRoot = pathname.startsWith('/admin-dashboard')
    ? paths.adminDashboard?.root || '/admin-dashboard'
    : pathname.startsWith('/owner-dashboard')
      ? paths.owner?.root || '/owner-dashboard'
      : pathname.startsWith('/line-manager')
        ? paths.lineManager?.root || '/line-manager'
        : paths.siteManager?.root || '/site-manager';

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

  const actionMeta = ACTION_TYPE_META[document_.actionType] || ACTION_TYPE_META.sign;
  const isSigned = Boolean(document_.isSigned || document_.signed);
  const showAcknowledgementTracker =
    pathname.startsWith('/line-manager') ||
    pathname.startsWith('/site-manager') ||
    pathname.startsWith('/owner-dashboard');
  const acknowledgementTrackerPath = pathname.startsWith('/owner-dashboard')
    ? paths.owner.documents.acknowledgements(id)
    : pathname.startsWith('/line-manager')
      ? paths.lineManager.documents.acknowledgements(id)
      : paths.siteManager.documents.acknowledgements(id);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={document_.name}
        links={[
          {
            name: 'Dashboard',
            href: dashboardRoot,
          },
          { name: 'Documents', href: listPath },
          { name: document_.name },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Replace document">
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:refresh-bold" />}
                onClick={replaceModal.onTrue}
              >
                Replace
              </Button>
            </Tooltip>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) minmax(0, 340px)' },
          alignItems: 'stretch',
        }}
      >
        {/* Left Column: Viewer & Recorded Signature (if signed) */}
        <Stack spacing={3} sx={{ minHeight: 0 }}>
          {/* Document Viewer Card */}
          <Card sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
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
                {document_.version && (
                  <Chip label={document_.version} size="small" variant="soft" color="default" />
                )}
              </Stack>
            </Stack>

            {/* Viewer body */}
            <Box sx={{ p: 2 }}>
              <DocumentViewer
                fileUrl={document_.fileUrl}
                fileType={document_.fileType}
                name={document_.name}
              />
            </Box>
          </Card>

          {/* Captured Signature Card (Read-only for managers/owners if document was signed by staff) */}
          {document_.signature && (
            <Card sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <Iconify icon="solar:check-circle-bold" width={22} sx={{ color: 'success.main' }} />
                <Typography variant="subtitle1">Staff Signature</Typography>
                <Chip
                  label={document_.signedAt ? `Signed: ${document_.signedAt}` : 'Signed'}
                  color="success"
                  size="small"
                  variant="soft"
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Electronic signature captured from {document_.assignedTo || 'staff member'}:
              </Typography>
              <Box
                component="img"
                src={document_.signature}
                alt="Captured Signature"
                sx={{
                  height: 70,
                  maxWidth: 240,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  p: 1,
                  bgcolor: 'background.neutral',
                }}
              />
            </Card>
          )}
        </Stack>

        {/* Right Column: Metadata Panel */}
        <Stack spacing={3} sx={{ minWidth: 0 }}>
          {/* Details card */}
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

              <MetaRow icon="solar:users-group-rounded-bold" label="Scope">
                <Label
                  variant="soft"
                  color={SCOPE_COLOR[document_.scopeType] || 'default'}
                >
                  {document_.scopeLabel || document_.scopeType || '—'}
                </Label>
              </MetaRow>

              <MetaRow icon={actionMeta.icon} label="Required action">
                <Label variant="soft" color={actionMeta.color}>
                  {actionMeta.label}
                </Label>
              </MetaRow>

              {document_.actionType === 'sign' && (
                <MetaRow icon={isSigned ? 'solar:check-circle-bold' : 'solar:clock-circle-bold'} label="Signature status">
                  {isSigned ? (
                    <Label variant="soft" color="success">
                      Signed
                    </Label>
                  ) : (
                    <Label variant="soft" color="warning">
                      Pending staff signature
                    </Label>
                  )}
                </MetaRow>
              )}

              {document_.version && (
                <MetaRow icon="solar:layers-bold" label="Version">
                  <Typography variant="body2">{document_.version}</Typography>
                </MetaRow>
              )}

              <MetaRow icon="solar:calendar-bold" label="Last updated">
                <Typography variant="body2">{document_.updatedAt || '—'}</Typography>
              </MetaRow>

              {document_.uploadedBy && (
                <MetaRow icon="solar:user-id-bold" label="Uploaded by">
                  <Typography variant="body2">{document_.uploadedBy}</Typography>
                </MetaRow>
              )}

              {document_.assignedTo && (
                <MetaRow icon="solar:user-bold" label="Assigned to">
                  <Typography variant="body2">{document_.assignedTo}</Typography>
                </MetaRow>
              )}
            </Stack>

            {document_.description &&
              !document_.description.includes('fire evacuation procedures') && (
                <>
                  <Divider sx={{ my: 2.5 }} />
                  <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {document_.description}
                  </Typography>
                </>
              )}
          </Card>

          {showAcknowledgementTracker ? (
            <AcknowledgementTrackerCard document={document_} trackerPath={acknowledgementTrackerPath} />
          ) : (
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Quick actions
              </Typography>
              <Stack spacing={1.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Iconify icon="solar:refresh-bold" />}
                  onClick={replaceModal.onTrue}
                >
                  Replace document
                </Button>
              </Stack>
            </Card>
          )}
        </Stack>
      </Box>

      {/* Re-use the Upload modal as a Replace modal by passing currentDocument */}
      <UploadDocumentModal
        open={replaceModal.value}
        onClose={replaceModal.onFalse}
        currentDocument={document_}
      />

    </DashboardContent>
  );
}
