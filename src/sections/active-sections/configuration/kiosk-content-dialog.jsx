// components/kiosk-content-dialog.jsx

import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { Upload } from 'src/components/upload';
import { toast } from 'src/components/snackbar';
import { useUploadImageMutation } from 'src/store/Reducer/upload-api';
import { KIOSK_CONTENT_TYPES } from './mocks/data';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const TEXT_KIND_OPTIONS = [
  { value: 'quoteOfTheDay', label: 'Quote Of The Day' },
  { value: 'greeting', label: 'Greeting' },
  { value: 'announcement', label: 'Announcement' },
];

const parseHttpsUrl = (value) => {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
};

const isHttpsUrl = (value) => Boolean(parseHttpsUrl(value));

export function KioskContentDialog({ open, screen, onClose, onSave, maxReached, saving, mode = 'home' }) {
  const [type, setType] = useState('image');
  const [title, setTitle] = useState('');
  const [sortOrder, setSortOrder] = useState(1);

  // Config fields
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [textKind, setTextKind] = useState('quoteOfTheDay');
  const [body, setBody] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [buttonLabel, setButtonLabel] = useState('');
  const [showToVisitors, setShowToVisitors] = useState(true);
  const [showToEmployees, setShowToEmployees] = useState(false);
  const [errors, setErrors] = useState({});

  const [imageFile, setImageFile] = useState(null);

  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();

  useEffect(() => {
    if (!open) return;

    if (screen) {
      setType(screen.type || 'image');
      setTitle(screen.title || screen.name || '');
      setSortOrder(screen.sortOrder || screen.id || 1);

      setImageUrl(screen.config?.imageUrl || (screen.type === 'image' ? screen.value : '') || '');
      setCaption(screen.config?.caption || screen.caption || '');
      setTextKind(screen.config?.textKind || 'quoteOfTheDay');
      setBody(screen.config?.body || (screen.type === 'text' ? screen.value : '') || '');
      setQrUrl(screen.config?.url || (screen.type === 'qr' ? screen.value : '') || '');
      setLinkUrl(screen.config?.url || (screen.type === 'link' ? screen.value : '') || '');
      setButtonLabel(screen.config?.buttonLabel || '');
      setShowToVisitors(screen.showToVisitors ?? true);
      setShowToEmployees(screen.showToEmployees ?? false);
    } else {
      setType(mode === 'checkout' ? 'qr' : 'image');
      setTitle(mode === 'checkout' ? 'Checkout survey' : '');
      setSortOrder(1);
      setImageUrl('');
      setCaption('');
      setTextKind('quoteOfTheDay');
      setBody('');
      setQrUrl('');
      setLinkUrl('');
      setButtonLabel('');
      setShowToVisitors(true);
      setShowToEmployees(false);
    }
    setImageFile(null);
    setErrors({});
  }, [screen, open]);

  const handleDropImage = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type?.toLowerCase().startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be 5 MB or smaller');
      return;
    }

    setImageFile(file);
    setImageUrl('');
    setErrors((previous) => {
      const nextErrors = { ...previous };
      delete nextErrors.image;
      delete nextErrors.imageUrl;
      return nextErrors;
    });
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl('');
  };

  const clearError = (field) => {
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const nextErrors = { ...previous };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleSave = async () => {
    if (!screen && maxReached) {
      toast.error('A maximum of 3 home screen widgets is allowed');
      return;
    }

    const validationErrors = {};
    const trimmedTitle = title.trim();
    const parsedLinkUrl = type === 'link' ? parseHttpsUrl(linkUrl) : null;

    let config = {};

    if (!trimmedTitle) validationErrors.title = 'Widget title is required';
    const numericSortOrder = Number(sortOrder);
    if (mode === 'home' && (!Number.isInteger(numericSortOrder) || numericSortOrder < 1)) {
      validationErrors.sortOrder = 'Enter a sort order of 1 or greater';
    }

    if (type === 'image') {
      const trimmedImageUrl = imageUrl.trim();
      if (!imageFile && !trimmedImageUrl) {
        validationErrors.image = 'An image upload or URL is required';
      } else if (!imageFile && !isHttpsUrl(trimmedImageUrl)) {
        validationErrors.imageUrl = 'Enter a valid HTTPS image URL';
      }
      if (!caption.trim()) {
        validationErrors.caption = 'Image caption is required';
      }
      config = {
        imageUrl: trimmedImageUrl,
        caption: caption.trim(),
      };
    } else if (type === 'text') {
      if (!body?.trim()) {
        validationErrors.body = 'Text body is required';
      }
      if (!TEXT_KIND_OPTIONS.some((option) => option.value === textKind)) {
        validationErrors.textKind = 'Select a text kind';
      }
      config = {
        textKind,
        body: body.trim(),
      };
    } else if (type === 'qr') {
      if (!qrUrl?.trim()) {
        validationErrors.qrUrl = 'QR destination URL is required';
      }
      if (!caption.trim()) {
        validationErrors.caption = 'QR caption is required';
      }
      config = {
        url: qrUrl.trim(),
        caption: caption.trim(),
      };
    } else if (type === 'link') {
      if (!parsedLinkUrl) validationErrors.linkUrl = 'Enter a valid HTTPS link URL';
      if (!buttonLabel.trim()) {
        validationErrors.buttonLabel = 'Button label is required';
      }

      config = {
        url: parsedLinkUrl?.toString() || '',
        buttonLabel: buttonLabel.trim(),
      };
    } else {
      validationErrors.type = 'Select a supported widget type';
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      if (type === 'image' && imageFile) {
        const uploadedImage = await uploadImage(imageFile).unwrap();
        const uploadedUrl = uploadedImage?.fileUrl || uploadedImage?.url;
        if (!uploadedUrl) {
          throw new Error('Image upload did not return a URL');
        }

        config.imageUrl = uploadedUrl;
        setImageUrl(uploadedUrl);
        setImageFile(null);
      }

      const payload = {
        ...(screen?._id ? { _id: screen._id } : {}),
        id: screen?.id || sortOrder,
        type,
        title: trimmedTitle,
        name: trimmedTitle,
        ...(mode === 'home' ? { sortOrder: numericSortOrder } : {}),
        config,
        value: type === 'image' ? config.imageUrl : type === 'text' ? config.body : config.url,
        caption: config.caption,
        ...(mode === 'checkout' ? { showToVisitors, showToEmployees } : {}),
      };

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error('Failed to save kiosk widget:', error);
      toast.error(error?.data?.message || error?.message || 'Failed to save kiosk widget');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{screen ? (mode === 'checkout' ? 'Edit Checkout Widget' : 'Edit Widget') : mode === 'checkout' ? 'Add Checkout Widget' : 'Add Widget'}</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            select
            fullWidth
            label="Widget Type"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setErrors({});
            }}
            required
            error={Boolean(errors.type)}
            helperText={errors.type}
          >
            {KIOSK_CONTENT_TYPES.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Widget Title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              clearError('title');
            }}
            placeholder="e.g. Welcome, Quote Of The Day"
            required
            error={Boolean(errors.title)}
            helperText={errors.title}
          />

          {mode === 'home' && (
            <TextField
              fullWidth
              type="number"
              label="Sort Order"
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value);
                clearError('sortOrder');
              }}
              inputProps={{ min: 1 }}
              required
              error={Boolean(errors.sortOrder)}
              helperText={errors.sortOrder}
            />
          )}

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* IMAGE TYPE */}
          {type === 'image' && (
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Upload Image
              </Typography>

              <Upload
                value={imageFile || imageUrl || null}
                onDrop={handleDropImage}
                onDelete={handleRemoveImage}
                accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
                maxSize={MAX_IMAGE_SIZE}
                disabled={isUploading || saving}
                error={Boolean(errors.image)}
                helperText={errors.image || 'Allowed *.jpeg, *.jpg, *.png, *.webp (up to 5MB)'}
              />

              {imageUrl && (
                <TextField
                  fullWidth
                  label="Image URL (from S3)"
                  value={imageUrl}
                  onChange={(event) => {
                    setImageUrl(event.target.value);
                    clearError('image');
                    clearError('imageUrl');
                  }}
                  placeholder="https://..."
                  error={Boolean(errors.imageUrl)}
                  helperText={errors.imageUrl}
                />
              )}

              <TextField
                fullWidth
                label="Caption"
                value={caption}
                onChange={(event) => {
                  setCaption(event.target.value);
                  clearError('caption');
                }}
                placeholder="e.g. Welcome to our facility"
                required
                error={Boolean(errors.caption)}
                helperText={errors.caption}
              />
            </Stack>
          )}

          {/* TEXT TYPE */}
          {type === 'text' && (
            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                label="Text Kind"
                value={textKind}
                onChange={(event) => {
                  setTextKind(event.target.value);
                  clearError('textKind');
                }}
                required
                error={Boolean(errors.textKind)}
                helperText={errors.textKind}
              >
                {TEXT_KIND_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Text Body"
                value={body}
                onChange={(event) => {
                  setBody(event.target.value);
                  clearError('body');
                }}
                placeholder="e.g. Care is a team sport."
                required
                error={Boolean(errors.body)}
                helperText={errors.body}
              />
            </Stack>
          )}

          {/* QR TYPE */}
          {type === 'qr' && (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="QR Destination URL"
                placeholder="https://forms.google.com/..."
                value={qrUrl}
                onChange={(event) => {
                  setQrUrl(event.target.value);
                  clearError('qrUrl');
                }}
                required
                error={Boolean(errors.qrUrl)}
                helperText={errors.qrUrl}
              />

              {qrUrl && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    LIVE QR CODE PREVIEW
                  </Typography>
                  <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 1 }}>
                    <QRCode value={qrUrl} size={140} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Scans directly to: {qrUrl}
                  </Typography>
                </Box>
              )}

              <TextField
                fullWidth
                label="Caption shown under QR"
                placeholder="Scan to tell us about your visit"
                value={caption}
                onChange={(event) => {
                  setCaption(event.target.value);
                  clearError('caption');
                }}
                required
                error={Boolean(errors.caption)}
                helperText={errors.caption}
              />
            </Stack>
          )}

          {type === 'link' && (
            <Stack spacing={2}>
              <TextField
                fullWidth
                type="url"
                label="Link URL"
                value={linkUrl}
                onChange={(event) => {
                  setLinkUrl(event.target.value);
                  clearError('linkUrl');
                }}
                placeholder="https://example.com"
                required
                error={Boolean(errors.linkUrl)}
                helperText={errors.linkUrl}
              />
              <TextField
                fullWidth
                label="Button label"
                value={buttonLabel}
                onChange={(event) => {
                  setButtonLabel(event.target.value);
                  clearError('buttonLabel');
                }}
                placeholder="Learn more"
                required
                error={Boolean(errors.buttonLabel)}
                helperText={errors.buttonLabel}
              />
            </Stack>
          )}

          {mode === 'checkout' && (
            <Stack spacing={1}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Audience Visibility
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2">Show to visitors</Typography>
                <Switch checked={showToVisitors} onChange={(event) => setShowToVisitors(event.target.checked)} color="primary" />
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2">Show to employees</Typography>
                <Switch checked={showToEmployees} onChange={(event) => setShowToEmployees(event.target.checked)} color="primary" />
              </Stack>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={isUploading || saving}>
          Cancel
        </Button>

        <LoadingButton
          variant="contained"
          color="primary"
          onClick={handleSave}
          loading={isUploading || saving}
          disabled={Boolean(maxReached && !screen)}
        >
          {screen ? 'Save Changes' : 'Add Widget'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
