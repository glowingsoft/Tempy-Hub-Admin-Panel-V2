// components/kiosk-content-dialog.jsx

import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { Upload } from 'src/components/upload';

import { KIOSK_CONTENT_TYPES, registerMockKioskDocument } from './mocks/data';

const QR_SOURCE_OPTIONS = [
  { value: 'link', label: 'Link' },
  { value: 'document', label: 'Upload document' },
];

const DOCUMENT_ACCEPT = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/*': [],
};

export function KioskContentDialog({
  open,
  screen,
  onClose,
  onSave,
}) {
  const [type, setType] = useState('text');
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');
  const [qrSource, setQrSource] = useState('link');
  const [qrFile, setQrFile] = useState(null);

  useEffect(() => {
    if (!screen) return;

    setType(screen.type || 'text');
    setValue(screen.value || '');
    setLabel(screen.label || '');
    setQrSource(screen.value?.includes('/view-document/') ? 'document' : 'link');
    setQrFile(null);
  }, [screen]);

  const handleSave = () => {
    onSave({
      ...screen,
      type,
      value,
      label: type === 'link' ? label : undefined,
    });

    onClose();
  };

  const handleDropDocument = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setQrFile(file);

    const token = registerMockKioskDocument(file);
    setValue(paths.documentView(token));
  };

  const handleRemoveDocument = () => {
    setQrFile(null);
    setValue('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {screen ? "Edit" : "Add Widget"} {screen?.name}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            select
            fullWidth
            label="Content Type"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setValue('');
              setLabel('');
            }}
          >
            {KIOSK_CONTENT_TYPES.map((item) => (
              <MenuItem
                key={item.value}
                value={item.value}
              >
                {item.label}
              </MenuItem>
            ))}
          </TextField>

          {type === 'text' && (
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Text"
              value={value}
              onChange={(event) =>
                setValue(event.target.value)
              }
            />
          )}

          {type === 'image' && (
            <TextField
              fullWidth
              label="Image URL"
              placeholder="https://..."
              value={value}
              onChange={(event) =>
                setValue(event.target.value)
              }
            />
          )}

          {type === 'qr' && (
            <Stack spacing={2}>
              <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                value={qrSource}
                onChange={(event, next) => {
                  if (!next) return;
                  setQrSource(next);
                  setValue('');
                  setQrFile(null);
                }}
              >
                {QR_SOURCE_OPTIONS.map((option) => (
                  <ToggleButton key={option.value} value={option.value}>
                    {option.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              {qrSource === 'link' ? (
                <TextField
                  fullWidth
                  label="QR Code Value"
                  placeholder="https://..."
                  value={value}
                  onChange={(event) =>
                    setValue(event.target.value)
                  }
                />
              ) : (
                <Stack spacing={1}>
                  <Upload
                    value={qrFile}
                    onDrop={handleDropDocument}
                    onDelete={handleRemoveDocument}
                    accept={DOCUMENT_ACCEPT}
                    helperText="PDF, Word or image files only"
                  />
                  {value && (
                    <Typography variant="caption" color="text.secondary">
                      QR will link to: {value}
                    </Typography>
                  )}
                </Stack>
              )}
            </Stack>
          )}

          {type === 'link' && (
            <>
              <TextField
                fullWidth
                label="Link Label"
                placeholder="Visit Website"
                value={label}
                onChange={(event) =>
                  setLabel(event.target.value)
                }
              />

              <TextField
                fullWidth
                label="URL"
                placeholder="https://..."
                value={value}
                onChange={(event) =>
                  setValue(event.target.value)
                }
              />
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
