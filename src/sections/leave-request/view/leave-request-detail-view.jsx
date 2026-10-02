import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { useParams, useRouter } from 'src/routes/hooks';

import { fDate, fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

// import { useGetLeaveRequestsQuery } from 'src/store/Reducer/leave-requests-api';
import { getLeaveRequestStatusMeta, getLeaveTypeLabel, getMockLeaveRequestById } from '../mocks/data';
import { getLeaveRequestContext, getLeaveRequestStaffName } from '../utils';
import { useLeaveRequestActions } from '../use-leave-request-actions';
import { LeaveRequestActionDialog } from '../leave-request-action-dialog';

// ----------------------------------------------------------------------

export function LeaveRequestDetailView({ variant = 'owner' }) {
  const { id } = useParams();
  const router = useRouter();

  const ctx = useMemo(() => getLeaveRequestContext(variant), [variant]);

  const [reloadKey, setReloadKey] = useState(0);
  const handleChanged = useCallback(() => setReloadKey((key) => key + 1), []);

  const { askApprove, askReject, dialogProps } = useLeaveRequestActions({ onChanged: handleChanged });

  // TODO: swap for a real `GET /admin/leave-requests/:id` query if one exists —
  // for now the detail reads from the mock list.
  const request = useMemo(() => getMockLeaveRequestById(id), [id, reloadKey]);

  if (!request) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(ctx.listHref)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Leave request not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  const status = getLeaveRequestStatusMeta(request.status);
  const isPending = request.status === 'pending';

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading="Leave request details"
        links={[
          { name: 'Dashboard', href: ctx.dashboardHref },
          { name: ctx.heading, href: ctx.listHref },
          { name: getLeaveRequestStaffName(request) },
        ]}
        action={
          isPending && (
            <Stack direction="row" spacing={1.5}>
              <Button
                color="error"
                variant="outlined"
                onClick={() => askReject(request)}
                startIcon={<Iconify icon="solar:close-circle-bold" />}
              >
                Reject
              </Button>
              <Button
                color="success"
                variant="contained"
                onClick={() => askApprove(request)}
                startIcon={<Iconify icon="solar:check-circle-bold" />}
              >
                Approve
              </Button>
            </Stack>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <DetailCard title="Request">
          <DetailItem label="Staff" value={getLeaveRequestStaffName(request)} />
          <DetailItem label="Employee code" value={request.staff?.employeeCode || '—'} />
          <DetailItem label="Email" value={request.staff?.email || '—'} />
          <DetailItem label="Site" value={request.branch?.name || '—'} />
          <DetailItem label="Leave type" value={getLeaveTypeLabel(request.leaveType)} />
          <DetailItem
            label="Status"
            value={
              <Label variant="soft" color={status.color}>
                {status.label}
              </Label>
            }
          />
          <DetailItem label="Start date" value={fDate(request.startDate)} />
          <DetailItem label="End date" value={fDate(request.endDate)} />
          <DetailItem label="Total days" value={request.totalDays ?? '—'} />
          <DetailItem label="Source" value={request.source || '—'} />
          <DetailItem label="Reason" value={request.reason || '—'} />
          <DetailItem
            label="Attachment"
            value={
              request.attachmentUrl ? (
                <a href={request.attachmentUrl} target="_blank" rel="noopener noreferrer">
                  View attachment
                </a>
              ) : (
                '—'
              )
            }
          />
        </DetailCard>

        <DetailCard title="Decision">
          <DetailItem label="Decided by" value={request.decidedBy || '—'} />
          <DetailItem label="Decided at" value={fDateTime(request.decidedAt)} />
          <DetailItem label="Decision note" value={request.decisionNote || '—'} />
        </DetailCard>

        <DetailCard title="Record">
          <DetailItem label="Created by" value={request.createdBy || '—'} />
          <DetailItem label="Created at" value={fDateTime(request.createdAt)} />
          <DetailItem label="Updated at" value={fDateTime(request.updatedAt)} />
        </DetailCard>
      </Stack>

      <LeaveRequestActionDialog {...dialogProps} />
    </Box>
  );
}

// ----------------------------------------------------------------------

function DetailCard({ title, children }) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6">{title}</Typography>
      <Divider sx={{ my: 2 }} />
      <Box
        sx={{
          display: 'grid',
          rowGap: 2.5,
          columnGap: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        }}
      >
        {children}
      </Box>
    </Card>
  );
}

function DetailItem({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}
