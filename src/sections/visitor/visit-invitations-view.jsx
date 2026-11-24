import { useState, useCallback, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LoadingButton from '@mui/lab/LoadingButton';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

import { useCanManage } from 'src/auth/hooks';
import { ModuleSlug } from 'src/auth/permissions';
import { z as zod } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Field } from 'src/components/hook-form';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { fDateTime } from 'src/utils/format-time';
import { getListStatusTabCount } from 'src/utils/table-utils';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import {
  useGetVisitorInvitationsQuery,
  useCreateVisitorInvitationMutation,
  useResendVisitorInvitationMutation,
} from 'src/store/Reducer/visitor-api';

// ----------------------------------------------------------------------

const INVITATION_STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'checkedIn', label: 'Checked in', color: 'success' },
  { value: 'expired', label: 'Expired', color: 'error' },
  { value: 'cancelled', label: 'Cancelled', color: 'default' },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'warning' },
  checkedIn: { label: 'Checked In', color: 'success' },
  checkedin: { label: 'Checked In', color: 'success' },
  expired: { label: 'Expired', color: 'error' },
  cancelled: { label: 'Cancelled', color: 'default' },
  awaitingGuest: { label: 'Awaiting Guest', color: 'warning' },
  accepted: { label: 'Accepted', color: 'success' },
  declined: { label: 'Declined', color: 'error' },
};

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 60 },
  { id: 'visitor', label: 'Visitor', minWidth: 220 },
  { id: 'site', label: 'Site', minWidth: 160 },
  { id: 'window', label: 'Window', minWidth: 180 },
  { id: 'code', label: 'Code', width: 120, align: 'center' },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
  { id: 'actions', label: 'Actions', width: 100, align: 'center' },
];

const mapBranchOption = (item) => ({
  value: item._id || item.id,
  label: item.name || '',
});

const formatWindow = (arrivalAt, visitingUntil, fallback) => {
  if (arrivalAt && visitingUntil) {
    const start = fDateTime(arrivalAt, 'D MMM, HH:mm');
    const end = fDateTime(visitingUntil, 'HH:mm');
    return `${start}–${end}`;
  }
  if (arrivalAt) {
    return fDateTime(arrivalAt, 'D MMM, HH:mm');
  }
  return fallback || '—';
};

// ----------------------------------------------------------------------

export function VisitInvitationsView({
  siteOptions = [],
  openModal: externalOpenModal,
  branchId: propBranchId,
}) {
  const canManageVisitors = useCanManage(ModuleSlug.FIRE_DRILL_EVACUATION);
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const { organizationId } = useCurrentOrganization();
  const internalOpenModal = useBoolean();
  const openModal = externalOpenModal || internalOpenModal;

  const filters = useSetState({
    search: '',
    branchId: 'all',
    status: 'all',
  });

  const effectiveBranchId = propBranchId !== undefined ? propBranchId : filters.state.branchId;

  const keyword = useDebounce(filters.state.search, 500);
  const trimmedKeyword = keyword.trim();

  // API query
  const { data, isLoading, isFetching } = useGetVisitorInvitationsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
      ...(effectiveBranchId && effectiveBranchId !== 'all'
        ? { branchId: effectiveBranchId }
        : {}),
      ...(filters.state.status && filters.state.status !== 'all'
        ? { status: filters.state.status }
        : {}),
    },
    { skip: !organizationId }
  );

  const [resendInvitation, { isLoading: isResending }] = useResendVisitorInvitationMutation();

  const apiInvitations = data?.data || [];
  const meta = data?.meta || {};
  const statusCounts = meta.counts || {};
  const totalRecords = meta.totalRecords ?? apiInvitations.length;

  // Branch map for quick lookup by ID
  const branchMap = useMemo(() => {
    const map = {};
    siteOptions.forEach((opt) => {
      map[opt.value] = opt.label;
    });
    return map;
  }, [siteOptions]);

  const branchFilterOptions = useMemo(
    () => [{ value: 'all', label: 'All Sites' }, ...siteOptions],
    [siteOptions]
  );

  const statusFilterField = useMemo(
    () =>
      createFilterField.status({
        key: 'status',
        options: INVITATION_STATUS_OPTIONS,
        showCounts: true,
      }),
    []
  );

  const toolbarFilterFields = useMemo(
    () => [
      createFilterField.search({
        placeholder: 'Search email ...',
      }),
    ],
    []
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      table.onResetPage();
      filters.setState({ [key]: value });
    },
    [filters, table]
  );

  const handleSearchChange = useCallback(
    (event) => {
      table.onResetPage();
      filters.setState({ search: event.target.value });
    },
    [filters, table]
  );

  const getStatusCount = useCallback(
    (status) => getListStatusTabCount(statusCounts, status, totalRecords),
    [statusCounts, totalRecords]
  );

  const handleResend = useCallback(
    async (row) => {
      const invitationId = row._id || row.id;
      if (!invitationId) return;

      try {
        const res = await resendInvitation({
          invitationId,
          organizationId: organizationId || row.organizationId,
        }).unwrap();
        if (res?.message) {
          toast.success(res.message);
        }
      } catch (err) {
        // Handled by baseQuery api error toast
      }
    },
    [resendInvitation, organizationId]
  );

  const notFound = !isLoading && !isFetching && apiInvitations.length === 0;

  return (
    <>
      <Card>
        <StatusTabsFilterWrapper
          filterField={statusFilterField}
          value={filters.state.status}
          onChange={handleFilterChange}
          getCount={getStatusCount}
        />

        <FlexibleTableToolbar
          filterFields={toolbarFilterFields}
          filterValues={filters.state}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {isLoading || isFetching ? (
                  <TableBodySkeleton
                    rowCount={table.rowsPerPage}
                    cellCount={TABLE_HEAD.length}
                    dense={table.dense}
                  />
                ) : (
                  <>
                    {apiInvitations.map((row, index) => {
                      const visitorName = row.visitorName || row.name || '—';
                      const visitorEmail = row.visitorEmail || row.email || '—';
                      const siteName =
                        row.branch?.name ||
                        branchMap[row.branchId] ||
                        row.branchName ||
                        row.site ||
                        (typeof row.branchId === 'object' ? row.branchId?.name : null) ||
                        '—';
                      const windowText = formatWindow(row.arrivalAt, row.visitingUntil, row.window);
                      const codeText = row.inviteCode || row.code || row.passcode || '—';
                      const statusKey = row.status || 'pending';
                      const isPending = String(statusKey).trim().toLowerCase() === 'pending';
                      const statusInfo = STATUS_CONFIG[statusKey] || {
                        label: statusKey,
                        color: 'default',
                      };

                      return (
                        <TableRow hover key={row._id || row.id || index}>
                          <TableCell>{table.page * table.rowsPerPage + index + 1}</TableCell>

                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                alt={visitorName}
                                sx={{ width: 36, height: 36, fontSize: 16 }}
                              >
                                {visitorName?.charAt(0)}
                              </Avatar>
                              <Stack
                                sx={{
                                  typography: 'body2',
                                  flex: '1 1 auto',
                                  alignItems: 'flex-start',
                                }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {visitorName}
                                </Typography>
                                <Box sx={{ color: 'text.secondary', typography: 'caption' }}>
                                  {visitorEmail}
                                </Box>
                              </Stack>
                            </Stack>
                          </TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{siteName}</TableCell>

                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{windowText}</TableCell>

                          <TableCell align="center">
                            <Box
                              sx={{
                                display: 'inline-block',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: 'background.neutral',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: 13,
                                letterSpacing: 1,
                              }}
                            >
                              {codeText}
                            </Box>
                          </TableCell>

                          <TableCell align="center">
                            <Label variant="soft" color={statusInfo.color}>
                              {statusInfo.label}
                            </Label>
                          </TableCell>

                          <TableCell align="center">
                            {canManageVisitors && isPending && (
                              <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                                <Tooltip title="Resend code" placement="top" arrow>
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleResend(row)}
                                    disabled={isResending}
                                    sx={{ width: 32, height: 32 }}
                                  >
                                    <Iconify icon="solar:restart-bold" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    <TableNoData notFound={notFound} />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={totalRecords}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <NewVisitInvitationDialog
        open={openModal.value}
        onClose={openModal.onFalse}
        organizationId={organizationId}
      />
    </>
  );
}

// ----------------------------------------------------------------------

const NewVisitInvitationSchema = zod
  .object({
    visitorName: zod
      .string()
      .trim()
      .min(1, 'Visitor name is required')
      .regex(/^[^0-9]*$/, 'Visitor name cannot contain numbers'),
    visitorEmail: zod
      .string()
      .trim()
      .min(1, 'Visitor email is required')
      .email('Enter a valid email address'),
    branch: zod
      .object({ value: zod.string(), label: zod.string() })
      .nullable()
      .refine((val) => Boolean(val?.value), { message: 'Site is required' }),
    badgeType: zod.string().min(1, 'Badge / type is required'),
    arrivalAt: zod.any().refine((val) => val && dayjs(val).isValid(), {
      message: 'Arrival date & time is required',
    }),
    visitingUntil: zod.any().refine((val) => val && dayjs(val).isValid(), {
      message: 'Visiting until date & time is required',
    }),
    hostName: zod.string().trim().optional(),
  })
  .refine(
    (data) => !data.arrivalAt || !dayjs(data.arrivalAt).isBefore(dayjs().startOf('day')),
    {
      message: 'Arrival date cannot be before today',
      path: ['arrivalAt'],
    }
  )
  .refine(
    (data) =>
      !data.arrivalAt ||
      !data.visitingUntil ||
      !dayjs(data.visitingUntil).isBefore(dayjs(data.arrivalAt)),
    {
      message: 'Visiting until date cannot be earlier than arrival',
      path: ['visitingUntil'],
    }
  );

export function NewVisitInvitationDialog({ open, onClose, organizationId, initialData }) {
  const [createVisitorInvitation, { isLoading: isCreating }] = useCreateVisitorInvitationMutation();

  const defaultValues = useMemo(() => {
    const now = dayjs();
    const branchVal =
      (typeof initialData?.branchId === 'object' ? initialData?.branchId?._id : initialData?.branchId) ||
      initialData?.branch?._id ||
      '';
    const branchLabel =
      initialData?.branch?.name ||
      (typeof initialData?.branch === 'string' ? initialData.branch : '') ||
      '';

    return {
      visitorName: initialData?.name || '',
      visitorEmail: initialData?.email || '',
      branch: branchVal ? { value: branchVal, label: branchLabel } : null,
      badgeType: initialData?.type === 'contractor' ? 'contractor' : 'visitor',
      arrivalAt: now,
      visitingUntil: now.add(9, 'hour'),
      hostName: initialData?.hostName || 'Reception',
    };
  }, [initialData]);

  const methods = useForm({
    resolver: zodResolver(NewVisitInvitationSchema),
    defaultValues,
  });

  const { reset, handleSubmit, control } = methods;

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset, defaultValues]);

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const body = {
        organizationId,
        branchId: data.branch.value,
        visitorName: data.visitorName.trim(),
        visitorEmail: data.visitorEmail.trim(),
        hostName: data.hostName?.trim() || 'Reception',
        badgeType: data.badgeType,
        arrivalAt: data.arrivalAt ? dayjs(data.arrivalAt).toISOString() : undefined,
        visitingUntil: data.visitingUntil ? dayjs(data.visitingUntil).toISOString() : undefined,
      };

      const res = await createVisitorInvitation(body).unwrap();
      if (res?.message) {
        toast.success(res.message);
      }
      handleClose();
    } catch (err) {
      // Handled by baseQuery api error toast
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>New visit invitation</DialogTitle>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Field.Text
              name="visitorName"
              label="Visitor Name"
              placeholder="e.g. John Doe"
              allowNumbers={false}
              required
            />

            <Field.Text
              name="visitorEmail"
              label="Visitor Email"
              type="email"
              placeholder="e.g. visitor@example.com"
              required
            />

            <Field.InfiniteAutocomplete
              name="branch"
              label="Site"
              placeholder="Search and select site..."
              useQuery={useGetBranchesQuery}
              queryArgs={{ organizationId }}
              mapOption={mapBranchOption}
              enabled={open && Boolean(organizationId)}
              fullWidth
            />

            <Field.Select name="badgeType" label="Badge / Type">
              <MenuItem value="visitor">Visitor</MenuItem>
              <MenuItem value="contractor">Contractor</MenuItem>
            </Field.Select>

            <Controller
              name="arrivalAt"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <MobileDateTimePicker
                  label="Arrival"
                  value={field.value}
                  minDate={dayjs().startOf('day')}
                  onChange={(newVal) => {
                    field.onChange(newVal);
                    const currentUntil = methods.getValues('visitingUntil');
                    if (newVal && currentUntil && dayjs(currentUntil).isBefore(newVal)) {
                      methods.setValue('visitingUntil', dayjs(newVal).add(2, 'hour'), {
                        shouldValidate: true,
                      });
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(error),
                      helperText: error?.message,
                    },
                  }}
                />
              )}
            />

            <Controller
              name="visitingUntil"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <MobileDateTimePicker
                  label="Visiting until"
                  value={field.value}
                  minDateTime={methods.getValues('arrivalAt') || dayjs().startOf('day')}
                  onChange={field.onChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(error),
                      helperText: error?.message,
                    },
                  }}
                />
              )}
            />

            <Field.Text
              name="hostName"
              label="Host Name"
              placeholder="e.g. Reception"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isCreating}
          >
            Send code
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
