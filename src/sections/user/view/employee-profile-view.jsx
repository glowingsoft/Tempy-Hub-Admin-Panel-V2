
import { IconButton, Switch, Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { alpha } from "@mui/material/styles";
import { useState } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useTabs } from 'src/hooks/use-tabs';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { AttendanceView } from '../attendance-view';
import { EmployeeActivity } from '../employee-activity';
import { employeeData, MOCK_ACTIVITY } from '../mocks/data';
import { ProfileCover } from '../profile-cover';
import QuickStatusChangeModal from '../user-status-dialog';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'details',
    label: 'Details',
    icon: "solar:user-id-bold",
  },
  {
    value: 'attendance',
    label: 'Attendance',
    icon: "uim:clock",
  },
  {
    value: 'activity',
    label: 'Activity',
    icon: "mynaui:activity-square-solid",
  },
  {
    value: 'items',
    label: 'Items',
    icon: "solar:archive-down-bold",
  },
];

// ----------------------------------------------------------------------

function EmployeeProfileView() {

  // const [currentTab, setCurrentTab] = useState('details');
  const { value, onChange } = useTabs("details");
  const pathname = usePathname();

  const employee = employeeData;

  const openModal = useBoolean();

  const archiveModal = useBoolean();

  const router = useRouter();
  const isOwnerDirectory = pathname.startsWith(paths.owner.root);
  const dashboardPath = isOwnerDirectory ? paths.owner.root : paths.siteManager.root;
  const directoryPath = isOwnerDirectory ? paths.owner.directory.root : paths.siteManager.directory.root;

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>

      <Box sx={{ mb: 2 }}>
        <Button
          onClick={router.back}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading="Employee Profile"
        links={[
          { name: 'Dashboard', href: dashboardPath },
          { name: 'Directory', href: directoryPath },
          { name: 'Employee Profile' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: 3, height: 290 }}>
        <ProfileCover
          role={employee?.profile?.role}
          name={employee?.profile.name}
          avatarUrl={employee?.profile?.avatarUrl}
        />

        <Box sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
          width: 1,
          top: 20,
          zIndex: 9,
          px: { md: 3 },
          position: 'absolute',
        }}>

          <Tooltip title="Edit" arrow placement='top'>
            <IconButton onClick={openModal.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Archive" arrow placement='top'>
            <IconButton color="error" onClick={archiveModal.onTrue}>
              <Iconify icon="solar:archive-down-bold" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          display="flex"
          justifyContent={{ xs: 'center', md: 'flex-end' }}
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            px: { md: 3 },
            position: 'absolute',
            bgcolor: 'background.paper',
          }}
        >
          <Tabs value={value} onChange={onChange}>
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                icon={<Iconify icon={tab.icon} />}
                label={tab.label}
              />
            ))}
          </Tabs>
        </Box>
      </Card>

      {/* Tab content */}
      {value === 'details' && <EmployeeDetails employee={employee} />}

      {value === 'attendance' && <AttendanceView attendance={employee.attendance} />}

      {value === 'activity' && <EmployeeActivity
        title={"Activity"}
        list={MOCK_ACTIVITY}
        icon="mynaui:activity-square-solid"
      />
      }

      {value === 'items' &&
        <EmptyTab
          title="Items"
          description="No items found"
          icon="solar:archive-down-bold"
        />
      }

      <QuickStatusChangeModal
        open={openModal.value}
        onClose={openModal.onFalse}
        currentUser={{}}
      />
      <ConfirmDialog
        open={archiveModal.value}
        onClose={archiveModal.onFalse}
        title="Confirm Archive"
        content={"Are you sure you want to archive this employee?"}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={archiveModal.onFalse}
          // startIcon={isDeleting && <CircularProgress size={20} color="inherit" />}
          >
            {/* {isDeleting ? 'Deleting...' : 'Delete'} */}
            Archive
          </Button>
        }
      />


    </Box >
  );
}

export default EmployeeProfileView;
// ----------------------------------------------------------------------

function EmployeeDetails({ employee }) {
  const [phoneCheckIn, setPhoneCheckIn] = useState(employee?.settings?.phoneCheckIn ?? true);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">Employee details</Typography>
        <Typography variant="body2" color="text.secondary">
          Basic information about the employee.
        </Typography>
      </Box>

      <Card>
        <Box sx={{ p: 3 }}>
          <DetailSection label="Identity">
            <DetailItem label="Name" value={employee.profile.name} icon="solar:user-bold" />
            <DetailItem label="Employee ID" value={employee.id} icon="solar:card-bold" />
          </DetailSection>

          <DetailSection label="Employment" sx={{ mt: 3 }}>
            <DetailItem label="Department" value={employee.profile.department} icon="solar:buildings-2-bold" />
            <DetailItem label="Role" value={employee.profile.role} icon="solar:shield-user-bold" />
            <DetailItem label="Start Date" value={employee.profile.startDate} icon="solar:calendar-bold" />
          </DetailSection>

          <DetailSection label="Equipment" sx={{ mt: 3 }}>
            <DetailItem label="Device" value={employee.device.deviceName} icon="solar:smartphone-bold" />
          </DetailSection>
        </Box>
      </Card>

      <Card>
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Phone check-in
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Allow this employee to check in using their mobile phone.
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography
              variant="subtitle2"
              sx={{
                color: phoneCheckIn ? 'success.main' : 'text.secondary',
                fontWeight: 700,
                fontSize: { xs: '0.95rem', sm: '1rem' },
              }}
            >
              {phoneCheckIn ? 'Enabled' : 'Disabled'}
            </Typography>
            <Switch
              checked={phoneCheckIn}
              onChange={(event) => setPhoneCheckIn(event.target.checked)}
              inputProps={{ 'aria-label': 'Toggle phone check-in' }}
              sx={{
                width: 58,
                height: 32,
                '& .MuiSwitch-switchBase': {
                  margin: 0.5,
                  padding: 0,
                  transform: 'translateX(0px)',
                  '&.Mui-checked': {
                    transform: 'translateX(26px)',
                  },
                },
                '& .MuiSwitch-thumb': {
                  width: 24,
                  height: 24,
                  boxShadow: 'none',
                },
                '& .MuiSwitch-track': {
                  borderRadius: 16,
                },
              }}
            />
          </Stack>
        </Box>
      </Card>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function DetailSection({ label, children, sx }) {
  return (
    <Box sx={sx}>
      <Typography
        variant="overline"
        sx={{
          color: 'primary.dark',
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        {label}
      </Typography>

      <Divider sx={{ mt: 0.5, mb: 2 }} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          columnGap: 3,
          rowGap: 2.5,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

function DetailItem({ label, value, icon }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">

      <Stack
        alignItems="center"
        justifyContent="center"
        sx={(theme) => ({
          width: 36,
          height: 36,
          borderRadius: '50%',
          flexShrink: 0,
          bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.24 : 0.1),
        })}
      >
        <Iconify
          icon={icon}
          width={20}
          sx={{ color: 'primary.dark' }}
        />
      </Stack>

      <Stack spacing={0.5}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>

        <Typography variant="body2" fontWeight={600}>
          {value}
        </Typography>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function EmptyTab({ title, description, icon }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 10,
        px: 2,
        borderRadius: 2,
        bgcolor: 'background.neutral',
        border: '1px dashed',
        borderColor: 'divider',
      }}
      component={Card}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          bgcolor: 'action.hover',
          mb: 1.5,
        }}
      >
        <Iconify
          icon={icon}
          width={26}
          sx={{ color: 'text.secondary' }}
        />
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mt: 0.5,
          color: 'text.secondary',
          maxWidth: 320,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
}