import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';

import { getPeepFloorLabel, getPeepLevelMeta } from './mocks/data';

export function PeepRecordTableRow({ row, serialNumber, ownerDashboard = true }) {
    const router = useRouter();
    const base = ownerDashboard ? paths.owner : paths.siteManager;
    const detailPath = base.peepAndFloorPlans.records.detail(row.id);
    const editPath = base.peepAndFloorPlans.records.edit(row.id);
    const levelMeta = getPeepLevelMeta(row.peepLevel);

    return (
        <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => router.push(detailPath)}>
            <TableCell sx={{ width: 60 }}>{serialNumber}</TableCell>
            <TableCell sx={{ width: '24%', minWidth: 200 }}>
                <Stack sx={{ typography: 'body2' }}>
                    <Link
                        component={RouterLink}
                        href={detailPath}
                        onClick={(event) => event.stopPropagation()}
                        color="inherit"
                        sx={{ fontWeight: 600 }}
                    >
                        {row.name || '—'}
                    </Link>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {row.email || '—'}
                    </Typography>
                </Stack>
            </TableCell>
            <TableCell sx={{ width: '16%', whiteSpace: 'nowrap' }}>{row.roomNumber || '—'}</TableCell>
            <TableCell sx={{ width: '16%', whiteSpace: 'nowrap' }}>{row.branch || '—'}</TableCell>
            <TableCell sx={{ width: '16%', whiteSpace: 'nowrap' }}>{getPeepFloorLabel(row.floor)}</TableCell>
            <TableCell sx={{ width: '16%' }}>
                <Label color={levelMeta.color}>{levelMeta.label}</Label>
            </TableCell>
            <TableCell sx={{ width: 90 }} align="center">
                <Box onClick={(event) => event.stopPropagation()} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <GenericTableRowActions
                        actions={[{ key: 'edit', icon: 'solar:pen-bold', tooltip: 'Edit', onClick: () => router.push(editPath) }]}
                    />
                </Box>
            </TableCell>
        </TableRow>
    );
}