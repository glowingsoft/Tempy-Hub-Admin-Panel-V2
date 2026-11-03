import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const PREVIEW_LIMIT = 10;

function RevenueRows({ rows }) {
  if (!rows.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No revenue data
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {rows.map((item) => (
        <Stack
          key={item.organizationId || item.name}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{ minHeight: 32 }}
        >
          <Typography variant="body2" noWrap sx={{ color: 'text.primary', fontWeight: 600 }}>
            {item.name}
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', flexShrink: 0 }}>
            {item.formatted}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export function RevenueByOrganization({
  title = 'Revenue by Organization',
  subheader = 'Monthly recurring revenue, current billing cycle',
  data = [],
  sx,
  ...other
}) {
  const [open, setOpen] = useState(false);
  const preview = data.slice(0, PREVIEW_LIMIT);
  const showViewMore = data.length > PREVIEW_LIMIT;

  return (
    <Card sx={{ height: 1, display: 'flex', flexDirection: 'column', ...sx }} {...other}>
      <CardHeader title={title} subheader={subheader} sx={{ pb: 1.5 }} />

      <Box sx={{ px: 3, pb: 3, flexGrow: 1 }}>
        <RevenueRows rows={preview} />
      </Box>

      {showViewMore ? (
        <>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Box sx={{ p: 2, textAlign: 'right' }}>
            <Button
              size="small"
              color="inherit"
              onClick={() => setOpen(true)}
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
            >
              View more
            </Button>
          </Box>
        </>
      ) : null}

      <Dialog fullWidth maxWidth="sm" open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {title}
          <IconButton onClick={() => setOpen(false)}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subheader}
          </Typography>
          <Scrollbar sx={{ maxHeight: 480 }}>
            <RevenueRows rows={data} />
          </Scrollbar>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
