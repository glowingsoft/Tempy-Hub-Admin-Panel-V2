
import { useState, useMemo } from 'react';

import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useParams, usePathname, useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useTabs } from 'src/hooks/use-tabs';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import { useGetExternalPersonQuery } from 'src/store/Reducer/general-directory-api';

import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { LoadingScreen } from 'src/components/loading-screen';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { AttendanceView } from '../attendance-view';
import { EmployeeActivity } from '../employee-activity';
import { ProfileCover } from '../profile-cover';
import QuickStatusChangeModal from '../user-status-dialog';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'details',
    label: 'Details',
    icon: 'solar:user-id-bold',
  },
  {
    value: 'attendance',
    label: 'Attendance',
    icon: 'uim:clock',
  },
  {
    value: 'activity',
    label: 'Activity',
    icon: 'mynaui:activity-square-solid',
  },
  {
    value: 'items',
    label: 'Items',
    icon: 'solar:archive-down-bold',
  },
];

// ----------------------------------------------------------------------

function EmployeeProfileView() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { value, onChange } = useTabs('details');

  const openModal = useBoolean();
  const archiveModal = useBoolean();

  const { organizationId } = useCurrentOrganization();
  const { getBranchName, getDepartmentNames, branchesMap, departmentsMap } =
    useOrganizationLookups({
      organizationId,
      limit: 100,
    });

  const {
    data: apiPerson,
    isLoading,
    isFetching,
    isError,
  } = useGetExternalPersonQuery(
    { externalPersonId: id, organizationId },
    {
      skip: !id || !organizationId,
    }
  );

  const rawPerson = apiPerson?.data ?? apiPerson;
  const person = rawPerson?._id ? rawPerson : rawPerson?.data ? rawPerson.data : rawPerson;

  const isOwnerDirectory = pathname.startsWith(paths.owner.root);
  const dashboardPath = isOwnerDirectory ? paths.owner.root : paths.siteManager.root;
  const directoryPath = isOwnerDirectory
    ? paths.owner.directory.root
    : paths.siteManager.directory.root;

  const currentUserForEdit = useMemo(
    () => ({
      id: person?._id || person?.id || id,
      name: person?.name || '',
      email: person?.email || '',
      status: person?.status || 'active',
      phone: person?.phone || '',
      carRegistration: person?.carRegistration || '',
      departmentId:
        person?.departmentId ||
        (typeof person?.department === 'object'
          ? person.department?._id
          : person?.department) ||
        '',
      type: person?.type || '',
    }),
    [id, person]
  );

  const branchName = useMemo(() => {
    if (!person) return '—';
    return (
      person?.branch?.name ||
      branchesMap[person?.branchId]?.name ||
      getBranchName(person) ||
      '—'
    );
  }, [branchesMap, getBranchName, person]);

  const departmentName = useMemo(() => {
    if (!person) return '—';
    return (
      person?.department?.name ||
      departmentsMap[person?.departmentId]?.name ||
      getDepartmentNames(person) ||
      '—'
    );
  }, [departmentsMap, getDepartmentNames, person]);

  if ((isLoading || isFetching || !organizationId) && !person && !isError) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <LoadingScreen sx={{ py: 10 }} />
      </Box>
    );
  }

  if (isError || (!person && !isLoading && !isFetching && organizationId)) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <EmptyContent
          filled
          title="Person not found"
          description="The requested person could not be found or has been removed."
          action={
            <Button
              component={RouterLink}
              href={directoryPath}
              variant="contained"
              startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
              sx={{ mt: 3 }}
            >
              Back to Directory
            </Button>
          }
          sx={{ py: 10 }}
        />
      </Box>
    );
  }

  const personRole = person?.type
    ? person.type.charAt(0).toUpperCase() + person.type.slice(1)
    : person?.status || 'External';

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={person?.name || 'Employee Profile'}
        links={[
          { name: 'Dashboard', href: dashboardPath },
          { name: 'Directory', href: directoryPath },
          { name: person?.name || 'Employee Profile' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: 3, height: 290 }}>
        <ProfileCover
          role={personRole}
          name={person?.name}
          avatarUrl={person?.image}
        />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            width: 1,
            top: 20,
            zIndex: 9,
            px: { md: 3 },
            position: 'absolute',
          }}
        >
          <Tooltip title="Edit" arrow placement="top">
            <IconButton onClick={openModal.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Archive" arrow placement="top">
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
      {value === 'details' && (
        <EmployeeDetails
          person={person}
          branchName={branchName}
          departmentName={departmentName}
        />
      )}

      {value === 'attendance' && (
        person?.attendance ? (
          <AttendanceView attendance={person.attendance} />
        ) : (
          <EmptyTab
            title="Attendance"
            description="No attendance records available for this person."
            icon="uim:clock"
          />
        )
      )}

      {value === 'activity' && (
        Array.isArray(person?.activities) && person.activities.length ? (
          <EmployeeActivity
            title="Activity"
            list={person.activities}
            icon="mynaui:activity-square-solid"
          />
        ) : (
          <EmptyTab
            title="Activity"
            description="No recent activity recorded for this person."
            icon="mynaui:activity-square-solid"
          />
        )
      )}

      {value === 'items' && (
        <EmptyTab
          title="Items"
          description="No items found"
          icon="solar:archive-down-bold"
        />
      )}

      <QuickStatusChangeModal
        open={openModal.value}
        onClose={openModal.onFalse}
        currentUser={currentUserForEdit}
      />

      <ConfirmDialog
        open={archiveModal.value}
        onClose={archiveModal.onFalse}
        title="Confirm Archive"
        content="Are you sure you want to archive this person?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={archiveModal.onFalse}
          >
            Archive
          </Button>
        }
      />
    </Box>
  );
}

export default EmployeeProfileView;

// ----------------------------------------------------------------------

function EmployeeDetails({ person, branchName, departmentName }) {
  const [phoneCheckIn, setPhoneCheckIn] = useState(true);

  const formattedType = person?.type
    ? person.type.charAt(0).toUpperCase() + person.type.slice(1)
    : '—';

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">Personal & Assignment details</Typography>
        <Typography variant="body2" color="text.secondary">
          Basic information about the person and their site access.
        </Typography>
      </Box>

      <Card>
        <Box sx={{ p: { xs: 2.5, md: 3 } }}>
          <DetailSection label="Identity">
            <DetailItem label="Full Name" value={person?.name} icon="solar:user-bold" />
            <DetailItem label="Type" icon="solar:shield-user-bold">
              <Label
                variant="soft"
                color={person?.type === 'visitor' ? 'info' : 'warning'}
              >
                {formattedType}
              </Label>
            </DetailItem>
            <DetailItem label="Status" icon="solar:check-circle-bold">
              <Label
                variant="soft"
                color={
                  person?.status === 'On site' || person?.status === 'active'
                    ? 'success'
                    : person?.status === 'On leave'
                      ? 'warning'
                      : 'default'
                }
              >
                {person?.status || 'Active'}
              </Label>
            </DetailItem>
          </DetailSection>

          <DetailSection label="Contact Information" sx={{ mt: 3.5 }}>
            <DetailItem label="Email" value={person?.email} icon="solar:letter-bold" />
            <DetailItem label="Phone Number" value={person?.phone} icon="solar:phone-bold" />
            <DetailItem
              label="Car Registration"
              value={person?.carRegistration || '—'}
              icon="solar:car-bold"
            />
          </DetailSection>

          <DetailSection label="Site & Department" sx={{ mt: 3.5 }}>
            <DetailItem label="Site / Branch" value={branchName} icon="solar:buildings-2-bold" />
            <DetailItem label="Department" value={departmentName} icon="solar:users-group-rounded-bold" />
            <DetailItem
              label="Registered On"
              value={person?.createdAt ? fDate(person.createdAt) : '—'}
              icon="solar:calendar-bold"
            />
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
              Allow this person to check in using their mobile phone or kiosk.
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

function DetailItem({ label, value, icon, children }) {
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

      <Stack spacing={0.5} alignItems="flex-start">
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>

        {children || (
          <Typography variant="body2" fontWeight={600}>
            {value || '—'}
          </Typography>
        )}
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