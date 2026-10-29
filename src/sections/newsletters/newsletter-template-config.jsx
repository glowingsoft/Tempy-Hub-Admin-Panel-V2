import { useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { alpha } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import { Iconify } from 'src/components/iconify';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { toast } from 'src/components/snackbar';
import { useGetResidentsQuery } from 'src/store/Reducer/residents-api';
import { formatStr } from 'src/utils/format-time';

import { NEWSLETTER_SECTION_OPTIONS, isIncompleteEvent, isIncompleteNotice } from './utils';

// ----------------------------------------------------------------------

const mapResidentOption = (resident) => ({
  value: resident._id || resident.residentId,
  label: resident.roomNumber ? `${resident.name} (Room ${resident.roomNumber})` : resident.name,
  residentId: resident._id || resident.residentId,
  name: resident.name,
  roomNumber: resident.roomNumber,
});

function parseTime(value) {
  if (!value) return null;
  const parsed = dayjs(`2000-01-01T${value}`);
  return parsed.isValid() ? parsed : null;
}

function AccordionSection({ title, count, expanded, onChange, action, children }) {
  return (
    <Accordion
      disableGutters
      expanded={expanded}
      onChange={onChange}
      sx={{
        boxShadow: 'none',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: '16px !important',
        overflow: 'hidden',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary
        expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
        sx={{
          px: 2.25,
          minHeight: 58,
          '& .MuiAccordionSummary-content': { my: 1.25, alignItems: 'center', mr: 1 },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {count != null && (
            <Chip size="small" variant="soft" label={`${count} items`} sx={{ height: 22 }} />
          )}
          {action}
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2.25, pb: 2.25, pt: 0 }}>{children}</AccordionDetails>
    </Accordion>
  );
}

function NestedCard({ title, onRemove, children }) {
  return (
    <Box sx={{ p: 1.75, borderRadius: 1.5, border: (theme) => `1px solid ${theme.palette.divider}` }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
        {onRemove && (
          <IconButton size="small" onClick={onRemove}>
            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
          </IconButton>
        )}
      </Stack>
      {children}
    </Box>
  );
}

export function NewsletterTemplateConfig({
  form,
  onChange,
  errors = {},
  counts = {},
  organizationId,
  branchId,
  disabled = false,
}) {
  const [expanded, setExpanded] = useState({ welcome: true });
  const residentQueryArgs = { organizationId, ...(branchId ? { branchId } : {}) };
  const update = (patch) => onChange({ ...form, ...patch });

  const toggleExpanded = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (key) => {
    const nextValue = !form.sections?.[key];
    update({ sections: { ...form.sections, [key]: nextValue } });
    if (nextValue) setExpanded((prev) => ({ ...prev, [key]: true }));
  };

  const updateListItem = (key, index, patch) => {
    const next = [...(form[key] || [])];
    next[index] = { ...next[index], ...patch };
    update({ [key]: next });
  };

  const removeListItem = (key, index) => {
    update({ [key]: (form[key] || []).filter((_, itemIndex) => itemIndex !== index) });
  };

  const selectedResidents = (form.newResidents || []).map((resident) => ({
    value: resident.residentId,
    label: resident.roomNumber ? `${resident.name} (Room ${resident.roomNumber})` : resident.name,
    residentId: resident.residentId,
    name: resident.name,
    roomNumber: resident.roomNumber,
  }));

  return (
    <Card sx={{ p: 2.5 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
        Content
      </Typography>

      <Stack spacing={2}>
        <TextField
          fullWidth
          size="small"
          label="Title"
          value={form.title || ''}
          disabled={disabled}
          error={Boolean(errors.title)}
          helperText={errors.title ? 'Please enter a newsletter title' : undefined}
          onChange={(event) => update({ title: event.target.value })}
        />

        <Grid container spacing={1.5}>
          {NEWSLETTER_SECTION_OPTIONS.map((section) => {
            const checked = Boolean(form.sections?.[section.key]);
            return (
              <Grid key={section.key} xs={12} sm={6} md={4}>
                <Box
                  onClick={disabled ? undefined : () => toggleSection(section.key)}
                  sx={{
                    p: 1.5,
                    height: 1,
                    borderRadius: 1.5,
                    cursor: disabled ? 'default' : 'pointer',
                    border: (theme) => `1px solid ${checked ? theme.palette.primary.light : theme.palette.divider}`,
                    bgcolor: (theme) => (checked ? alpha(theme.palette.primary.main, 0.06) : 'transparent'),
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Checkbox
                      checked={checked}
                      tabIndex={-1}
                      disableRipple
                      size="small"
                      sx={{ p: 0, pointerEvents: 'none' }}
                    />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {section.label}
                      </Typography>
                      {counts[section.key] != null && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {counts[section.key]} items
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {form.sections?.welcome && (
          <AccordionSection
            title="Welcome from the manager"
            expanded={Boolean(expanded.welcome)}
            onChange={() => toggleExpanded('welcome')}
          >
            <Stack spacing={2}>
              <TextField
                fullWidth
                multiline
                minRows={5}
                label="Welcome text"
                disabled={disabled}
                value={form.welcome?.text || ''}
                onChange={(event) => update({ welcome: { ...form.welcome, text: event.target.value } })}
              />
              <TextField
                fullWidth
                size="small"
                label="Signed by"
                disabled={disabled}
                value={form.welcome?.signedBy || ''}
                onChange={(event) => update({ welcome: { ...form.welcome, signedBy: event.target.value } })}
              />
            </Stack>
          </AccordionSection>
        )}

        {form.sections?.highlights && (
          <AccordionSection
            title="Highlights"
            count={form.highlights?.length || 0}
            expanded={Boolean(expanded.highlights)}
            onChange={() => toggleExpanded('highlights')}
          >
            <Stack spacing={1.5}>
              {(form.highlights || []).map((item, index) => (
                <NestedCard key={item.postId || index} title={`Highlight ${index + 1}`}>
                  <Grid container spacing={1.5}>
                    <Grid xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Highlight title"
                        disabled={disabled}
                        value={item.title || ''}
                        onChange={(event) => updateListItem('highlights', index, { title: event.target.value })}
                      />
                    </Grid>
                    <Grid xs={12} md={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Highlight text"
                        disabled={disabled}
                        value={item.text || ''}
                        onChange={(event) => updateListItem('highlights', index, { text: event.target.value })}
                      />
                    </Grid>
                  </Grid>
                </NestedCard>
              ))}
            </Stack>
          </AccordionSection>
        )}

        {form.sections?.comingUp && (
          <AccordionSection
            title="Coming up"
            count={form.comingUp?.length || 0}
            expanded={Boolean(expanded.comingUp) || Boolean(Object.keys(errors.comingUp || {}).length)}
            onChange={() => toggleExpanded('comingUp')}
            action={
              !disabled && (
                <Button
                  size="small"
                  startIcon={<Iconify icon="solar:add-circle-bold" />}
                  onClick={(event) => {
                    event.stopPropagation();
                    const lastEvent = (form.comingUp || []).at(-1);
                    if (lastEvent && isIncompleteEvent(lastEvent)) {
                      toast.error('Please fill date, time and title before adding another event');
                      setExpanded((prev) => ({ ...prev, comingUp: true }));
                      return;
                    }
                    update({
                      comingUp: [...(form.comingUp || []), { date: '', time: '', title: '', description: '', category: '' }],
                    });
                    setExpanded((prev) => ({ ...prev, comingUp: true }));
                  }}
                >
                  Add event
                </Button>
              )
            }
          >
            <Stack spacing={1.5}>
              {(form.comingUp || []).map((item, index) => (
                <NestedCard
                  key={`${item.title}-${index}`}
                  title={`Event ${index + 1}`}
                  onRemove={disabled ? undefined : () => removeListItem('comingUp', index)}
                >
                  <Grid container spacing={1.5}>
                    <Grid xs={12} sm={4}>
                      <DatePicker
                        label="Date"
                        value={item.date ? dayjs(item.date) : null}
                        onChange={(value) =>
                          updateListItem('comingUp', index, {
                            date: value?.isValid() ? value.format('YYYY-MM-DD') : '',
                          })
                        }
                        format={formatStr.split.date}
                        disabled={disabled}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            error: Boolean(errors.comingUp?.[index]?.date),
                            helperText: errors.comingUp?.[index]?.date ? 'Date is required' : undefined,
                          },
                        }}
                      />
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <TimePicker
                        label="Time"
                        value={parseTime(item.time)}
                        onChange={(value) =>
                          updateListItem('comingUp', index, {
                            time: value?.isValid() ? value.format('HH:mm') : '',
                          })
                        }
                        format={formatStr.time}
                        disabled={disabled}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            error: Boolean(errors.comingUp?.[index]?.time),
                            helperText: errors.comingUp?.[index]?.time ? 'Time is required' : undefined,
                          },
                        }}
                      />
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Title"
                        disabled={disabled}
                        error={Boolean(errors.comingUp?.[index]?.title)}
                        helperText={errors.comingUp?.[index]?.title ? 'Title is required' : undefined}
                        value={item.title || ''}
                        onChange={(event) => updateListItem('comingUp', index, { title: event.target.value })}
                      />
                    </Grid>
                    <Grid xs={12} sm={8}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Description"
                        disabled={disabled}
                        value={item.description || ''}
                        onChange={(event) => updateListItem('comingUp', index, { description: event.target.value })}
                      />
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Category"
                        disabled={disabled}
                        value={item.category || ''}
                        onChange={(event) => updateListItem('comingUp', index, { category: event.target.value })}
                      />
                    </Grid>
                  </Grid>
                </NestedCard>
              ))}
            </Stack>
          </AccordionSection>
        )}

        {form.sections?.notices && (
          <AccordionSection
            title="Notices"
            count={form.notices?.length || 0}
            expanded={Boolean(expanded.notices) || Boolean(Object.keys(errors.notices || {}).length)}
            onChange={() => toggleExpanded('notices')}
            action={
              !disabled && (
                <Button
                  size="small"
                  startIcon={<Iconify icon="solar:add-circle-bold" />}
                  onClick={(event) => {
                    event.stopPropagation();
                    const lastNotice = (form.notices || []).at(-1);
                    if (lastNotice && isIncompleteNotice(lastNotice)) {
                      toast.error('Please fill title and body before adding another notice');
                      setExpanded((prev) => ({ ...prev, notices: true }));
                      return;
                    }
                    update({ notices: [...(form.notices || []), { title: '', body: '' }] });
                    setExpanded((prev) => ({ ...prev, notices: true }));
                  }}
                >
                  Add notice
                </Button>
              )
            }
          >
            <Stack spacing={1.5}>
              {(form.notices || []).map((item, index) => (
                <NestedCard
                  key={`${item.title}-${index}`}
                  title={`Notice ${index + 1}`}
                  onRemove={disabled ? undefined : () => removeListItem('notices', index)}
                >
                  <Grid container spacing={1.5}>
                    <Grid xs={12} md={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Title"
                        disabled={disabled}
                        error={Boolean(errors.notices?.[index]?.title)}
                        helperText={errors.notices?.[index]?.title ? 'Title is required' : undefined}
                        value={item.title || ''}
                        onChange={(event) => updateListItem('notices', index, { title: event.target.value })}
                      />
                    </Grid>
                    <Grid xs={12} md={8}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        label="Body"
                        disabled={disabled}
                        error={Boolean(errors.notices?.[index]?.body)}
                        helperText={errors.notices?.[index]?.body ? 'Body is required' : undefined}
                        value={item.body || ''}
                        onChange={(event) => updateListItem('notices', index, { body: event.target.value })}
                      />
                    </Grid>
                  </Grid>
                </NestedCard>
              ))}
            </Stack>
          </AccordionSection>
        )}

        {form.sections?.newResidents && (
          <AccordionSection
            title="New residents"
            count={form.newResidents?.length || 0}
            expanded={Boolean(expanded.newResidents)}
            onChange={() => toggleExpanded('newResidents')}
          >
            <InfiniteAutocomplete
              multiple
              value={selectedResidents}
              onChange={(options) =>
                update({
                  newResidents: (options || []).map((option) => ({
                    residentId: option.value,
                    name: option.name || option.label,
                    roomNumber: option.roomNumber || '',
                  })),
                })
              }
              useQuery={useGetResidentsQuery}
              queryArgs={residentQueryArgs}
              mapOption={mapResidentOption}
              enabled={Boolean(organizationId)}
              disabled={disabled}
              label="New residents"
              placeholder="Select residents"
            />
          </AccordionSection>
        )}

        {form.sections?.gallery && (
          <AccordionSection
            title="Photo gallery"
            count={form.gallery?.length || 0}
            expanded={Boolean(expanded.gallery)}
            onChange={() => toggleExpanded('gallery')}
          >
            <Grid container spacing={1.5}>
              {(form.gallery || []).map((item, index) => (
                <Grid key={item.mediaId || index} xs={12} sm={6}>
                  <Stack spacing={1}>
                    {item.url && (
                      <Box
                        sx={{
                          height: 92,
                          borderRadius: 1.25,
                          backgroundImage: `url(${item.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                        }}
                      />
                    )}
                    <TextField
                      size="small"
                      label="Caption"
                      disabled={disabled}
                      value={item.caption || ''}
                      onChange={(event) => updateListItem('gallery', index, { caption: event.target.value })}
                    />
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </AccordionSection>
        )}

        <AccordionSection
          title="Footer"
          expanded={Boolean(expanded.footer)}
          onChange={() => toggleExpanded('footer')}
        >
          <Grid container spacing={1.5}>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Home name"
                disabled={disabled}
                value={form.footer?.homeName || ''}
                onChange={(event) => update({ footer: { ...form.footer, homeName: event.target.value } })}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Address"
                disabled={disabled}
                value={form.footer?.address || ''}
                onChange={(event) => update({ footer: { ...form.footer, address: event.target.value } })}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Phone"
                disabled={disabled}
                value={form.footer?.phone || ''}
                onChange={(event) => update({ footer: { ...form.footer, phone: event.target.value } })}
              />
            </Grid>
            <Grid xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                disabled={disabled}
                value={form.footer?.email || ''}
                onChange={(event) => update({ footer: { ...form.footer, email: event.target.value } })}
              />
            </Grid>
          </Grid>
        </AccordionSection>
      </Stack>
    </Card>
  );
}

AccordionSection.propTypes = {
  title: PropTypes.string,
  count: PropTypes.number,
  expanded: PropTypes.bool,
  onChange: PropTypes.func,
  action: PropTypes.node,
  children: PropTypes.node,
};

NestedCard.propTypes = {
  title: PropTypes.string,
  onRemove: PropTypes.func,
  children: PropTypes.node,
};

NewsletterTemplateConfig.propTypes = {
  form: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object,
  counts: PropTypes.object,
  organizationId: PropTypes.string,
  branchId: PropTypes.string,
  disabled: PropTypes.bool,
};
