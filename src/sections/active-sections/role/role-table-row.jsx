import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Box } from '@mui/material';
import EllipsisCellWithTooltip from 'src/components/table/ellipsis-cell-with-tooltip';

// ----------------------------------------------------------------------

export function RoleTableRow({ row, serialNumber, selected, onEditRow, onApproval, onReject }) {
    const statusColor = {
        pending: 'warning',
        approved: 'success',
        rejected: 'error',
    };

    const statusLabel = {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
    };

    const actions = [
        ...row?.status === "pending" ? [
            {
                key: 'edit',
                icon: 'solar:pen-bold',
                tooltip: 'Edit',
                onClick: onEditRow,
            },
        ] : [],
        // {
        //     key: 'approve',
        //     icon: 'solar:check-circle-bold',
        //     tooltip: 'Approve',
        //     color: "success",
        //     onClick: onApproval,
        // },
        // {
        //     key: 'reject',
        //     icon: 'solar:close-circle-bold',
        //     tooltip: 'Reject',
        //     color: "error",
        //     onClick: onReject,
        // },
    ]

    return (
        <TableRow hover selected={selected}>
            <TableCell>
                {serialNumber}
            </TableCell>

            <TableCell>{row.name} </TableCell>

            <EllipsisCellWithTooltip maxWidth="200px">{row.description}</EllipsisCellWithTooltip>

            <TableCell>
                {row.permissions?.length || 0} permissions
            </TableCell>

            <TableCell>
                {row.createdAt}
            </TableCell>

            <TableCell align="center">
                <Label
                    variant="soft"
                    color={statusColor[row.status] || 'default'}
                >
                    {statusLabel[row.status] || row.status}
                </Label>
            </TableCell>

            <TableCell align="center">
                <Box onClick={(event) => event.stopPropagation()} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <GenericTableRowActions actions={actions} />
                </Box>
            </TableCell>
        </TableRow>
    );
}

RoleTableRow.propTypes = {
    row: PropTypes.object,
    serialNumber: PropTypes.number,
    selected: PropTypes.bool,
    onEditRow: PropTypes.func,
    onApproval: PropTypes.func,
};