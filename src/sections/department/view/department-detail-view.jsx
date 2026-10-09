import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useParams, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';

import { fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { LoadingScreen } from 'src/components/loading-screen';

import { useGetDepartmentQuery } from 'src/store/Reducer/departments-api';
import { getOwnerOrganizationId } from 'src/sections/branch/utils';
import { DepartmentCreateEditModal } from '../department-create-edit-modal';

// ----------------------------------------------------------------------

export function DepartmentDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useSelector((state) => state.user);
  const organizationId = getOwnerOrganizationId(user);

  const editModal = useBoolean();
  const {
    data: department,
    isLoading,
    isError,
    error,
  } = useGetDepartmentQuery(
    { organizationId, departmentId: id },
    { skip: !id || !organizationId }
  );

  if (isLoading) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <LoadingScreen sx={{ py: 10 }} />
      </Box>
    );
  }

  if (isError) {
    const errorMessage =
      error?.data?.message ||
      error?.data?.msg ||
      error?.data?.error ||
      error?.error ||
      'Unable to load department details.';

    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(paths.owner.departments.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title={errorMessage} sx={{ py: 10 }} />
      </Box>
    );
  }

  if (!department) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(paths.owner.departments.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Department not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={department.name}
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Departments', href: paths.owner.departments.root },
          { name: department.name },
        ]}
        action={
          <Button
            variant="contained"
            onClick={editModal.onTrue}
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            Edit
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        <Typography variant="h6">Department details</Typography>
        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'grid',
            rowGap: 2.5,
            columnGap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          }}
        >
          <DetailItem label="Name" value={department.name} />
          <DetailItem label="Sort Order" value={department.sortOrder ?? '—'} />
          <DetailItem
            label="Status"
            value={
              <Label variant="soft" color={department.isActive ? 'success' : 'default'}>
                {department.isActive ? 'Active' : 'Inactive'}
              </Label>
            }
          />
          <DetailItem label="Organization" value={department.organization?.name || '—'} />
          <DetailItem label="Site" value={department.branch?.name || '—'} />
          <DetailItem label="Created At" value={fDateTime(department.createdAt)} />
          <DetailItem label="Last Updated" value={fDateTime(department.updatedAt)} />
        </Box>
      </Card>

      <DepartmentCreateEditModal
        open={editModal.value}
        onClose={editModal.onFalse}
        organizationId={department.organizationId}
        currentDepartment={department}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------

function DetailItem({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}
