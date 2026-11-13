import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

import { useLocation } from 'react-router-dom';
import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export function UserTableRow({
  row,
  selected,
  onEditRow,
  onLockRow,
  onNewVisitInvite,
  onInviteToApp,
  serialNumber,
}) {

  const view = useBoolean();

  const router = useRouter();
  const location = useLocation();
  const directoryPath = location.pathname.startsWith(paths.owner.root)
    ? paths.owner.directory
    : paths.siteManager.directory;

  const hasAccount = Boolean(row.hasAccount);

  const isLocked =
    row.isLocked ??
    (row.user?.status === 'inactive' ||
      row.user?.active === false ||
      row.userStatus === 'inactive' ||
      row.status === 'inactive' ||
      row.accountState?.status === 'inactive' ||
      row.accountState?.status === false);

  return (
    <>
      <TableRow
        hover
        selected={selected}
        aria-checked={selected}
        tabIndex={-1}
        sx={{ cursor: 'pointer' }}
        onClick={() => router.push(directoryPath.detail(row.id))}
      >
        {/* Sr# */}
        <TableCell>{serialNumber}</TableCell>

        {/* Name + Email + Image */}
        <TableCell>
          <Stack spacing={2} direction="row" alignItems="center">
            <Avatar alt={row.name} src={row.image} sx={{ width: 36, height: 36, fontSize: 16 }}>
              {row.name?.charAt(0)}
            </Avatar>

            <Stack
              sx={{
                typography: 'body2',
                flex: '1 1 auto',
                alignItems: 'flex-start',
              }}
            >
              <Link
                color="inherit"
                sx={{ cursor: 'pointer' }}
              >
                {row.name || '—'}
              </Link>

              <Box
                sx={{
                  color: 'text.secondary',
                  typography: 'caption',
                }}
              >
                {row.email || '—'}
              </Box>
            </Stack>
          </Stack>
        </TableCell>

        {/* Branch */}
        <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
          {row.branch || '—'}
        </TableCell>

        {/* Role */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.role || '—'}
        </TableCell>

        {/* Department */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.department || '—'}
        </TableCell>

        {/* Status */}
        <TableCell align="center">
          <Label
            variant="soft"
            color={
              row.siteStatus === 'onSite' || row.status === 'On Site' || row.status === 'On site'
                ? 'success'
                : 'default'
            }
          >
            {row.status || '—'}
          </Label>
        </TableCell>
        {/* Actions */}
        <TableCell align="right" sx={{ width: 140 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            spacing={0.5}
            onClick={(event) => event.stopPropagation()}
            sx={{ minWidth: 120, ml: 'auto' }}
          >
            <Tooltip title="Edit" placement="top" arrow>
              <IconButton color="default" onClick={onEditRow}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>

            {onNewVisitInvite && (
              <Tooltip title="New visit invitation" placement="top" arrow>
                <IconButton color="primary" onClick={() => onNewVisitInvite(row)}>
                  <Iconify icon="solar:calendar-add-bold" />
                </IconButton>
              </Tooltip>
            )}

            {hasAccount ? (
              <Tooltip
                title={isLocked ? 'Activate account' : 'Deactivate account'}
                placement="top"
                arrow
              >
                <IconButton
                  color={isLocked ? 'success' : 'error'}
                  onClick={onLockRow}
                >
                  <Iconify
                    icon={isLocked ? 'solar:user-check-bold' : 'solar:user-block-bold'}
                  />
                </IconButton>
              </Tooltip>
            ) : (
              onInviteToApp && (
                <Tooltip title="Invite to app" placement="top" arrow>
                  <IconButton
                    color="primary"
                    onClick={() => onInviteToApp(row)}
                  >
                    <Iconify icon="solar:user-plus-bold" />
                  </IconButton>
                </Tooltip>
              )
            )}
          </Stack>
        </TableCell>
      </TableRow>
      <Dialog
        fullWidth
        maxWidth={false}
        open={view.value}
        onClose={view.onFalse}
        PaperProps={{ sx: { maxWidth: 720 } }}
      >
        <DialogTitle>View user</DialogTitle>
        <DialogContent>
          <Alert variant="outlined" severity="info" sx={{ mb: 3 }}>
            Account is waiting for confirmation
          </Alert>

          <Box
            rowGap={3}
            columnGap={2}
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
          >
            <ReadOnlyField label="Status" value={row.status || '—'} />
            <ReadOnlyField
              label="Timezone"
              value={row.accountState?.timezone || '—'}
            />

            <ReadOnlyField
              label="Language"
              value={row.accountState?.language || '—'}
            />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <ReadOnlyField label="Full name" value={row.name} />
            <ReadOnlyField label="Email address" value={row.email} type="email" />
            <ReadOnlyField label="Phone number" value={row.phoneNumber} type="tel" />

            <ReadOnlyField label="Location" value={row.userLocation?.name || '—'} />
            <ReadOnlyField
              label="Region"
              value={row.userLocation?.areaLevel || '—'}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={view.onFalse}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function ReadOnlyField({ label, value, type }) {
  return (
    <TextField
      label={label}
      type={type}
      value={value || ''}
      fullWidth
      size="small"
      InputProps={{ readOnly: true }}
    />
  );
}
