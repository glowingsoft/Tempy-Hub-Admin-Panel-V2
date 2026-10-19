import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

// ----------------------------------------------------------------------

export function TableBodySkeleton({ rowCount = 10, cellCount = 6, dense = false }) {
  return [...Array(rowCount)].map((_, rowIndex) => (
    <TableRow key={`table-skeleton-row-${rowIndex}`}>
      {[...Array(cellCount)].map((__, cellIndex) => (
        <TableCell key={`table-skeleton-cell-${rowIndex}-${cellIndex}`} sx={{ py: dense ? 0.8 : 1.5 }}>
          <Skeleton
            variant="rounded"
            height={dense ? 16 : 18}
            width={cellIndex === 0 ? 24 : `${64 - cellIndex * 4}%`}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}
