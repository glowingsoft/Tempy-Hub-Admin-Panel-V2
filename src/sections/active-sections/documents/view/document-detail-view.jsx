// document-detail-view.jsx
// Document detail page supporting inline multi-page PDF viewing, metadata,
// and replacement. Signature pad is NOT shown to line manager, site manager,
// or owner — signing is reserved for the designated staff member.
import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { SignaturePad } from 'src/sections/staff/documents/signature-pad';

import { useParams, useRouter, usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { DashboardContent } from 'src/layouts/dashboard';

import { AcknowledgementTrackerCard } from './acknowledgement-tracker-card';
import { getFolderLabel, getDocumentById } from '../mocks/data';
import UploadDocumentModal from '../upload-document-modal';
import ReplaceDocumentModal from '../replace-document-modal';
import {
  useGetDocumentByIdQuery,
  useDeleteDocumentMutation,
} from 'src/store/Reducer/documents-api';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useCanManage } from 'src/auth/hooks';
import { ModuleSlug } from 'src/auth/permissions';
import { toast } from 'src/components/snackbar';
import LoadingButton from '@mui/lab/LoadingButton';
import { fDateTime } from 'src/utils/format-time';

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
// Document viewer — renders PDF directly via browser viewer, and images directly
// ----------------------------------------------------------------------

function DocumentViewer({ fileUrl, fileType, name }) {
  if (!fileUrl) {
    return (
      <EmptyContent
        title="No document attached"
        description="Replace this record to attach a file."
        sx={{ py: 10 }}
      />
    );
  }

  const safeUrl = typeof fileUrl === 'string' ? encodeURI(fileUrl) : fileUrl;

  if (isImage(fileType)) {
    return (
      <Box
        sx={{
          width: 1,
          bgcolor: 'background.neutral',
          borderRadius: 1.5,
          p: { xs: 1, sm: 2 },
          border: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          component="img"
          src={safeUrl}
          alt={name}
          sx={{
            maxWidth: 1,
            maxHeight: 740,
            borderRadius: 1,
            objectFit: 'contain',
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 1,
        borderRadius: 1.5,
        overflow: 'hidden',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.neutral',
      }}
    >
      <Box
        component="iframe"
        src={`${safeUrl}#toolbar=1&navpanes=0`}
        title={name}
        sx={{
          width: 1,
          height: { xs: 580, md: 800 },
          border: 0,
          display: 'block',
        }}
      />
    </Box>
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

export function DocumentDetailView({ ownerDashboard = false, basePath, isStaff: isStaffProp = false }) {
  const canManageDocuments = useCanManage(ModuleSlug.DOCUMENTS_ESIGN);
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { organizationId } = useCurrentOrganization();

  const isStaff = Boolean(isStaffProp || pathname.startsWith('/staff'));

  const { data: apiResponse, isLoading, isError } = useGetDocumentByIdQuery(
    { documentId: id, organizationId },
    {
      skip: !id || !organizationId,
    }
  );

  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const apiDoc = apiResponse?.data || apiResponse?.document || apiResponse;
  const mockDoc = getDocumentById(id);

  const document_ = useMemo(() => {
    if (apiDoc && (apiDoc._id || apiDoc.id || apiDoc.title)) {
      const fileData = apiDoc.file || {};
      const fileUrl =
        fileData.url ||
        apiDoc.fileUrl ||
        (fileData.key ? `${import.meta.env.VITE_BASE_URL || ''}/files/${fileData.key}` : '');

      return {
        id: apiDoc._id || apiDoc.id,
        _id: apiDoc._id || apiDoc.id,
        name: apiDoc.title || apiDoc.name || 'Untitled Document',
        title: apiDoc.title || apiDoc.name || 'Untitled Document',
        category: apiDoc.category?.title || apiDoc.category?.name || apiDoc.category || 'General',
        folder: apiDoc.folder?.name || apiDoc.folder || '',
        actionType: apiDoc.requiresSignature ? 'sign' : (apiDoc.actionType || 'continue'),
        scopeType: Array.isArray(apiDoc.audiences) ? apiDoc.audiences.join(', ') : (apiDoc.scopeType || 'all_staff'),
        scopeLabel: Array.isArray(apiDoc.audiences) ? apiDoc.audiences.join(', ') : (apiDoc.scopeLabel || 'All staff'),
        fileUrl,
        fileType: fileData.mimeType?.includes('pdf') || fileData.key?.endsWith('.pdf') ? 'pdf' : (apiDoc.fileType || 'pdf'),
        version: typeof apiDoc.version === 'object' ? apiDoc.version?.version : (apiDoc.version || 'v1'),
        updatedAt: apiDoc.updatedAt || apiDoc.createdAt || '',
        uploadedBy: apiDoc.uploadedBy?.name || apiDoc.uploadedBy || 'Administrator',
        assignedTo: apiDoc.assignedTo?.name || apiDoc.assignedTo || null,
        audiences: apiDoc.audiences || [],
        requiresSignature: apiDoc.requiresSignature ?? false,
        signature: apiDoc.signature || null,
        signedAt: apiDoc.signedAt || null,
        description: apiDoc.description || '',
      };
    }
    return mockDoc;
  }, [apiDoc, mockDoc]);

  const [staffSignature, setStaffSignature] = useState(null);
  const [isStaffSigned, setIsStaffSigned] = useState(false);

  useEffect(() => {
    if (document_?.signature) {
      setStaffSignature(document_.signature);
      setIsStaffSigned(true);
    }
  }, [document_?.signature]);

  const handleSaveSignature = (dataUrl) => {
    setStaffSignature(dataUrl);
    setIsStaffSigned(true);
    toast.success('Document signed successfully!');
  };

  const replaceModal = useBoolean();
  const deleteModal = useBoolean();

  const handleDeleteDocument = async () => {
    try {
      await deleteDocument({
        documentId: id,
        organizationId,
      }).unwrap();
      deleteModal.onFalse();
      toast.success('Document deleted successfully!');
      router.push(listPath);
    } catch (err) {
      console.error('Failed to delete document:', err);
      toast.error(err?.data?.message || err?.message || 'Failed to delete document!');
    }
  };

  const listPath =
    basePath ||
    pathname.substring(0, pathname.lastIndexOf('/')) ||
    (isStaff
      ? paths.staff?.documents?.root || '/staff/documents'
      : (ownerDashboard ? paths.owner.documents.root : paths.siteManager.documents.root));

  const dashboardRoot = isStaff
    ? paths.staff?.dashboard || '/staff/dashboard'
    : pathname.startsWith('/admin-dashboard')
      ? paths.adminDashboard?.root || '/admin-dashboard'
      : pathname.startsWith('/owner-dashboard')
        ? paths.owner?.root || '/owner-dashboard'
        : pathname.startsWith('/line-manager')
          ? paths.lineManager?.root || '/line-manager'
          : paths.siteManager?.root || '/site-manager';

  if (isLoading) {
    return (
      <DashboardContent>
        <Box sx={{ py: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

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
    ? (paths.owner?.documents?.acknowledgements?.(id) || paths.owner?.acknowledgements?.(id) || `/owner-dashboard/documents/${id}/acknowledgements`)
    : pathname.startsWith('/line-manager')
      ? (paths.lineManager?.documents?.acknowledgements?.(id) || `/line-manager/documents/${id}/acknowledgements`)
      : (paths.siteManager?.documents?.acknowledgements?.(id) || `/site-manager/documents/${id}/acknowledgements`);

  return (
    <DashboardContent>
      <Box sx={{ mb: 2 }}>
        <Button
          color="primary"
          onClick={() => router.push(listPath)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
        >
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        links={[
          {
            name: 'Dashboard',
            href: dashboardRoot,
          },
          { name: 'Documents', href: listPath },
          { name: document_.name },
        ]}
        action={
          !isStaff && canManageDocuments ? (
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

              <Tooltip title="Delete document">
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  onClick={deleteModal.onTrue}
                >
                  Delete
                </Button>
              </Tooltip>
            </Stack>
          ) : null
        }
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
        {/* Left Column: Viewer & Recorded Signature (if signed) */}
        <Stack spacing={3}>
          {/* Document Viewer Card */}
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
          {!isStaff && document_.signature && (
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

          {/* Staff Signature Card: only shown to staff when signature is required */}
          {isStaff && (document_.requiresSignature || document_.actionType === 'sign') && (
            <Card>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                {isStaffSigned && staffSignature ? (
                  <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'success.main',
                      }}
                    >
                      <Iconify icon="solar:check-circle-bold" width={32} />
                    </Box>
                    <Typography variant="h6" textAlign="center">
                      Document signed and acknowledged
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Your signature and acknowledgment have been recorded. Thank you.
                    </Typography>
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
                        src={staffSignature}
                        alt="Signature"
                        sx={{ width: 1, height: 80, objectFit: 'contain' }}
                      />
                    </Box>
                  </Stack>
                ) : (
                  <Stack spacing={2.5}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1">Sign document</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Please read the document above carefully, then draw your signature below to confirm you have read and agree to its contents.
                      </Typography>
                    </Stack>
                    <Divider />
                    <SignaturePad onSign={handleSaveSignature} />
                  </Stack>
                )}
              </CardContent>
            </Card>
          )}
        </Stack>

        {/* Right Column: Metadata Panel */}
        <Stack spacing={3}>
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
                <Typography variant="body2">
                  {document_.updatedAt ? (fDateTime(document_.updatedAt) || document_.updatedAt) : '—'}
                </Typography>
              </MetaRow>

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

          {/* Quick actions card (Admin/Managers only) */}
          {!isStaff && (
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

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  onClick={deleteModal.onTrue}
                >
                  Delete document
                </Button>
              </Stack>
            </Card>
          )}
        </Stack>
      </Box>

      {/* Dedicated Replace document modal */}
      <ReplaceDocumentModal
        open={replaceModal.value}
        onClose={replaceModal.onFalse}
        currentDocument={document_}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteModal.value}
        onClose={deleteModal.onFalse}
        title="Delete Document"
        content="Are you sure you want to delete this document? This action cannot be undone."
        action={
          <LoadingButton
            variant="contained"
            color="error"
            loading={isDeleting}
            onClick={handleDeleteDocument}
          >
            Delete
          </LoadingButton>
        }
      />
    </DashboardContent>
  );
}