import PropTypes from 'prop-types';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import Autocomplete from '@mui/material/Autocomplete';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { Editor } from 'src/components/editor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import { getUserBranchId } from 'src/utils/organization';
import { useCreateAnnouncementMutation } from 'src/store/Reducer/announcements-api';

import { AnnouncementHero } from './announcement-hero';

// ----------------------------------------------------------------------

const AUDIENCE_OPTIONS = [
  { value: 'staff', label: 'Staff' },
  { value: 'lineManager', label: 'Line Manager' },
  { value: 'siteManager', label: 'Site Manager' },
];

// ----------------------------------------------------------------------

export function AnnouncementCreateView({ rootPath, listPath, ownerDashboard = false }) {
  const router = useRouter();

  const resolvedRootPath =
    rootPath || (ownerDashboard ? paths.owner.root : paths.siteManager.root);
  const resolvedListPath =
    listPath ||
    (ownerDashboard
      ? paths.owner.announcements.root
      : paths.siteManager.announcements.root);

  const { organizationId, user } = useCurrentOrganization();

  const { branches, departments } = useOrganizationLookups({
    organizationId,
    branches: true,
    departments: true,
    limit: 100,
  });

  const userAssignedBranchId = useMemo(
    () =>
      getUserBranchId(user, organizationId) ||
      user?.branchId ||
      (typeof user?.branch === 'object' ? user?.branch?._id : user?.branch) ||
      null,
    [user, organizationId]
  );

  const [createAnnouncement, { isLoading: isSubmitting }] = useCreateAnnouncementMutation();

  const [branchId, setBranchId] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [audience, setAudience] = useState([]);
  const [departmentIds, setDepartmentIds] = useState([]);
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState({});

  // Auto-set branchId for site manager, or default to first branch for owner once loaded
  useEffect(() => {
    if (!ownerDashboard && userAssignedBranchId) {
      setBranchId(userAssignedBranchId);
    } else if (ownerDashboard && !branchId && branches.length > 0) {
      setBranchId(branches[0]._id);
    }
  }, [ownerDashboard, userAssignedBranchId, branches, branchId]);

  // Active departments belonging to the selected site OR with no site (org-wide)
  const availableDepartments = useMemo(() => {
    if (!Array.isArray(departments)) return [];
    return departments.filter((d) => {
      if (d.active === false) return false;
      const deptBranchId =
        d.branchId || (typeof d.branch === 'object' ? d.branch?._id : d.branch);
      if (branchId && deptBranchId === branchId) return true;
      if (!deptBranchId) return true;
      return false;
    });
  }, [departments, branchId]);

  const handleBranchChange = (newBranchId) => {
    setBranchId(newBranchId);
    if (errors.branchId) {
      setErrors((prev) => ({ ...prev, branchId: '' }));
    }
    setDepartmentIds((prev) => {
      const validIds = new Set(
        departments
          .filter((d) => {
            if (d.active === false) return false;
            const bId =
              d.branchId || (typeof d.branch === 'object' ? d.branch?._id : d.branch);
            return (newBranchId && bId === newBranchId) || !bId;
          })
          .map((d) => d._id)
      );
      return prev.filter((id) => validIds.has(id));
    });
  };

  const handleCancel = () => {
    router.push(resolvedListPath);
  };

  const validate = () => {
    const newErrors = {};

    if (!branchId) {
      newErrors.branchId = 'Site is required';
    }

    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!audience || audience.length === 0) {
      newErrors.audience = 'At least one audience role is required';
    }

    const isEditorEmpty =
      !description ||
      description === '<p><br></p>' ||
      description.trim() === '' ||
      description === '<p></p>';

    if (isEditorEmpty) {
      newErrors.description = 'Please write the announcement description';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      const payload = {
        organizationId,
        branchId,
        subject: subject.trim(),
        category: category.trim() || undefined,
        audience,
        departmentIds,
        description,
      };

      await createAnnouncement(payload).unwrap();

      toast.success('Announcement published successfully!');
      router.push(resolvedListPath);
    } catch (error) {
      console.error('Failed to create announcement', error);
      toast.error(error?.data?.message || error?.message || 'Failed to publish announcement');
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading="Create Announcement"
        links={[
          { name: 'Dashboard', href: resolvedRootPath },
          { name: 'Announcements', href: resolvedListPath },
          { name: 'New announcement' },
        ]}
        sx={{ mb: { xs: 3, md: 4 } }}
      />

      {/* Hero Banner matching the design */}
      <AnnouncementHero title="Announcements & Updates" />

      {/* Form Card */}
      <Stack spacing={3}>
        <Card sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2.5}>
            {/* Row 1: Site, Subject, Category */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              {ownerDashboard ? (
                <TextField
                  select
                  label="Site"
                  value={branchId}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  error={Boolean(errors.branchId)}
                  helperText={errors.branchId}
                  sx={{ minWidth: { md: 220 } }}
                >
                  {branches.length === 0 ? (
                    <MenuItem value="" disabled>
                      No sites found
                    </MenuItem>
                  ) : (
                    branches.map((b) => (
                      <MenuItem key={b._id} value={b._id} sx={{ textTransform: 'capitalize' }}>
                        {b.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              ) : (
                <TextField
                  disabled
                  label="Site"
                  value={
                    branches.find((b) => b._id === branchId)?.name ||
                    user?.branch?.name ||
                    'Assigned Site'
                  }
                  InputProps={{ readOnly: true }}
                  sx={{
                    minWidth: { md: 220 },
                    '& .MuiInputBase-root.Mui-disabled': {
                      backgroundColor: 'action.disabledBackground',
                      cursor: 'not-allowed',
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      cursor: 'not-allowed',
                    },
                  }}
                />
              )}

              <TextField
                fullWidth
                label="Subject"
                placeholder="Enter announcement subject..."
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errors.subject) {
                    setErrors((prev) => ({ ...prev, subject: '' }));
                  }
                }}
                error={Boolean(errors.subject)}
                helperText={errors.subject}
              />

              <TextField
                label="Category"
                placeholder="Enter category..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{ minWidth: { md: 220 } }}
              />
            </Stack>

            {/* Row 2: Target Audience & Departments */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Autocomplete
                multiple
                options={AUDIENCE_OPTIONS}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                value={AUDIENCE_OPTIONS.filter((opt) => audience.includes(opt.value))}
                onChange={(_, newValue) => {
                  setAudience(newValue.map((item) => (typeof item === 'string' ? item : item.value)));
                  if (errors.audience) {
                    setErrors((prev) => ({ ...prev, audience: '' }));
                  }
                }}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.value}
                      label={option.label}
                      size="small"
                    />
                  ))
                }
                sx={{ minWidth: { md: 320 } }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Target Audience"
                    error={Boolean(errors.audience)}
                    helperText={errors.audience}
                    placeholder={audience.length === 0 ? 'Select audience...' : ''}
                  />
                )}
              />

              <Autocomplete
                multiple
                fullWidth
                options={availableDepartments}
                getOptionLabel={(option) => option.name || ''}
                value={availableDepartments.filter((d) => departmentIds.includes(d._id))}
                onChange={(_, newValue) => {
                  setDepartmentIds(newValue.map((d) => d._id));
                }}
                renderTags={(selected, getTagProps) =>
                  selected.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option._id}
                      label={option.name}
                      size="small"
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Departments"
                    placeholder={
                      departmentIds.length === 0
                        ? 'All departments (or select specific)'
                        : ''
                    }
                    helperText="Leave empty to send to all departments in this site"
                  />
                )}
              />
            </Stack>

            {/* Row 3: Description Rich Text Editor */}
            <Box sx={{ mt: 1 }}>
              <Editor
                fullItem
                value={description}
                onChange={(val) => {
                  setDescription(val);
                  if (errors.description) {
                    setErrors((prev) => ({ ...prev, description: '' }));
                  }
                }}
                placeholder="Write your announcement details here..."
                sx={{
                  minHeight: 340,
                  ...(errors.description && {
                    border: (theme) => `1px solid ${theme.vars.palette.error.main}`,
                    borderRadius: 1,
                  }),
                }}
              />
              {errors.description && (
                <FormHelperText error sx={{ px: 2, mt: 0.75, fontSize: '0.75rem' }}>
                  {errors.description}
                </FormHelperText>
              )}
            </Box>
          </Stack>
        </Card>

        {/* Action Controls */}
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined" color="inherit" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>

          <LoadingButton
            variant="contained"
            color="primary"
            loading={isSubmitting}
            onClick={handleSave}
            sx={{ px: 4 }}
          >
            Save
          </LoadingButton>
        </Stack>
      </Stack>
    </DashboardContent>
  );
}

AnnouncementCreateView.propTypes = {
  rootPath: PropTypes.string,
  listPath: PropTypes.string,
  ownerDashboard: PropTypes.bool,
};
