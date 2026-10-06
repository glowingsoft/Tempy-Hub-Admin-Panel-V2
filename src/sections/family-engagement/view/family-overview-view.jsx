import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/config-global';
import { useRouter } from 'src/routes/hooks';
import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';

import { mockFamilyOverviewData } from '../mocks/data';
import { FamilyDashboardCards } from '../family-dashboard-cards';
import { FamilyActivityCard } from '../family-activity-card';
import { FamilyIssueChecklist } from '../family-issue-checklist';
import { FamilyModerationDialog } from '../family-moderation-dialog';
import { FamilyWallPostDialog } from '../family-wall-post-dialog';
import { FamilyResidentsDialog } from '../family-residents-dialog';

// ----------------------------------------------------------------------

const iconUrl = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

export function FamilyOverviewView() {
  const theme = useTheme();
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();

  // Dynamic counts state
  const [uploadsWaiting, setUploadsWaiting] = useState(mockFamilyOverviewData.metrics.uploadsWaiting);
  const [residentsWithFamily] = useState(mockFamilyOverviewData.metrics.residentsWithFamily);
  const [residentsWithNoContent, setResidentsWithNoContent] = useState(
    mockFamilyOverviewData.metrics.residentsWithNoContent
  );
  const [checklistTasks, setChecklistTasks] = useState(mockFamilyOverviewData.checklist);

  // Dialogs state
  const [moderationOpen, setModerationOpen] = useState(false);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [residentsOpen, setResidentsOpen] = useState(false);

  // Toggle checklist task
  const handleToggleTask = (taskId) => {
    setChecklistTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Content moderation approvals
  const handleApproveModeration = () => {
    setUploadsWaiting((prev) => Math.max(0, prev - 1));
    setChecklistTasks((prev) =>
      prev.map((t) => (t.stepNumber === 1 ? { ...t, completed: true } : t))
    );
  };

  const handleRejectModeration = () => {
    setUploadsWaiting((prev) => Math.max(0, prev - 1));
  };

  const handlePostCreated = (newPost) => {
    toast.success(`Wall post "${newPost.title}" published`);
  };

  return (
    <>
      <Helmet>
        <title>{`Family Overview | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent maxWidth="xl">
        {/* Header: Family overview / Florence House */}
      <Box sx={{ mb: { xs: 3, md: 5 } }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
          Family overview
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Florence House
        </Typography>
      </Box>

      {/* TOP 4 METRIC CARDS */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Card 1: 6 uploads waiting */}
        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="uploads waiting"
            total={uploadsWaiting}
            color="warning"
            icon={iconUrl('ic-file')}
            onClick={() => setModerationOpen(true)}
            sx={{
              cursor: 'pointer',
              transition: theme.transitions.create(['transform', 'box-shadow'], {
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: (t) => t.customShadows?.z8 || t.shadows[4],
              },
            }}
          />
        </Grid>

        {/* Card 2: 42 residents with a family */}
        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="residents with a family"
            total={residentsWithFamily}
            color="primary"
            icon={iconUrl('ic-users')}
            sx={{
              transition: theme.transitions.create(['transform', 'box-shadow'], {
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: (t) => t.customShadows?.z8 || t.shadows[4],
              },
            }}
          />
        </Grid>

        {/* Card 3: Issue 14 closes in 3 days */}
        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="closes in 3 days"
            total="Issue 14"
            color="info"
            icon={iconUrl('ic-calendar')}
            sx={{
              transition: theme.transitions.create(['transform', 'box-shadow'], {
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: (t) => t.customShadows?.z8 || t.shadows[4],
              },
            }}
          />
        </Grid>

        {/* Card 4: 4 residents with no content */}
        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="residents with no content"
            total={residentsWithNoContent}
            color="error"
            icon={iconUrl('ic-document')}
            onClick={() => setResidentsOpen(true)}
            sx={{
              cursor: 'pointer',
              transition: theme.transitions.create(['transform', 'box-shadow'], {
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: (t) => t.customShadows?.z8 || t.shadows[4],
              },
            }}
          />
        </Grid>
      </Grid>

      {/* MIDDLE SECTION: EXISTING DASHBOARD CARDS & FAMILY ACTIVITY (LAST 7 DAYS) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} md={6}>
          <FamilyDashboardCards navigationPaths={familyPaths} />
        </Grid>

        <Grid xs={12} md={6}>
          <FamilyActivityCard
            activity={mockFamilyOverviewData.activity}
            onOpenModeration={() => router.push(familyPaths.moderation)}
            onOpenNewPost={() => router.push(familyPaths.communityWall)}
          />
        </Grid>
      </Grid>

      {/* BOTTOM SECTION: CHECKLIST BEFORE ISSUE 14 CLOSES */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12}>
          <FamilyIssueChecklist
            issueNumber={mockFamilyOverviewData.metrics.currentIssue.number}
            tasks={checklistTasks}
            onToggleTask={handleToggleTask}
          />
        </Grid>
      </Grid>

      {/* MODERATION DIALOG */}
      <FamilyModerationDialog
        open={moderationOpen}
        onClose={() => setModerationOpen(false)}
        items={mockFamilyOverviewData.moderationItems}
        onApprove={handleApproveModeration}
        onReject={handleRejectModeration}
      />

      {/* NEW WALL POST DIALOG */}
      <FamilyWallPostDialog
        open={newPostOpen}
        onClose={() => setNewPostOpen(false)}
        onCreated={handlePostCreated}
      />

      {/* RESIDENTS WITH NO CONTENT DIALOG */}
      <FamilyResidentsDialog
        open={residentsOpen}
        onClose={() => setResidentsOpen(false)}
        residents={mockFamilyOverviewData.residentsNoContent}
      />
    </DashboardContent>
  </>
  );
}

export default FamilyOverviewView;
