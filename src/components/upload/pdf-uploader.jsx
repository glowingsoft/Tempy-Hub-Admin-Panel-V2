import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Card from '@mui/material/Card';

import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { fData } from 'src/utils/format-number';
import { useUploadFileMutation } from 'src/store/Reducer/upload-api';

// ----------------------------------------------------------------------

export function PdfUploader({
  value = [],
  onChange,
  multiple = true,
  disabled = false,
  maxSize = 25 * 1024 * 1024, // 25MB default
  helperText,
  error,
  sx,
  ...other
}) {
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [uploadingFileName, setUploadingFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const documents = Array.isArray(value) ? value : value ? [value] : [];

  const handleDrop = useCallback(
    async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles && rejectedFiles.length > 0) {
        const firstRejection = rejectedFiles[0];
        const errorMsg =
          firstRejection.errors?.[0]?.message || 'Only PDF files under 25MB are allowed.';
        toast.error(errorMsg);
        return;
      }

      if (!acceptedFiles || acceptedFiles.length === 0) return;

      const filesToProcess = multiple ? acceptedFiles : [acceptedFiles[0]];
      const uploadedDocs = [...documents];

      for (let i = 0; i < filesToProcess.length; i += 1) {
        const file = filesToProcess[i];

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          toast.error(`"${file.name}" is not a valid PDF file.`);
          continue;
        }

        try {
          setUploadingFileName(file.name);
          setUploadProgress(Math.round(((i + 1) / filesToProcess.length) * 100));

          const res = await uploadFile(file).unwrap();
          const s3Key = res?.key || res?.fileKey || res?.path;

          if (!s3Key) {
            throw new Error('Upload succeeded but no S3 key was returned.');
          }

          const docObj = {
            key: s3Key,
            originalName: file.name,
            mimeType: file.type || 'application/pdf',
            sizeBytes: file.size,
          };

          if (multiple) {
            uploadedDocs.push(docObj);
          } else {
            uploadedDocs[0] = docObj;
          }
        } catch (err) {
          console.error('PDF upload error:', err);
          toast.error(err?.data?.message || err?.message || `Failed to upload "${file.name}"`);
        }
      }

      setUploadingFileName('');
      setUploadProgress(0);
      onChange?.(multiple ? uploadedDocs : uploadedDocs[0] || null);
    },
    [documents, multiple, onChange, uploadFile]
  );

  const handleRemove = useCallback(
    (indexToRemove) => {
      if (multiple) {
        const nextDocs = documents.filter((_, idx) => idx !== indexToRemove);
        onChange?.(nextDocs);
      } else {
        onChange?.(null);
      }
    },
    [documents, multiple, onChange]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    multiple,
    disabled: disabled || isUploading,
    maxSize,
    accept: {
      'application/pdf': ['.pdf'],
    },
    onDrop: handleDrop,
    ...other,
  });

  const hasError = isDragReject || !!error;

  return (
    <Box sx={{ width: 1, ...sx }}>
      {/* Drop Area */}
      <Box
        {...getRootProps()}
        sx={{
          p: 3,
          outline: 'none',
          borderRadius: 1.5,
          cursor: disabled || isUploading ? 'default' : 'pointer',
          textAlign: 'center',
          transition: (theme) => theme.transitions.create(['opacity', 'border-color', 'background-color']),
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
          border: (theme) => `1.5px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.24)}`,
          '&:hover': {
            opacity: disabled || isUploading ? 1 : 0.8,
            borderColor: (theme) => theme.vars.palette.primary.main,
          },
          ...(isDragActive && {
            bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
            borderColor: 'primary.main',
          }),
          ...(hasError && {
            color: 'error.main',
            borderColor: 'error.main',
            bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
          }),
          ...(disabled && {
            opacity: 0.48,
            pointerEvents: 'none',
          }),
        }}
      >
        <input {...getInputProps()} />

        <Stack spacing={1.5} alignItems="center" justifyContent="center">
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
              color: 'primary.main',
            }}
          >
            {isUploading ? (
              <CircularProgress size={26} color="primary" />
            ) : (
              <Iconify icon="solar:file-text-bold-duotone" width={32} />
            )}
          </Box>

          <Stack spacing={0.5} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {isUploading
                ? `Uploading ${uploadingFileName || 'document'}...`
                : 'Drop PDF certificate or browse'}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Only .pdf files are supported (max {Math.round(maxSize / (1024 * 1024))}MB)
            </Typography>
          </Stack>
        </Stack>

        {isUploading && (
          <Box sx={{ width: 1, mt: 2 }}>
            <LinearProgress
              variant={uploadProgress > 0 ? 'determinate' : 'indeterminate'}
              value={uploadProgress}
              sx={{ borderRadius: 1 }}
            />
          </Box>
        )}
      </Box>

      {/* Helper text / error message */}
      {helperText && (
        <FormHelperText error={!!error} sx={{ px: 1, mt: 0.75 }}>
          {helperText}
        </FormHelperText>
      )}

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {documents.map((doc, idx) => (
            <Card
              key={doc.key || idx}
              variant="outlined"
              sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.12),
                  color: 'error.main',
                  flexShrink: 0,
                }}
              >
                <Iconify icon="solar:file-text-bold" width={24} />
              </Box>

              <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                  {doc.originalName || doc.key?.split('/').pop() || 'document.pdf'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {doc.sizeBytes ? fData(doc.sizeBytes) : 'PDF Document'}
                </Typography>
              </Box>

              {!disabled && (
                <IconButton
                  size="small"
                  color="default"
                  onClick={() => handleRemove(idx)}
                  sx={{ flexShrink: 0 }}
                >
                  <Iconify icon="mingcute:close-line" width={18} />
                </IconButton>
              )}
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

PdfUploader.propTypes = {
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  onChange: PropTypes.func,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,
  maxSize: PropTypes.number,
  helperText: PropTypes.node,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  sx: PropTypes.object,
};