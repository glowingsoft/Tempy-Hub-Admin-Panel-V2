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

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { TableInfo } from 'src/sections/user/attendance-table';
import { Typography } from '@mui/material';

// ----------------------------------------------------------------------

export function StaffTableRow({ row, selected, onEditRow, serialNumber }) {

    const view = useBoolean();

    const router = useRouter();

    const actions = [
        {
            key: 'details',
            icon: 'solar:eye-bold',
            tooltip: 'Details',
            onClick: () => router.push(paths.adminDashboard.directory.detail(1)),
        },
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
                onClick={() => router.push(paths.adminDashboard.directory.detail(1))}
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

                {/* Department */}
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {row.department || '—'}
                </TableCell>

                <TableCell align="center">
                    <Typography variant="body2">
                        {row.date}
                    </Typography>
                </TableCell>

                <TableCell align="center">
                    <TableInfo
                        icon="famicons:log-in"
                        color="success"
                        value={row.clockIn}
                    />
                </TableCell>

                <TableCell align="center">
                    <TableInfo
                        icon="solar:logout-2-bold-duotone"
                        color="error"
                        value={row.clockOut}
                    />
                </TableCell>

                <TableCell align="center">
                    <TableInfo
                        icon="solar:tea-cup-bold"
                        color="warning"
                        value={row.breakIn}
                    />
                </TableCell>

                <TableCell align="center">
                    <TableInfo
                        icon="solar:play-bold-duotone"
                        color="info"
                        value={row.breakOut}
                    />
                </TableCell>

                <TableCell align="center">
                    <TableInfo
                        icon="uim:clock"
                        color="success"
                        value={row.total}
                    />
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
            </TableRow>

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
