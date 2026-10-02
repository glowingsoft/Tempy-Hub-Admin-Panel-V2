// attendance-view.jsx

import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import {Iconify} from 'src/components/iconify';

import { AttendanceSummary } from './attendance-summary';
import { AttendanceTable } from './attendance-table';

// ----------------------------------------------------------------------

export function AttendanceView({ attendance }) {
  return (
    <Stack spacing={2.5}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h6">
            Attendance — this month
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {attendance.month}
          </Typography>
        </Box>

        <Button
          size="small"
          variant="outlined"
          startIcon={
            <Iconify icon="solar:export-bold" />
          }
        >
          Export CSV
        </Button>
      </Box>

      {/* Summary */}
      <AttendanceSummary
        summary={attendance.summary}
      />

      {/* Table */}
      <AttendanceTable
        records={attendance.records}
      />
    </Stack>
  );
}

AttendanceView.propTypes = {
  attendance: PropTypes.object,
};