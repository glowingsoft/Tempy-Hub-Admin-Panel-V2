import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { LoadingButton } from '@mui/lab';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';

import { WIDGET_ORIENTATION_OPTIONS, getExternalWidgetEmbedCode } from './mocks/data';

// ----------------------------------------------------------------------

function OrientationOptionCard({ value, label, helperText, icon, selected, onSelect }) {
  return (
    <Card
      variant="outlined"
      onClick={() => onSelect(value)}
      sx={{
        p: 2,
        height: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        borderColor: selected ? 'primary.main' : 'divider',
        transition: (theme) => theme.transitions.create('border-color'),
      }}
    >
      <Radio checked={selected} sx={{ p: 0 }} />

      <Iconify
        icon={icon}
        width={22}
        sx={{ color: selected ? 'primary.main' : 'text.disabled', flexShrink: 0 }}
      />

      <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {label}
        </Typography>
        {helperText && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {helperText}
          </Typography>
        )}
      </Box>
    </Card>
  );
}

OrientationOptionCard.propTypes = {
  value: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.string,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
};

// ----------------------------------------------------------------------

function SectionLabel({ title }) {
  return <Typography variant="subtitle2">{title}</Typography>;
}

SectionLabel.propTypes = {
  title: PropTypes.string,
};

// ----------------------------------------------------------------------

function ExternalWidgetsSettings({ settings, onSave, saving }) {
  const [state, setState] = useState(settings);
  const { copy } = useCopyToClipboard();

  useEffect(() => {
    setState(settings);
  }, [settings]);

  const embedCode = getExternalWidgetEmbedCode(state);

  const handleSave = () => {
    onSave?.(state);
  };

  const handleCopy = () => {
    copy(embedCode);
    toast.success('Embed code copied!');
  };

  return (
    <Card>
      <CardHeader
        title="External widgets"
        subheader="Embed your Tempy availability widget on an external site, such as carehome.co.uk"
        sx={{ mb: 1 }}
      />

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Stack spacing={1.5}>
          <SectionLabel title="Widget orientation" />

          <Grid container spacing={2}>
            {WIDGET_ORIENTATION_OPTIONS.map((option) => (
              <Grid item xs={12} sm={6} key={option.value}>
                <OrientationOptionCard
                  {...option}
                  selected={state.orientation === option.value}
                  onSelect={(value) => setState((prev) => ({ ...prev, orientation: value }))}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack spacing={1.5}>
          <SectionLabel title="Integration link" />

          <TextField
            fullWidth
            label="carehome.co.uk profile URL"
            placeholder="https://www.carehome.co.uk/carehome/..."
            value={state.profileUrl}
            onChange={(event) => setState((prev) => ({ ...prev, profileUrl: event.target.value }))}
          />
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack spacing={1.5}>
          <SectionLabel title="Embed code" />

          <Typography variant="caption" color="text.secondary">
            Paste this snippet into your site to display the widget.
          </Typography>

          <Box
            sx={{
              p: 2,
              pr: 6,
              position: 'relative',
              borderRadius: 1,
              bgcolor: (theme) => theme.vars.palette.background.neutral,
              fontFamily: 'monospace',
              fontSize: 13,
              wordBreak: 'break-all',
            }}
          >
            {embedCode}

            <Tooltip title="Copy code">
              <IconButton size="small" onClick={handleCopy} sx={{ position: 'absolute', top: 8, right: 8 }}>
                <Iconify icon="solar:copy-bold" width={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>

        <Stack direction="row" justifyContent="flex-end">
          <LoadingButton variant="contained" loading={saving} onClick={handleSave}>
            Save changes
          </LoadingButton>
        </Stack>
      </Stack>
    </Card>
  );
}

export default ExternalWidgetsSettings;

ExternalWidgetsSettings.propTypes = {
  settings: PropTypes.shape({
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),
    profileUrl: PropTypes.string,
  }),
  onSave: PropTypes.func,
  saving: PropTypes.bool,
};
