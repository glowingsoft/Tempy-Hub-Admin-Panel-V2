import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';

import { useBoolean } from 'src/hooks/use-boolean';
import { useLocation } from 'react-router-dom';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export function UserTableRow({ row, selected, onEditRow, serialNumber }) {

  const view = useBoolean();

  const router = useRouter();
  const location = useLocation();
  const directoryPath = location.pathname.startsWith(paths.owner.root)
    ? paths.owner.directory
    : paths.siteManager.directory;

  const actions = [
    {
      key: 'edit',
      icon: 'solar:pen-bold',
      tooltip: 'Edit',
      onClick: (e) => {
        e.stopPropagation();
        onEditRow();
      },
    },
  ]

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
            <Avatar alt={row.name} src={row.image}>
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
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
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
              row.status === 'On site'
                ? 'success'
                : row.status === 'On leave'
                  ? 'warning'
                  : row.status === 'Checked out'
                    ? 'info'
                    : 'default'
            }
          >
            {row.status || '—'}
          </Label>
        </TableCell>
        {/* Actions */}
        <TableCell align="center">
          <Box onClick={(event) => event.stopPropagation()}>
            <GenericTableRowActions actions={actions} />
          </Box>
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
