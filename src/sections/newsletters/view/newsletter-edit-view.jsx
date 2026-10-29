import { useCallback, useEffect, useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { useParams, useRouter } from 'src/routes/hooks';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import {
  useDeleteFamilyNewsletterMutation,
  useGetFamilyNewsletterQuery,
  useLazyGetFamilyNewsletterPdfQuery,
  useUpdateFamilyNewsletterDeliveryMutation,
  useUpdateFamilyNewsletterMutation,
} from 'src/store/Reducer/family-newsletters-api';

import { NewsletterDeliveryConfig } from '../newsletter-delivery-config';
import { NewsletterPdfPreviewDialog } from '../newsletter-pdf-preview-dialog';
import { NewsletterPreviewPaper } from '../newsletter-preview-paper';
import { NewsletterTemplateConfig } from '../newsletter-template-config';
import {
  buildNewsletterUpdatePayload,
  canDeleteNewsletter,
  emptyNewsletterForm,
  hydrateNewsletterForm,
  validateNewsletterForm,
} from '../utils';

// ----------------------------------------------------------------------

export function NewsletterEditView() {
  const { id } = useParams();
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId } = useCurrentOrganization();

  const previewDialog = useBoolean();
  const deleteDialog = useBoolean();
  const [form, setForm] = useState(emptyNewsletterForm());
  const [fieldErrors, setFieldErrors] = useState({ notices: {}, comingUp: {} });
  const [previewPdfUrl, setPreviewPdfUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const { data: detail, isLoading, isError } = useGetFamilyNewsletterQuery(
    { organizationId, newsletterId: id },
    { skip: !organizationId || !id }
  );

  const [getFamilyNewsletterPdf] = useLazyGetFamilyNewsletterPdfQuery();
  const [updateFamilyNewsletter, { isLoading: isSaving }] = useUpdateFamilyNewsletterMutation();
  const [updateFamilyNewsletterDelivery, { isLoading: isUpdatingDelivery }] =
    useUpdateFamilyNewsletterDeliveryMutation();
  const [deleteFamilyNewsletter, { isLoading: isDeleting }] = useDeleteFamilyNewsletterMutation();

  useEffect(() => {
    if (detail) setForm(hydrateNewsletterForm(detail));
  }, [detail]);

  const goToList = useCallback(() => {
    router.push(familyPaths.newsletters);
  }, [familyPaths.newsletters, router]);

  const clearPreviewPdf = useCallback(() => {
    setPreviewPdfUrl((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return '';
    });
  }, []);

  const persistContent = useCallback(async () => {
    const validation = validateNewsletterForm(form);
    setFieldErrors(validation.errors);
    if (!validation.valid) {
      toast.error(validation.message);
      return false;
    }

    await updateFamilyNewsletter({
      organizationId,
      newsletterId: id,
      ...buildNewsletterUpdatePayload(form),
    }).unwrap();
    return true;
  }, [form, id, organizationId, updateFamilyNewsletter]);

  const handleSaveDraft = useCallback(async () => {
    try {
      const saved = await persistContent();
      if (saved) toast.success('Newsletter saved');
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to save newsletter');
    }
  }, [persistContent]);

  const handleDelivery = useCallback(
    async ({ action, sendAt, successMessage, errorMessage }) => {
      try {
        if (action !== 'cancel') {
          const saved = await persistContent();
          if (!saved) return;
        }

        const body = { organizationId, newsletterId: id, action };
        if (sendAt) body.sendAt = sendAt;
        if (action !== 'cancel') {
          body.delivery = {
            inApp: Boolean(form.delivery?.inApp),
            email: Boolean(form.delivery?.email),
            pdf: Boolean(form.delivery?.pdf),
          };
        }

        const result = await updateFamilyNewsletterDelivery(body).unwrap();
        toast.success(result?.message || successMessage);
      } catch (error) {
        toast.error(error?.data?.message || error?.message || errorMessage);
      }
    },
    [form.delivery, id, organizationId, persistContent, updateFamilyNewsletterDelivery]
  );

  const handleOpenPreview = useCallback(async () => {
    if (!id || !organizationId) return;
    clearPreviewPdf();
    previewDialog.onTrue();
    setPreviewLoading(true);

    try {
      const result = await getFamilyNewsletterPdf({
        organizationId,
        newsletterId: id,
        download: false,
      }).unwrap();

      if (!(result?.blob instanceof Blob)) {
        toast.error('Unable to load newsletter PDF');
        return;
      }

      setPreviewPdfUrl(URL.createObjectURL(result.blob));
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to load newsletter PDF');
    } finally {
      setPreviewLoading(false);
    }
  }, [clearPreviewPdf, getFamilyNewsletterPdf, id, organizationId, previewDialog]);

  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteFamilyNewsletter({ organizationId, newsletterId: id }).unwrap();
      toast.success('Newsletter deleted');
      deleteDialog.onFalse();
      goToList();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to delete newsletter');
    }
  }, [deleteDialog, deleteFamilyNewsletter, goToList, id, organizationId]);

  if (isLoading && !detail) {
    return (
      <DashboardContent maxWidth="xl">
        <LoadingScreen />
      </DashboardContent>
    );
  }

  if (!detail || isError) {
    return (
      <DashboardContent maxWidth="xl">
        <Button onClick={goToList} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />} sx={{ mb: 2 }}>
          Back to list
        </Button>
        <EmptyContent filled title="Newsletter not found" sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  const editorLocked = detail.status === 'sent' || detail.status === 'sending';

  return (
    <>
      <DashboardContent maxWidth="xl">
        <CustomBreadcrumbs
          heading={detail.title || 'Edit newsletter'}
          links={[
            { name: 'Dashboard', href: familyPaths.dashboardRoot },
            { name: 'Family Engagement', href: familyPaths.familyOverview },
            { name: 'Newsletters', href: familyPaths.newsletters },
            { name: detail.title || 'Edit' },
          ]}
          action={
            <Button
              variant="outlined"
              color="inherit"
              onClick={goToList}
              startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            >
              Back to list
            </Button>
          }
          sx={{ mb: { xs: 3, md: 4 } }}
        />

        <Stack spacing={3}>
          <NewsletterDeliveryConfig
            form={form}
            onChange={setForm}
            recipients={detail.recipients || detail.sentTo}
            status={detail.status}
            saving={isSaving}
            sending={isUpdatingDelivery}
            deleting={isDeleting}
            previewing={previewLoading}
            disabled={editorLocked}
            onSaveDraft={handleSaveDraft}
            onSend={() =>
              handleDelivery({
                action: 'send',
                successMessage: 'Newsletter sent',
                errorMessage: 'Unable to send newsletter',
              })
            }
            onSchedule={(sendAt) =>
              handleDelivery({
                action: 'schedule',
                sendAt,
                successMessage: 'Newsletter scheduled',
                errorMessage: 'Unable to schedule newsletter',
              })
            }
            onCancelSchedule={() =>
              handleDelivery({
                action: 'cancel',
                successMessage: 'Schedule cancelled',
                errorMessage: 'Unable to cancel schedule',
              })
            }
            onPreviewPdf={handleOpenPreview}
            onDelete={() => {
              if (!canDeleteNewsletter(detail.status)) return;
              deleteDialog.onTrue();
            }}
          />

          <Grid container spacing={3} alignItems="flex-start">
            <Grid xs={12} lg={7}>
              <NewsletterTemplateConfig
                form={form}
                onChange={(next) => {
                  setForm(next);
                  setFieldErrors((current) => {
                    const hasErrors =
                      current.title ||
                      Object.keys(current.notices || {}).length ||
                      Object.keys(current.comingUp || {}).length;
                    return hasErrors ? validateNewsletterForm(next).errors : current;
                  });
                }}
                errors={fieldErrors}
                counts={detail.counts || {}}
                organizationId={organizationId}
                branchId={detail.branchId}
                disabled={editorLocked}
              />
            </Grid>
            <Grid xs={12} lg={5}>
              <Box sx={{ position: { lg: 'sticky' }, top: { lg: 88 } }}>
                <NewsletterPreviewPaper form={form} periodLabel={detail.periodLabel || ''} />
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </DashboardContent>

      <NewsletterPdfPreviewDialog
        open={previewDialog.value}
        onClose={() => {
          previewDialog.onFalse();
          setPreviewLoading(false);
          clearPreviewPdf();
        }}
        title={detail.title || 'Newsletter PDF'}
        pdfUrl={previewPdfUrl}
        loading={previewLoading}
      />

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={deleteDialog.onFalse}
        title="Delete newsletter"
        content={
          <>
            Delete <strong>{detail.title || 'this newsletter'}</strong>? This cannot be undone.
          </>
        }
        action={
          <LoadingButton variant="contained" color="error" loading={isDeleting} onClick={handleConfirmDelete}>
            Delete
          </LoadingButton>
        }
      />
    </>
  );
}
