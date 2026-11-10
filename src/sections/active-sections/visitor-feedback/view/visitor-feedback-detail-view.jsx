import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Rating from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { useParams, usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useGetVisitorSurveyResponsesQuery } from 'src/store/Reducer/visitor-survey-api';
import { selectUser } from 'src/store/slices/userSlice';
import { getUserBranchId } from 'src/utils/organization';
import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

function formatDuration(duration) {
  if (!duration) return '—';
  const str = String(duration).trim();

  // Extract numeric digits
  const match = str.match(/\d+/);
  if (!match) return str;

  const totalMins = Number(match[0]);
  if (Number.isNaN(totalMins)) return str;

  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

// ----------------------------------------------------------------------

export default function VisitorFeedbackDetailView() {
  const router = useRouter();
  const pathname = usePathname();
  const location = useLocation();
  const { id } = useParams();

  const isLineManager = pathname.includes('/line-manager');
  const dashboardRoot = isLineManager ? paths.lineManager.root : paths.siteManager.root;
  const feedbackListRoot = isLineManager ? paths.lineManager.feedback : paths.siteManager.feedback;

  const user = useSelector(selectUser);
  const { organizationId } = useCurrentOrganization();
  const branchId = getUserBranchId(user, organizationId) || user?.branchId?._id || user?.branchId;

  // Use the same list API to get questions and responses
  const { data: responseData, isLoading } = useGetVisitorSurveyResponsesQuery(
    {
      organizationId,
      branchId: branchId && branchId !== 'all' ? branchId : undefined,
      page: 1,
      limit: 100,
    },
    { skip: !organizationId }
  );

  const stateFeedback = location.state?.feedback;

  const feedback =
    (stateFeedback && (stateFeedback._id === id || stateFeedback.id === id))
      ? stateFeedback
      : (responseData?.data || []).find((item) => item._id === id || item.id === id);

  if (isLoading && !feedback) {
    return (
      <DashboardContent>
        <Stack spacing={3}>
          <Skeleton variant="rounded" height={40} width={240} />
          <Skeleton variant="rounded" height={320} />
        </Stack>
      </DashboardContent>
    );
  }

  if (!feedback && !isLoading) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Feedback Details"
          links={[
            { name: 'Dashboard', href: dashboardRoot },
            { name: 'Visitor Feedback', href: feedbackListRoot },
            { name: 'Not Found' },
          ]}
          sx={{ mb: 3 }}
        />

        <Card sx={{ p: 5, textAlign: 'center' }}>
          <EmptyContent
            title="Feedback record not found"
            description="The requested visitor feedback could not be found."
            action={
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                onClick={router.back}
              >
                Back
              </Button>
            }
          />
        </Card>
      </DashboardContent>
    );
  }

  const answers = Array.isArray(feedback.answers) ? feedback.answers : [];

  return (
    <DashboardContent>
      <Box sx={{ mb: 2 }}>
        <Button color="primary" onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading="Feedback Details"
        links={[
          { name: 'Dashboard', href: dashboardRoot },
          { name: 'Visitor Feedback', href: feedbackListRoot },
          { name: feedback.visitorName || 'Details' },
        ]}
        sx={{ mb: { xs: 3, md: 4 } }}
      />

      <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
        {/* Simple Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ pb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
              <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>
                {feedback.visitorName}
              </Typography>
              {feedback.branchName && (
                <Chip label={feedback.branchName} size="small" variant="soft" color="primary" />
              )}
              {feedback.source && (
                <Label variant="soft" color="default" sx={{ textTransform: 'capitalize' }}>
                  {feedback.source}
                </Label>
              )}
            </Stack>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {feedback.hostName ? `Host: ${feedback.hostName} • ` : ''}
              {feedback.stayDuration ? `Duration: ${formatDuration(feedback.stayDuration)} • ` : ''}
              Submitted: {fDateTime(feedback.submittedAt || feedback.createdAt)}
            </Typography>
          </Stack>

          {feedback.rating != null && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Rating value={Number(feedback.rating)} readOnly precision={0.5} size="medium" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {feedback.rating} / 5
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Clean, Simple Questions & Answers List */}
        <Box sx={{ pt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2.5 }}>
            Questions & Answers
          </Typography>

          {answers.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No individual questions recorded for this feedback.
            </Typography>
          ) : (
            <Stack spacing={2.5} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
              {answers.map((answer, index) => {
                const isRating =
                  answer.key === 'rating' ||
                  (!Number.isNaN(Number(answer.value)) &&
                    Number(answer.value) >= 1 &&
                    Number(answer.value) <= 5 &&
                    String(answer.prompt).toLowerCase().includes('rate'));

                const isBoolean =
                  answer.value === 'Yes' ||
                  answer.value === 'No' ||
                  typeof answer.value === 'boolean';

                return (
                  <Stack key={answer.questionId || answer.key || index} spacing={0.75}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      {answer.prompt || `Question ${index + 1}`}
                    </Typography>

                    <Box>
                      {isRating ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Rating value={Number(answer.value)} readOnly size="small" />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {answer.value} / 5
                          </Typography>
                        </Stack>
                      ) : isBoolean ? (
                        <Label
                          variant="soft"
                          color={
                            String(answer.value).toLowerCase() === 'yes' ? 'success' : 'error'
                          }
                        >
                          {String(answer.value)}
                        </Label>
                      ) : (
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {answer.value || '—'}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Box>
      </Card>
    </DashboardContent>
  );
}
