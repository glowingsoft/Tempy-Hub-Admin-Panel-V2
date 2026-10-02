import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { FileThumbnail } from 'src/components/file-thumbnail';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';

export function StaffDocumentTableRow({ row, serialNumber, onView, onAcknowledge }) {
    const router = useRouter();
    const detailPath = paths.staff.documents.detail(row._id);

    const actions = [
        {
            key: 'view',
            icon: 'solar:eye-bold',
            tooltip: 'View document',
            onClick: () => router.push(detailPath),
        },
        {
            key: 'acknowledge',
            icon: 'solar:check-circle-bold',
            tooltip: 'Acknowledge document',
            color: 'success',
            hidden: row.acknowledged,
            onClick: (e) => { e?.stopPropagation?.(); onAcknowledge(row); },
        },
    ];

    return (
        <TableRow
            hover
            sx={{ cursor: 'pointer' }}
            onClick={() => router.push(detailPath)}
        >
            <TableCell sx={{ color: 'text.secondary', typography: 'body2' }}>{serialNumber}</TableCell>
            <TableCell>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <FileThumbnail file={row.fileType || 'file'} sx={{ width: 36, height: 36 }} />
                    <Box>
                        <Typography variant="body2" fontWeight={600}>{row.name || 'Untitled document'}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.fileType?.toUpperCase() || 'FILE'}</Typography>
                    </Box>
                </Stack>
            </TableCell>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.createdAt) || row.createdAt || '—'}</TableCell>
            <TableCell align="center">
                {row.acknowledged
                    ? <Label variant="soft" color="success">Acknowledged</Label>
                    : <Label variant="soft" color="warning">Pending</Label>}
            </TableCell>
            <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <GenericTableRowActions actions={actions} />
                </Box>
            </TableCell>
        </TableRow>
    );
}
