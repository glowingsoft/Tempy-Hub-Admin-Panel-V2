
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

// ----------------------------------------------------------------------

const STATUS_COLOR = {
    pending: 'warning',
    checked_in: 'success',
    expired: 'error',
    cancelled: 'default',
};

const STATUS_LABEL = {
    pending: 'Pending',
    checked_in: 'Checked in',
    expired: 'Expired',
    cancelled: 'Cancelled',
};

export function InvitationTableRow({ row, selected, serialNumber, onResend, onCancel }) {
    const view = useBoolean();

    const isPending = row.status === 'pending';

    const actions = [
        {
            key: 'details',
            icon: 'solar:eye-bold',
            tooltip: 'Details',
            onClick: () => view.onTrue(),
        },
        ...(isPending
            ? [
                {
                    key: 'resend',
                    icon: 'solar:letter-bold',
                    tooltip: 'Resend invite',
                    onClick: (e) => {
                        e.stopPropagation();
                        onResend?.();
                    },
                },
                {
                    key: 'cancel',
                    icon: 'solar:close-circle-bold',
                    tooltip: 'Cancel invitation',
                    onClick: (e) => {
                        e.stopPropagation();
                        onCancel?.();
                    },
                },
            ]
            : []),
    ];

    return (
        <>
            <TableRow
                hover
                selected={selected}
                aria-checked={selected}
                tabIndex={-1}
                sx={{ cursor: 'pointer' }}
                onClick={() => view.onTrue()}
            >
                {/* Sr# */}
                <TableCell>{serialNumber}</TableCell>

                {/* Visitor name + email */}
                <TableCell>
                    <Stack spacing={2} direction="row" alignItems="center">
                        <Avatar alt={row.visitorName}>{row.visitorName?.charAt(0)}</Avatar>

                        <Stack
                            sx={{
                                typography: 'body2',
                                flex: '1 1 auto',
                                alignItems: 'flex-start',
                            }}
                        >
                            <Link color="inherit" sx={{ cursor: 'pointer' }}>
                                {row.visitorName || '—'}
                            </Link>

                            <Box sx={{ color: 'text.secondary', typography: 'caption' }}>
                                {row.visitorEmail || '—'}
                            </Box>
                        </Stack>
                    </Stack>
                </TableCell>

                {/* Host */}
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.host || '—'}</TableCell>

                {/* Badge type */}
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.badgeType || '—'}</TableCell>

                {/* Arrival */}
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.arrivalTime || '—'}</TableCell>

                {/* Status */}
                <TableCell align="center">
                    <Label variant="soft" color={STATUS_COLOR[row.status] || 'default'}>
                        {STATUS_LABEL[row.status] || row.status || '—'}
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
                <DialogTitle>View invitation</DialogTitle>
                <DialogContent>
                    <Box
                        rowGap={3}
                        columnGap={2}
                        display="grid"
                        sx={{mt:2}}
                        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
                    >
                        <ReadOnlyField label="Status" value={STATUS_LABEL[row.status] || row.status} />
                        <ReadOnlyField label="Badge type" value={row.badgeType} />

                        <ReadOnlyField label="Visitor name" value={row.visitorName} />
                        <ReadOnlyField label="Visitor email" value={row.visitorEmail} type="email" />

                        <ReadOnlyField label="Host" value={row.host} />
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

                        <ReadOnlyField label="Arrival time" value={row.arrivalTime} />
                        <ReadOnlyField label="Visiting until" value={row.visitingUntil} />

                        <Box sx={{ gridColumn: { xs: 'auto', sm: '1 / -1' } }}>
                            <ReadOnlyField
                                label="Instructions"
                                value={row.instructions}
                                multiline
                                rows={3}
                            />
                        </Box>

                        <ReadOnlyField label="Additional recipients" value={row.additionalRecipients} />
                        <ReadOnlyField
                            label="Express check-in"
                            value={row.expressCheckIn ? 'Enabled' : 'Disabled'}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    {isPending && (
                        <Button
                            color="error"
                            onClick={() => {
                                onCancel?.();
                                view.onFalse();
                            }}
                        >
                            Cancel invitation
                        </Button>
                    )}
                    <Button onClick={view.onFalse}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

function ReadOnlyField({ label, value, type, multiline, rows }) {
    return (
        <TextField
            label={label}
            type={type}
            value={value || ''}
            fullWidth
            // size="small"
            multiline={multiline}
            rows={rows}
            InputProps={{ readOnly: true }}
        />
    );
}