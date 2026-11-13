import { useMemo } from 'react';
import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import {
    RESIDENT_CARE_LEVEL_OPTIONS,
    RESIDENT_STATUS_OPTIONS,
    RESIDENT_ADMISSION_STATUS_OPTIONS,
} from './mocks/data';
import { isResidentOut, getResidentDestination } from './resident-out-dialog';

export function ResidentTableRow({
    row,
    serialNumber,
    onEditSecurity,
    onEdit,
    onRestriction,
    onOut,
}) {
    const router = useRouter();
    const pathname = usePathname();
    const statusValue = row.admissionStatus || row.status;
    const status =
        RESIDENT_ADMISSION_STATUS_OPTIONS.find((option) => option.value === statusValue) ||
        RESIDENT_STATUS_OPTIONS.find((option) => option.value === statusValue);
    const careLevel = RESIDENT_CARE_LEVEL_OPTIONS.find((option) => option.value === row.careLevel);
    const branchName = row.branch?.name || row.branchName || row.branch || '—';

    // Shared across the site manager, line manager and owner dashboards, so
    // the detail route is resolved from the current URL rather than a prop.
    const isOwner = pathname.startsWith(paths.owner.root);
    const isLineManager = pathname.startsWith(paths.lineManager.root);
    const detailPath = isOwner
        ? paths.owner.residents.detail(row._id)
        : isLineManager
            ? paths.lineManager.residentsDetail(row._id)
            : paths.siteManager.residents.detail(row._id);

    const isRestricted = Boolean(row.restricted);
    const isOut = isResidentOut(row);
    const outDestination = getResidentDestination(row);

    const actions = useMemo(() => [
        {
            key: 'view',
            icon: 'solar:eye-bold',
            tooltip: 'View Resident',
            color: 'default',
            onClick: () => router.push(detailPath),
        },
        ...(onEdit
            ? [
                {
                    key: 'edit',
                    icon: 'solar:pen-bold',
                    tooltip: 'Edit Resident',
                    color: 'default',
                    onClick: () => onEdit?.(row),
                },
            ]
            : []),
        {
            key: 'restriction',
            icon: 'solar:user-block-bold',
            tooltip: isRestricted
                ? `Restricted: ${row.restrictionReason || row.reason || 'Active'}`
                : 'Restrict Resident',
            color: isRestricted ? 'error' : 'default',
            onClick: () => onRestriction?.(row),
        },
        {
            key: 'out',
            icon: isOut ? 'solar:login-2-bold' : 'solar:logout-2-bold',
            tooltip: isOut
                ? (outDestination ? `Mark In of Home (Out: ${outDestination})` : 'Mark In of Home')
                : 'Mark Out of Home',
            color: isOut ? 'error' : 'default',
            sx: isOut ? { color: 'error.main' } : undefined,
            onClick: () => onOut?.(row),
        },
    ], [detailPath, isOut, isRestricted, onEdit, onOut, onRestriction, outDestination, router, row]);

    return (
        <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => router.push(detailPath)}>
            <TableCell>{serialNumber}</TableCell>

            {/* Resident Info */}
            <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar alt={row.name} src={row.image} sx={{ width: 36, height: 36, fontSize: 16, textTransform: 'capitalize' }}>
                        {row.name?.charAt(0)}
                    </Avatar>
                    <Stack sx={{ typography: 'body2', minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            <Box sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{row.name || '—'}</Box>
                            {isRestricted && (
                                <Tooltip title={row.restrictionReason || row.reason || 'Restricted'}>
                                    <Label variant="soft" color="error" sx={{ height: 20, px: 0.75, fontSize: '0.675rem' }}>
                                        Restricted
                                    </Label>
                                </Tooltip>
                            )}
                            {isOut && (
                                <Tooltip title={outDestination ? `Out: ${outDestination}` : 'Out of facility'}>
                                    <Label variant="soft" color="error" sx={{ height: 20, px: 0.75, fontSize: '0.675rem' }}>
                                        Out
                                    </Label>
                                </Tooltip>
                            )}
                        </Stack>
                        <Box sx={{ color: 'text.secondary', typography: 'caption' }}>{row.email || '—'}</Box>
                    </Stack>
                </Stack>
            </TableCell>

            {/* Branch / Site */}
            <TableCell sx={{ textTransform: 'capitalize' }}>{branchName}</TableCell>

            {/* Room Number */}
            <TableCell>{row.roomNumber || '—'}</TableCell>

            {/* Care Level */}
            <TableCell align="center">
                <Label variant="soft" color={careLevel?.value === 'high' ? 'error' : careLevel?.value === 'medium' ? 'warning' : 'success'}>
                    {careLevel?.label || '—'}
                </Label>
            </TableCell>

            {/* Security Password Column */}
            <TableCell align="center" onClick={(event) => event.stopPropagation()}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        ••••••••
                    </Typography>
                    {onEditSecurity && (
                        <Tooltip title="Edit Security Password">
                            <IconButton size="small" color="primary" onClick={() => onEditSecurity?.(row)}>
                                <Iconify icon="solar:shield-keyhole-bold" width={16} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            </TableCell>

            {/* Status */}
            <TableCell align="center">
                <Label variant="soft" color={status?.color || 'default'}>{status?.label || '—'}</Label>
            </TableCell>

            {/* Actions */}
            <TableCell align="center" onClick={(event) => event.stopPropagation()} sx={{ whiteSpace: 'nowrap' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <GenericTableRowActions actions={actions} />
                </Box>
            </TableCell>
        </TableRow>
    );
}

ResidentTableRow.propTypes = {
    row: PropTypes.object.isRequired,
    serialNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onEditSecurity: PropTypes.func,
    onEdit: PropTypes.func,
    onRestriction: PropTypes.func,
    onOut: PropTypes.func,
};
