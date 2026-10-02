
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

// ----------------------------------------------------------------------

export default function InvitationLoadingSkeleton({ rowCount = 5 }) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton variant="text" width={20} />
          </TableCell>

          <TableCell>
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="circular" width={40} height={40} />
              <Stack sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" />
              </Stack>
            </Stack>
          </TableCell>

          <TableCell>
            <Skeleton variant="text" width="70%" />
          </TableCell>

          <TableCell>
            <Skeleton variant="text" width="60%" />
          </TableCell>

          <TableCell>
            <Skeleton variant="text" width="80%" />
          </TableCell>

          <TableCell align="center">
            <Skeleton variant="rounded" width={70} height={24} sx={{ mx: 'auto' }} />
          </TableCell>

          <TableCell align="center">
            <Skeleton variant="circular" width={28} height={28} sx={{ mx: 'auto' }} />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}