import { useCallback, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { useDebounce } from 'src/hooks/use-debounce';
import { fDateTime } from 'src/utils/format-time';
import {
  useGetChatSentBroadcastQuery,
  useGetChatSentQuery,
} from 'src/store/Reducer/chats-api';

import { CHAT_PAGE_SIZE, getBroadcastId, isMessageSeen } from './utils';

// ----------------------------------------------------------------------

const SENT_HEAD = [
  { id: 'message', label: 'Message' },
  { id: 'site', label: 'Site', width: 200 },
  { id: 'sentBy', label: 'Sent by', width: 180 },
  { id: 'sentAt', label: 'Sent', width: 180 },
  { id: 'receipts', label: 'Seen', width: 120, align: 'center' },
];

const DETAIL_HEAD = [
  { id: 'recipient', label: 'Recipient' },
  { id: 'email', label: 'Email' },
  { id: 'status', label: 'Status', width: 140, align: 'center' },
];

export function ChatSentView({
  organizationId,
  branchId,
  broadcastId,
  onOpenBroadcast,
  onBack,
}) {
  const [keyword, setKeyword] = useState('');
  const trimmedKeyword = useDebounce(keyword, 400).trim();

  useEffect(() => {
    setKeyword('');
  }, [branchId]);

  if (broadcastId) {
    return (
      <ChatSentDetail
        organizationId={organizationId}
        broadcastId={broadcastId}
        onBack={onBack}
      />
    );
  }

  return (
    <ChatSentList
      organizationId={organizationId}
      branchId={branchId}
      keyword={trimmedKeyword}
      inputValue={keyword}
      onKeywordChange={setKeyword}
      onOpenBroadcast={onOpenBroadcast}
    />
  );
}

function ChatSentList({
  organizationId,
  branchId,
  keyword,
  inputValue,
  onKeywordChange,
  onOpenBroadcast,
}) {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: CHAT_PAGE_SIZE });

  const { data, isLoading, isFetching, isError } = useGetChatSentQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(branchId ? { branchId } : {}),
      ...(keyword ? { keyword } : {}),
    },
    { skip: !organizationId }
  );

  const rows = data?.data ?? [];
  const totalRecords = data?.meta?.totalRecords ?? rows.length;
  const loading = isLoading || isFetching;

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: '1 1 auto',
        width: 1,
        height: { md: 'calc(100dvh - 176px)' },
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 1.5, pb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          value={inputValue}
          onChange={(event) => {
            table.onResetPage();
            onKeywordChange(event.target.value);
          }}
          placeholder="Search sent messages..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ position: 'relative', minHeight: 0, flex: '1 1 auto' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
            <TableHeadCustom headLabel={SENT_HEAD} />
            <TableBody>
              {loading ? (
                <TableBodySkeleton
                  rowCount={table.rowsPerPage}
                  cellCount={SENT_HEAD.length}
                  dense={table.dense}
                />
              ) : (
                <>
                  {rows.map((row) => (
                    <TableRow
                      key={getBroadcastId(row)}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => onOpenBroadcast(getBroadcastId(row))}
                    >
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 360 }}>
                          {row.message}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.homeName || '—'}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            alt={row.sentByName}
                            src={row.sentByPhotoUrl || undefined}
                            sx={{ width: 32, height: 32 }}
                          >
                            {row.sentByName?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">{row.sentByName || '—'}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{row.sentAt ? fDateTime(row.sentAt) : '—'}</TableCell>
                      <TableCell align="center">
                        {row.readCount || 0}/{row.recipients || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableNoData
                    notFound={!loading && !rows.length}
                    title={isError ? 'Unable to load sent messages' : 'No sent messages'}
                  />
                </>
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Box>

      <TablePaginationCustom
        page={table.page}
        count={totalRecords}
        dense={table.dense}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        onChangeDense={table.onChangeDense}
      />
    </Card>
  );
}

function ChatSentDetail({ organizationId, broadcastId, onBack }) {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: CHAT_PAGE_SIZE });

  const { data, isLoading, isFetching, isError } = useGetChatSentBroadcastQuery(
    {
      organizationId,
      broadcastId,
      page: table.page + 1,
      limit: table.rowsPerPage,
    },
    { skip: !organizationId || !broadcastId }
  );

  const rows = data?.data ?? [];
  const summary = data?.meta?.message ?? {};
  const totalRecords = data?.meta?.totalRecords ?? rows.length;
  const loading = isLoading || isFetching;

  const heading = useMemo(() => summary.message || 'Sent message', [summary.message]);

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: '1 1 auto',
        width: 1,
        height: { md: 'calc(100dvh - 176px)' },
        overflow: 'hidden',
      }}
    >
      <Stack spacing={1.5} sx={{ p: 1.5, pb: 1.5 }}>
        <Button
          color="inherit"
          onClick={onBack}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to sent
        </Button>

        <Stack spacing={0.5}>
          <Typography variant="h6">{heading}</Typography>
          <Typography variant="body2" color="text.secondary">
            {[summary.homeName, summary.sentByName, summary.sentAt ? fDateTime(summary.sentAt) : '']
              .filter(Boolean)
              .join(' · ')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Seen {summary.readCount || 0} of {summary.recipients || totalRecords}
          </Typography>
        </Stack>
      </Stack>

      <Box sx={{ position: 'relative', minHeight: 0, flex: '1 1 auto' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 640 }}>
            <TableHeadCustom headLabel={DETAIL_HEAD} />
            <TableBody>
              {loading ? (
                <TableBodySkeleton
                  rowCount={table.rowsPerPage}
                  cellCount={DETAIL_HEAD.length}
                  dense={table.dense}
                />
              ) : (
                <>
                  {rows.map((row) => {
                    const seen = isMessageSeen(row);
                    return (
                      <TableRow key={row.recipientId || row.conversationId}>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar alt={row.name} src={row.photoUrl || undefined} sx={{ width: 32, height: 32 }}>
                              {row.name?.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">{row.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{row.email || '—'}</TableCell>
                        <TableCell align="center">
                          <Label variant="soft" color={seen ? 'success' : 'warning'}>
                            {seen ? 'Seen' : 'Not seen'}
                          </Label>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableNoData
                    notFound={!loading && !rows.length}
                    title={isError ? 'Unable to load recipients' : 'No recipients'}
                  />
                </>
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Box>

      <TablePaginationCustom
        page={table.page}
        count={totalRecords}
        dense={table.dense}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        onChangeDense={table.onChangeDense}
      />
    </Card>
  );
}
