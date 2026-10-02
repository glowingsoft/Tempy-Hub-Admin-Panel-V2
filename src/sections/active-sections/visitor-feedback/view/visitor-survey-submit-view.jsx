import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { LoadingButton } from '@mui/lab';

import { useParams } from 'src/routes/hooks';

import { EmptyContent } from 'src/components/empty-content';
import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

import { getMockVisitorVisit, submitMockVisitorFeedback } from '../mocks/data';

// ----------------------------------------------------------------------

const SurveySchema = zod.object({
  rating: zod.number().min(1, { message: 'Please rate your visit' }),
  comment: zod.string().optional(),
});

const defaultValues = { rating: 0, comment: '' };

// ----------------------------------------------------------------------

export function VisitorSurveySubmitView() {
  const { token } = useParams();

  const visit = useMemo(() => getMockVisitorVisit(token), [token]);

  const [submitted, setSubmitted] = useState(false);

  const methods = useForm({
    resolver: zodResolver(SurveySchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      submitMockVisitorFeedback(token, data);
      setSubmitted(true);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  });

  if (!visit) {
    return (
      <EmptyContent
        filled
        title="Link no longer valid"
        description="This survey link has expired or doesn't exist. Please check with reception if you'd still like to leave feedback."
        sx={{ py: 10 }}
      />
    );
  }

  if (submitted) {
    return (
      <EmptyContent
        filled
        title="Thanks for your feedback!"
        description={`We've let ${visit.site} know what you shared.`}
        sx={{ py: 10 }}
      />
    );
  }

  return (
    <Card sx={{ p: { xs: 3, sm: 5 } }}>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h5">How was your visit?</Typography>
        <Typography variant="body2" color="text.secondary">
          {visit.visitorName}, thanks for visiting {visit.site}
          {visit.host ? ` to see ${visit.host}` : ''}. Your feedback helps them improve.
        </Typography>
      </Stack>

      <Divider sx={{ borderStyle: 'dashed', mb: 3 }} />

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Stack spacing={1} alignItems="center" sx={{ py: 1 }}>
            <Typography variant="subtitle2">Rate your visit</Typography>
            <Field.Rating name="rating" size="large" />
          </Stack>

          <Field.Text
            name="comment"
            label="Anything you'd like to share? (optional)"
            multiline
            rows={4}
          />

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting}
              sx={{ minWidth: 160 }}
            >
              Submit feedback
            </LoadingButton>
          </Box>
        </Stack>
      </Form>
    </Card>
  );
}
