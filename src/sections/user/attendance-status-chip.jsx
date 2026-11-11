// attendance-status-chip.jsx

import PropTypes from 'prop-types';
import { Label } from 'src/components/label';


export function AttendanceStatusChip({ status }) {
  const lowerStatus = (status || '').toLowerCase();

  let color = 'success';
  if (lowerStatus.includes('absent')) {
    color = 'error';
  } else if (lowerStatus.includes('unscheduled')) {
    color = 'info';
  } else if (lowerStatus.includes('sick')) {
    color = 'info';
  } else if (lowerStatus.includes('late')) {
    color = 'warning';
  } else if (lowerStatus.includes('leave') || lowerStatus.includes('authorized')) {
    color = 'secondary';
  }

  return <Label color={color}>{status}</Label>;
}

AttendanceStatusChip.propTypes = {
  status: PropTypes.string,
};