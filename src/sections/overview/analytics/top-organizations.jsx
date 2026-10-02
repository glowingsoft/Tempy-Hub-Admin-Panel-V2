import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { Avatar, Link, Stack, Tooltip } from '@mui/material';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const STATUS_COLOR = {
    active: 'success',
    inactive: 'default',
    suspended: 'error',
    pending: 'warning',
};

export function TopOrganizations({ title, subheader, tableData = [], headLabel, onClick, ...other }) {
    return (
        <Card sx={{ height: 1, display: 'flex', flexDirection: 'column', ...other?.sx }} {...other}>
            <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

            <Scrollbar sx={{ minHeight: 402, flexGrow: 1 }}>
                <Table sx={{ minWidth: 460 }}>
                    <TableHeadCustom headLabel={headLabel} />

                    <TableBody>
                        {tableData.map((row) => (
                            <RowItem key={row._id} row={row} />
                        ))}
                    </TableBody>
                </Table>
            </Scrollbar>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Box sx={{ p: 2, textAlign: 'right' }}>
                <Button
                    size="small"
                    color="inherit"
                    onClick={onClick}
                    endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
                >
                    View all
                </Button>
            </Box>
        </Card>
    );
}

function RowItem({ row }) {
    const router = useRouter();

    const activeModules = (row.moduleAccess || []).filter((m) => m.enabled).length;

    const actions = [
        {
            key: 'details',
            icon: 'solar:eye-bold',
            tooltip: 'Details',
            color: 'default',
            onClick: () => router.push(paths.dashboard.organizations.detail(row._id)),
        },
    ];

    return (
        <TableRow hover>
            <TableCell>
                <Stack spacing={2} direction="row" alignItems="center">
                    <Avatar alt={row.name}>{row.name?.charAt(0)?.toUpperCase()}</Avatar>

                    <Stack sx={{ typography: 'body2', flex: '1 1 auto', alignItems: 'flex-start' }}>
                        <Link color="inherit">
                            {row?.name?.length > 30 ? (
                                <Tooltip title={row.name} arrow placement="bottom">
                                    <span>{row.name.slice(0, 30)}...</span>
                                </Tooltip>
                            ) : (
                                row.name || '--'
                            )}
                        </Link>
                    </Stack>
                </Stack>
            </TableCell>

            <TableCell align="center">{activeModules}</TableCell>

            <TableCell align="center">
                <Label color={STATUS_COLOR[row.status] || 'default'}>{row.status || '--'}</Label>
            </TableCell>

            <TableCell>
                <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                    <GenericTableRowActions actions={actions} />
                </Box>
            </TableCell>
        </TableRow>
    );
}
