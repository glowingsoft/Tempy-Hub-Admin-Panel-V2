// employee-sidebar.jsx

import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { EmployeeInfoItem } from './employee-info-item';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

export function EmployeeSidebar({ employee }) {
  const { profile, device } = employee;

  return (
    <Card
      sx={{
        p: 2.5,
        height: 'fit-content',
      }}
    >
      <Stack alignItems="center" spacing={1.5}>
        <Avatar
          src={profile.avatarUrl}
          alt={profile.name}
          sx={{
            width: 80,
            height: 80,
            fontSize: 28,
          }}
        >
          {profile.name?.charAt(0)}
        </Avatar>

        <Box textAlign="center">
          <Typography variant="subtitle1" fontWeight={700}>
            {profile.name}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            {employee.id}
          </Typography>
        </Box>

        <Label color="success">Active</Label>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <EmployeeInfoItem
        label="Department"
        value={profile.department}
      />

      <EmployeeInfoItem
        label="Role"
        value={profile.role}
      />

      <EmployeeInfoItem
        label="Start Date"
        value={profile.startDate}
      />

      <Divider sx={{ my: 2 }} />

      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 1.5,
          color: 'text.disabled',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
        }}
      >
        Linked Device
      </Typography>

      <Stack spacing={1}>
    
        <Box>
          <Label color={device.linked ? 'success' : 'default'}>{device.linked ? 'Linked' : 'Not linked'}</Label>
        </Box>

        {device.linked && (
          <>
            <Typography variant="caption" color="text.secondary">
              {device.deviceName}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                color: 'text.secondary',
                wordBreak: 'break-all',
              }}
            >
              {device.deviceId}
            </Typography>
          </>
        )}
      </Stack>
    </Card>
  );
}

EmployeeSidebar.propTypes = {
  employee: PropTypes.object,
};