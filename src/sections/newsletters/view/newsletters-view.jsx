import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';

import Grid from '@mui/material/Unstable_Grid2';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { toast } from 'src/components/snackbar';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';

import { mockNewsletterData } from '../mocks/data';
import { NewsletterTemplateConfig } from '../newsletter-template-config';
import { NewsletterPreviewPaper } from '../newsletter-preview-paper';
import { NewsletterDeliveryConfig } from '../newsletter-delivery-config';

// ----------------------------------------------------------------------

export function NewslettersView() {
  const familyPaths = useFamilyEngagementPaths();

  const [selectedMonth, setSelectedMonth] = useState(mockNewsletterData.header.dateLabel);

  // Content Sections State (Welcome, Highlights, and Coming Up selected by default)
  const [sectionsState, setSectionsState] = useState({
    welcome: true,
    highlights: true,
    comingUp: true,
    photoGallery: false,
  });

  // Welcome Text
  const [welcomeText, setWelcomeText] = useState(mockNewsletterData.sections.welcome.text);

  // Breadcrumbs
  const breadcrumbLinks = [
    { name: 'Dashboard', href: familyPaths.dashboardRoot },
    { name: 'Family Engagement', href: familyPaths.familyOverview },
    { name: 'Newsletters' },
  ];

  const handleToggleSection = useCallback((sectionKey) => {
    setSectionsState((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  }, []);

  const handleSend = useCallback((config) => {
    // Dispatch callback
  }, []);

  const handleSaveDraft = useCallback(() => {
    // Draft saved callback
  }, []);

  const handleDownloadPdf = useCallback(() => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'Florence_House_October_Newsletter.pdf';
    toast.success('Downloaded Florence House October Newsletter PDF');
  }, []);

  return (
    <>
      <Helmet>
        <title>{`Newsletters | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent maxWidth="xl">
        {/* Breadcrumbs Header */}
        <CustomBreadcrumbs
          heading="Newsletters"
          links={breadcrumbLinks}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* 3-Column Equalized Vertical / Portrait Layout */}
        <Grid container spacing={3} alignItems="stretch">
          {/* Column 1: Template Selection & Content Checklist */}
          <Grid xs={12} md={4} lg={4}>
            <NewsletterTemplateConfig
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              sectionsState={sectionsState}
              onToggleSection={handleToggleSection}
            />
          </Grid>

          {/* Column 2: Live Portrait Preview */}
          <Grid xs={12} md={4} lg={4}>
            <NewsletterPreviewPaper
              selectedMonth={selectedMonth}
              sectionsState={sectionsState}
              welcomeText={welcomeText}
            />
          </Grid>

          {/* Column 3: Send & Delivery Settings */}
          <Grid xs={12} md={4} lg={4}>
            <NewsletterDeliveryConfig
              onSend={handleSend}
              onSaveDraft={handleSaveDraft}
              onDownloadPdf={handleDownloadPdf}
            />
          </Grid>
        </Grid>
      </DashboardContent>
    </>
  );
}

export default NewslettersView;
