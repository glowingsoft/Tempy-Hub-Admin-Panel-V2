import { Avatar, Box, Link, Stack, TableCell, TableRow } from '@mui/material'
import React from 'react'
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label'
import EllipsisCellWithTooltip from 'src/components/table/ellipsis-cell-with-tooltip'


const STATUS_COLOR = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
};

const PendingApprovalTableRow = ({ row, onApproval, onReject }) => {

    const actions = [
        {
            key: 'view',
            icon: 'solar:eye-bold',
            tooltip: 'View',
            onClick: () => console.log('view'),
        },
        {
            key: 'approve',
            icon: 'solar:check-circle-bold',
            tooltip: 'Approve',
            color: "success",
            onClick: onApproval,
        },
        {
            key: 'reject',
            icon: 'solar:close-circle-bold',
            tooltip: 'Reject',
            color: "error",
            onClick: onReject,
        },
    ]
    return (
        <TableRow hover>
            <TableCell sx={{ px: 1 }}>
                {row.id}
            </TableCell>

            <TableCell sx={{ pl: 1.5, pr: 1 }}>
                <Stack spacing={1} direction="row" alignItems="center" sx={{ minWidth: 0 }}>
                    <Avatar alt={row.employeeName} src={row.image} sx={{ width: 32, height: 32, flexShrink: 0 }}>
                        {row.employeeName?.charAt(0)}
                    </Avatar>

                    <Stack
                        sx={{
                            typography: 'body2',
                            flex: '1 1 auto',
                            minWidth: 0,
                            alignItems: 'flex-start',
                        }}
                    >
                        <Link color="inherit" sx={{ cursor: 'pointer' }}>
                            {row.employeeName || '—'}
                        </Link>
                        <Box sx={{
                            color: 'text.secondary',
                            typography: 'caption',
                        }}
                        >
                            {row.email || '—'}
                        </Box>
                    </Stack>
                </Stack>
            </TableCell>


            <TableCell align="center">
                <Label color="info" > {row.requestType}</Label>
            </TableCell>

            <EllipsisCellWithTooltip maxWidth="200px">{row.requestedChange}</EllipsisCellWithTooltip>

            {/* <EllipsisCellWithTooltip maxWidth="200px">{row.reason}</EllipsisCellWithTooltip> */}

            <TableCell align="center">{row.submittedOn} </TableCell>

            <TableCell align="center">
                <Label color={STATUS_COLOR[row.status] || 'default'} >
                    {row.status}
                </Label>
            </TableCell>

            <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                <Box onClick={(event) => event.stopPropagation()} sx={{ display: 'inline-flex' }}>
                    <GenericTableRowActions actions={actions} />
                </Box>
            </TableCell>
        </TableRow>
    )
}

export default PendingApprovalTableRow