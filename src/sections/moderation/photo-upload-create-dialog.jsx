import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { toast } from 'src/components/snackbar';
import { Upload } from 'src/components/upload';
import { useGetResidentsQuery } from 'src/store/Reducer/residents-api';
import {
  useCreateFamilyUploadMutation,
  useUploadFamilyUploadMediaBatchMutation,
  useUploadFamilyUploadMediaMutation,
} from 'src/store/Reducer/family-uploads-api';

// ----------------------------------------------------------------------

const MAX_PHOTOS = 10;

const mapResidentOption = (resident) => ({
  value: resident._id || resident.residentId,
  label: resident.roomNumber ? `${resident.name} (Room ${resident.roomNumber})` : resident.name,
});

export function PhotoUploadCreateDialog({ open, onClose, organizationId, branchId }) {
  const [resident, setResident] = useState(null);
  const [message, setMessage] = useState('');
  const [includeInGazette, setIncludeInGazette] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [uploadFamilyUploadMedia] = useUploadFamilyUploadMediaMutation();
  const [uploadFamilyUploadMediaBatch] = useUploadFamilyUploadMediaBatchMutation();
  const [createFamilyUpload, { isLoading: isCreating }] = useCreateFamilyUploadMutation();
  const saving = isCreating || uploading;

  useEffect(() => {
    if (!open) return;
    setResident(null);
    setMessage('');
    setIncludeInGazette(true);
    setPhotos([]);
  }, [open]);

  const handleDropPhotos = useCallback((acceptedFiles) => {
    const imageFiles = acceptedFiles.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length < acceptedFiles.length) {
      toast.error('Only image files are allowed.');
    }

    setPhotos((prev) => {
      const remaining = MAX_PHOTOS - prev.length;
      if (remaining <= 0) {
        toast.error(`You can attach up to ${MAX_PHOTOS} photos.`);
        return prev;
      }

      const nextFiles = imageFiles.slice(0, remaining).map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );
      if (imageFiles.length > remaining) {
        toast.error(`You can attach up to ${MAX_PHOTOS} photos.`);
      }
      return [...prev, ...nextFiles];
    });
  }, []);

  const handleClose = () => {
    if (saving) return;
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!resident?.value) {
      toast.error('Please select a resident');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    if (!photos.length) {
      toast.error('Please attach at least one photo');
      return;
    }

    try {
      setUploading(true);
      const files = photos.filter((photo) => photo instanceof File);
      const uploaded =
        files.length === 1
          ? await uploadFamilyUploadMedia({ organizationId, file: files[0] }).unwrap()
          : await uploadFamilyUploadMediaBatch({ organizationId, files }).unwrap();

      const mediaIds = uploaded.map((item) => item.mediaId).filter(Boolean);
      if (!mediaIds.length) {
        toast.error('Photo upload did not return media IDs');
        return;
      }

      await createFamilyUpload({
        organizationId,
        residentId: resident.value,
        message: message.trim(),
        mediaIds,
        includeInGazette,
        clientId: `staff-upload-${Date.now()}`,
      }).unwrap();

      toast.success('Photos submitted for approval');
      onClose?.();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to submit photos');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={700}>
          Upload photos
        </Typography>
        <IconButton size="small" onClick={handleClose} disabled={saving}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <InfiniteAutocomplete
            value={resident}
            onChange={setResident}
            useQuery={useGetResidentsQuery}
            queryArgs={{ organizationId, ...(branchId ? { branchId } : {}) }}
            mapOption={mapResidentOption}
            enabled={open && Boolean(organizationId)}
            disabled={saving}
            label="Resident"
            placeholder="Select resident"
          />

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Message"
            placeholder="e.g. Tea party in the garden room"
            value={message}
            disabled={saving}
            onChange={(event) => setMessage(event.target.value)}
          />

          <FormControlLabel
            control={
              <Switch
                checked={includeInGazette}
                onChange={(event) => setIncludeInGazette(event.target.checked)}
                disabled={saving}
              />
            }
            label="Include in gazette"
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Photos (max {MAX_PHOTOS})
            </Typography>
            <Upload
              multiple
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] }}
              value={photos}
              disabled={saving}
              onDrop={handleDropPhotos}
              onRemove={(file) => setPhotos((prev) => prev.filter((item) => item !== file))}
              onRemoveAll={() => setPhotos([])}
              helperText={
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.disabled' }}>
                  JPG, PNG, WebP or GIF. Maximum {MAX_PHOTOS} images.
                </Typography>
              }
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <LoadingButton variant="outlined" color="inherit" onClick={handleClose} disabled={saving}>
          Cancel
        </LoadingButton>
        <LoadingButton
          variant="contained"
          color="primary"
          loading={saving}
          onClick={handleSubmit}
          startIcon={<Iconify icon="solar:upload-bold" />}
        >
          Submit for approval
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

PhotoUploadCreateDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  organizationId: PropTypes.string,
  branchId: PropTypes.string,
};
