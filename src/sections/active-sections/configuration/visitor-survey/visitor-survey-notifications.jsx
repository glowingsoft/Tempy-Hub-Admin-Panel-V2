import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import LoadingButton from '@mui/lab/LoadingButton';

import { CompactOptionCard, SectionTitle } from './visitor-survey-constants';

// ----------------------------------------------------------------------

export function VisitorSurveyNotificationsCard({
  state,
  canEdit = true,
  saving = false,
  onToggleEnabled,
  onUpdateChannel,
  onUpdateRecipient,
  onUpdateInclude,
  onReset,
  onSave,
}) {
  return (
    <Card>
      <CardHeader
        title="Visitor survey notifications"
        subheader="Notify staff when a visitor completes the post-visit survey"
        action={
          <Switch
            disabled={!canEdit}
            checked={Boolean(state.enabled)}
            onChange={(e) => onToggleEnabled(e.target.checked)}
          />
        }
        sx={{ pb: 1.5 }}
      />

      <Collapse in={Boolean(state.enabled)} timeout="auto" unmountOnExit>
        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack spacing={2.5} sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Notify via */}
          <Stack spacing={1.25}>
            <SectionTitle icon="solar:bell-bing-bold-duotone" title="Notify via" />
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <CompactOptionCard
                  icon="solar:letter-bold-duotone"
                  label="Email notifications"
                  checked={state.channels?.email}
                  disabled={!canEdit}
                  onChange={(val) => onUpdateChannel('email', val)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CompactOptionCard
                  icon="solar:bell-bold-duotone"
                  label="In-app notification bell"
                  checked={state.channels?.inApp}
                  disabled={!canEdit}
                  onChange={(val) => onUpdateChannel('inApp', val)}
                />
              </Grid>
            </Grid>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

          {/* Recipients */}
          <Stack spacing={1.25}>
            <SectionTitle icon="solar:users-group-rounded-bold-duotone" title="Recipients" />
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <CompactOptionCard
                  icon="solar:user-id-bold-duotone"
                  label="Site Manager"
                  checked={state.recipients?.siteManager}
                  disabled={!canEdit}
                  onChange={(val) => onUpdateRecipient('siteManager', val)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CompactOptionCard
                  icon="solar:user-bold-duotone"
                  label="Line Manager"
                  checked={state.recipients?.lineManager}
                  disabled={!canEdit}
                  onChange={(val) => onUpdateRecipient('lineManager', val)}
                />
              </Grid>
            </Grid>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

          {/* Notification content */}
          <Stack spacing={1.25}>
            <SectionTitle icon="solar:document-text-bold-duotone" title="Notification content includes" />
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <CompactOptionCard
                  icon="solar:star-bold-duotone"
                  label="Feedback rating & summary"
                  checked={state.includes?.feedbackRating}
                  disabled={!canEdit}
                  onChange={(val) => onUpdateInclude('feedbackRating', val)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CompactOptionCard
                  icon="solar:clock-circle-bold-duotone"
                  label="Visit duration"
                  checked={state.includes?.visitDuration}
                  disabled={!canEdit}
                  onChange={(val) => onUpdateInclude('visitDuration', val)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CompactOptionCard
                  icon="solar:user-hand-up-bold-duotone"
                  label="Who they visited"
                  checked={state.includes?.whoVisited}
                  disabled={!canEdit}
                  onChange={(val) => onUpdateInclude('whoVisited', val)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CompactOptionCard
                  icon="solar:chat-round-line-bold-duotone"
                  label="Free-text comments"
                  checked={state.includes?.freeTextComments}
                  disabled={!canEdit}
                  onChange={(val) => onUpdateInclude('freeTextComments', val)}
                />
              </Grid>
            </Grid>
          </Stack>

          <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

          {canEdit && (
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button variant="outlined" color="inherit" size="small" onClick={onReset}>
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                color="primary"
                size="small"
                loading={saving}
                onClick={onSave}
              >
                Save changes
              </LoadingButton>
            </Stack>
          )}
        </Stack>
      </Collapse>
    </Card>
  );
}

VisitorSurveyNotificationsCard.propTypes = {
  state: PropTypes.object.isRequired,
  canEdit: PropTypes.bool,
  saving: PropTypes.bool,
  onToggleEnabled: PropTypes.func.isRequired,
  onUpdateChannel: PropTypes.func.isRequired,
  onUpdateRecipient: PropTypes.func.isRequired,
  onUpdateInclude: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

