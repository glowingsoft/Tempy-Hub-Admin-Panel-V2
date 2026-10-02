import { useMemo } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useParams } from 'src/routes/hooks';

import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';

import { getMockKioskDocument } from '../mocks/data';

// ----------------------------------------------------------------------

export function KioskDocumentView() {
  const { token } = useParams();

  const document_ = useMemo(() => getMockKioskDocument(token), [token]);

  if (!document_) {
    return (
      <EmptyContent
        filled
        title="Link no longer valid"
        description="This document link has expired or doesn't exist. Please check with reception."
        sx={{ py: 10 }}
      />
    );
  }

  return (
    <Card sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
      <Stack spacing={2} alignItems="center">
        <Iconify icon="solar:file-text-bold-duotone" width={64} sx={{ color: 'primary.main' }} />

        <Typography variant="h5">{document_.fileName}</Typography>

        <Button
          href={document_.fileUrl}
          target="_blank"
          rel="noopener"
          variant="contained"
          size="large"
          startIcon={<Iconify icon="solar:eye-bold" />}
        >
          Open document
        </Button>
      </Stack>
    </Card>
  );
}
