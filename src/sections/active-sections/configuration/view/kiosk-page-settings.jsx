import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Stack,
  Switch,
  Divider,
  TextField,
  Typography,
  MenuItem,
  Collapse,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { Iconify } from 'src/components/iconify';

const LINK_TYPES = [
  { value: 'url', label: 'URL' },
  { value: 'check-in', label: 'Check-in' },
  { value: 'form', label: 'Form' },
];

const BLOCK_META = {
  image: { icon: 'solar:gallery-bold', label: 'Image' },
  qrCode: { icon: 'solar:qr-code-bold', label: 'QR code' },
  text: { icon: 'solar:text-bold', label: 'Text' },
  link: { icon: 'solar:link-bold', label: 'Link' },
};

function BlockToggleCard({ blockKey, block, onChange, children }) {
  const meta = BLOCK_META[blockKey];

  return (
    <Card variant="outlined" sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon={meta.icon} width={20} sx={{ color: 'text.secondary' }} />
          <Typography variant="subtitle2">{meta.label}</Typography>
        </Stack>
        <Switch
          checked={block.enabled}
          onChange={(e) => onChange({ ...block, enabled: e.target.checked })}
        />
      </Stack>

      <Collapse in={block.enabled} timeout="auto" unmountOnExit>
        <Divider sx={{ my: 2 }} />
        {children}
      </Collapse>
    </Card>
  );
}

const KioskPageSettings = ({ page, onSave, saving }) => {
  const [blocks, setBlocks] = useState(page?.blocks ?? null);

  useEffect(() => {
    setBlocks(page?.blocks ?? null);
  }, [page]);

  if (!page || !blocks) {
    return (
      <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Select a page on the left to edit its content
        </Typography>
      </Card>
    );
  }

  const updateBlock = (key, next) => {
    setBlocks((prev) => ({ ...prev, [key]: next }));
  };

  const handleSave = () => {
    onSave({ _id: page._id, blocks });
  };

  const anyEnabled = Object.values(blocks).some((b) => b.enabled);

  return (
    <Stack spacing={2}>
      <BlockToggleCard
        blockKey="image"
        block={blocks.image}
        onChange={(next) => updateBlock('image', next)}
      >
        <Box
          sx={{
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            py: 4,
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {blocks.image.url ? 'Replace image' : 'Upload image'}
          </Typography>
        </Box>
      </BlockToggleCard>

      <BlockToggleCard
        blockKey="qrCode"
        block={blocks.qrCode}
        onChange={(next) => updateBlock('qrCode', next)}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 0.5,
                bgcolor: 'action.selected',
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Auto-generated from the link type below
            </Typography>
          </Stack>
          <TextField
            select
            size="small"
            label="Link type"
            value={blocks.qrCode.linkType}
            onChange={(e) => updateBlock('qrCode', { ...blocks.qrCode, linkType: e.target.value })}
          >
            {LINK_TYPES.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          {blocks.qrCode.linkType === 'url' && (
            <TextField
              size="small"
              label="Destination URL"
              value={blocks.qrCode.value}
              onChange={(e) => updateBlock('qrCode', { ...blocks.qrCode, value: e.target.value })}
            />
          )}
        </Stack>
      </BlockToggleCard>

      <BlockToggleCard
        blockKey="text"
        block={blocks.text}
        onChange={(next) => updateBlock('text', next)}
      >
        <TextField
          fullWidth
          multiline
          minRows={3}
          size="small"
          placeholder="Text shown on this kiosk screen"
          value={blocks.text.content}
          onChange={(e) => updateBlock('text', { ...blocks.text, content: e.target.value })}
        />
      </BlockToggleCard>

      <BlockToggleCard
        blockKey="link"
        block={blocks.link}
        onChange={(next) => updateBlock('link', next)}
      >
        <Stack spacing={2}>
          <TextField
            select
            size="small"
            label="Link type"
            value={blocks.link.linkType}
            onChange={(e) => updateBlock('link', { ...blocks.link, linkType: e.target.value })}
          >
            {LINK_TYPES.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          {blocks.link.linkType === 'url' && (
            <TextField
              size="small"
              label="Destination URL"
              value={blocks.link.value}
              onChange={(e) => updateBlock('link', { ...blocks.link, value: e.target.value })}
            />
          )}
        </Stack>
      </BlockToggleCard>

      {!anyEnabled && (
        <Typography variant="caption" color="warning.main">
          Turn on at least one block, or this screen will show blank on the kiosk.
        </Typography>
      )}

      <Stack direction="row" justifyContent="flex-end">
        <LoadingButton variant="contained" loading={saving} onClick={handleSave}>
          Save page
        </LoadingButton>
      </Stack>
    </Stack>
  );
};

export default KioskPageSettings;