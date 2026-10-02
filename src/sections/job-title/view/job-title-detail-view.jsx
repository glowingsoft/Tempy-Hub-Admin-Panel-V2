import { useMemo, useState } from 'react';

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

// import { useGetJobTitleQuery } from 'src/store/Reducer/job-titles-api';
import { getJobTitleLevelLabel, mockJobTitles, updateMockJobTitle } from '../mocks/data';
import { JobTitleCreateEditModal } from '../job-title-create-edit-modal';

// ----------------------------------------------------------------------

export function JobTitleDetailView() {
  const { id } = useParams();
  const router = useRouter();

  const editModal = useBoolean();
  const [reloadKey, setReloadKey] = useState(0);

  // TODO: swap for the real query once the endpoint is wired up:
  // const { data, isLoading } = useGetJobTitleQuery({ organizationId, jobTitleId: id });
  // const jobTitle = data;
  const jobTitle = useMemo(
    () => mockJobTitles.find((jt) => jt._id === id) ?? null,
    [id, reloadKey]
  );

  const handleEditSuccess = (payload) => {
    updateMockJobTitle(id, payload);
    setReloadKey((key) => key + 1);
  };

  if (!jobTitle) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(paths.owner.jobTitles.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Job title not found" sx={{ py: 10 }} />
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
        heading={jobTitle.name}
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Job Titles', href: paths.owner.jobTitles.root },
          { name: jobTitle.name },
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
        <Typography variant="h6">Job title details</Typography>
        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'grid',
            rowGap: 2.5,
            columnGap: 3,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          }}
        >
          <DetailItem label="Name" value={jobTitle.name} />
          <DetailItem label="Level" value={getJobTitleLevelLabel(jobTitle.level)} />
          <DetailItem
            label="Status"
            value={
              <Label variant="soft" color={jobTitle.active ? 'success' : 'default'}>
                {jobTitle.active ? 'Active' : 'Inactive'}
              </Label>
            }
          />
          <DetailItem label="Organization" value={jobTitle.organization?.name || '—'} />
          <DetailItem
            label="Site"
            value={jobTitle.siteScope === 'none' ? 'None' : jobTitle.branch?.name || 'All sites'}
          />
          <DetailItem label="Department" value={jobTitle.department?.name || '—'} />
          <DetailItem label="Created At" value={fDateTime(jobTitle.createdAt)} />
          <DetailItem label="Updated At" value={fDateTime(jobTitle.updatedAt)} />
        </Box>
      </Card>

      <JobTitleCreateEditModal
        open={editModal.value}
        onClose={editModal.onFalse}
        organizationId={jobTitle.organizationId}
        currentJobTitle={jobTitle}
        onSuccess={handleEditSuccess}
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
