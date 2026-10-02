// attendance-table.jsx

import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { TableHeadCustom, TablePaginationCustom, useTable } from 'src/components/table';
import { AttendanceStatusChip } from './attendance-status-chip';


// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "sr#", label: "Sr#" },
  { id: 'date', label: 'Date',align:'center',minWidth:120 },
  { id: 'clockIn', label: 'Clock In', align: 'center',minWidth:150 },
  { id: 'clockOut', label: 'Clock Out', align: 'center',minWidth:150 },
  { id: 'breakIn', label: 'Break In', align: 'center',minWidth:150 },
  { id: 'breakOut', label: 'Break Out', align: 'center',minWidth:150 },
  { id: 'total', label: 'Total' ,align:"center",minWidth:150},
  { id: 'status', label: 'Status', align: "center" },
];

// ----------------------------------------------------------------------

export function AttendanceTable({ records }) {
  const table = useTable();
  return (
    <Card>
      <TableContainer>
        <Table size={table.dense ? 'small' : 'medium'}>

          <TableHeadCustom headLabel={TABLE_HEAD} />

          <TableBody>
            {records.map((row) => (
              <TableRow
                key={row.id}
                hover
              >
                <TableCell>
                  <Typography variant="body2">
                    {row.id}
                  </Typography>
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

                <TableCell align="center">
                  <AttendanceStatusChip
                    status={row.status}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePaginationCustom
          page={table.page}
          count={records.length}
          dense={table.dense}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          onChangeDense={table.onChangeDense}
        />
      </TableContainer>

      {!records.length && (
        <Box
          sx={{
            py: 5,
            textAlign: 'center',
          }}
        >
          <Typography color="text.secondary">
            No attendance records found
          </Typography>
        </Box>
      )}
    </Card>
  );
}

AttendanceTable.propTypes = {
  records: PropTypes.array,
};

export const TableInfo = ({ icon, color, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      minWidth: 90,
    }}
  >
    <Label color={color} sx={{ borderRadius: 1 }}>
      <Iconify icon={icon} width={16} />
    </Label>

    <Typography variant="body2">
      {value}
    </Typography>
  </Box>
);