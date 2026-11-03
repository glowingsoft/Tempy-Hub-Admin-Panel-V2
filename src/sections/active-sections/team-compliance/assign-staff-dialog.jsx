import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

import { toast } from 'src/components/snackbar';
import { Label } from 'src/components/label';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { useGetStaffProfilesQuery } from 'src/store/Reducer/staff-profiles-api';
import { useCreateAssignmentMutation } from 'src/store/Reducer/assignments-api';

// ----------------------------------------------------------------------

const mapStaffOption = (item) => {
  const name =
    item?.user?.name ||
    item?.userId?.name ||
    item?.name ||
    item?.employeeCode ||
    item?._id;
  const email = item?.user?.email || item?.userId?.email || item?.email || '';
  const label = email ? `${name} (${email})` : name;
  return {
    value: item?._id || item?.id || item?.staffProfileId || item?.staffId,
    label,
    name,
    email,
    raw: item,
  };
};

const EMPTY_STAFF = [];

// ----------------------------------------------------------------------

export function AssignStaffDialog({
  open,
  onClose,
  requirement,
  organizationId,
  isSiteManager,
  siteManagerBranchId,
  initialStaff = EMPTY_STAFF,
}) {
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [error, setError] = useState('');

  const [createAssignment, { isLoading: isSubmitting }] = useCreateAssignmentMutation();

  const queryArgs = useMemo(() => {
    const args = { organizationId };
    if (isSiteManager && siteManagerBranchId) {
      args.branchId = siteManagerBranchId;
    }
    return args;
  }, [organizationId, isSiteManager, siteManagerBranchId]);

  useEffect(() => {
    if (open) {
      if (initialStaff) {
        const staffArray = Array.isArray(initialStaff) ? initialStaff : [initialStaff];
        const validStaff = staffArray.filter(Boolean);
        if (validStaff.length > 0) {
          const mapped = validStaff.map((s) => {
            if (s?.value && s?.label) return s;
            return mapStaffOption(s);
          });
          setSelectedStaff(mapped);
        } else {
          setSelectedStaff([]);
        }
      } else {
        setSelectedStaff([]);
      }
      setError('');
    }
  }, [open, initialStaff]);

  const handleClose = () => {
    onClose();
    setSelectedStaff([]);
    setError('');
  };

  const hasAutoAssign = Boolean(
    requirement?.appliesTo?.jobTitleIds?.length ||
    requirement?.appliesTo?.departmentIds?.length ||
    requirement?.jobTitles?.length ||
    requirement?.departments?.length
  );

  const handleAssign = async () => {
    if (!selectedStaff || selectedStaff.length === 0) {
      setError('Please select at least one staff member.');
      return;
    }
    if (!requirement?._id) {
      setError('Requirement is missing.');
      return;
    }

    setError('');
    try {
      const staffIds = selectedStaff.map((s) => s.value || s._id);
      await createAssignment({
        organizationId,
        data: {
          requirementId: requirement._id,
          staffIds,
        },
      }).unwrap();

      toast.success(
        `${staffIds.length} staff member${staffIds.length === 1 ? '' : 's'} assigned successfully`
      );
      handleClose();
    } catch (err) {
      console.error(err);
      const msg = err?.data?.message || err?.message || 'Failed to assign staff';
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="h6">Assign Staff</Typography>
          {requirement?.type && (
            <Label
              variant="soft"
              color={requirement.type === 'competency' ? 'primary' : 'secondary'}
              sx={{ textTransform: 'capitalize' }}
            >
              {requirement.type}
            </Label>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Requirement Info Box */}
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              bgcolor: 'background.neutral',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {requirement?.name || 'Requirement'}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 1, typography: 'caption', color: 'text.secondary' }}
            >
              {requirement?.renewalMonths != null && (
                <div>
                  <strong>Renewal:</strong> {requirement.renewalMonths} month
                  {requirement.renewalMonths === 1 ? '' : 's'}
                </div>
              )}
              {requirement?.firstCompletionDays != null && (
                <div>
                  <strong>First completion:</strong> {requirement.firstCompletionDays} day
                  {requirement.firstCompletionDays === 1 ? '' : 's'}
                </div>
              )}
              {requirement?.evidenceRequired && (
                <div>
                  <strong>Evidence:</strong> Required
                </div>
              )}
            </Stack>
          </Box>

          {/* Auto-Assignment Info Banner */}
          {hasAutoAssign && (
            <Alert severity="info" variant="outlined">
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Auto-assignment rules active
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Staff matching this requirement’s configured job titles or departments are
                automatically assigned (<code>source: jobTitle / department</code>). You can use this
                modal to manually assign additional staff members.
              </Typography>
            </Alert>
          )}

          {/* Staff Multi-Select Autocomplete */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Select Staff *
            </Typography>
            <InfiniteAutocomplete
              multiple
              label="Staff members"
              placeholder="Search by name or email..."
              value={selectedStaff}
              onChange={(newValue) => {
                setSelectedStaff(newValue || []);
                if (error) setError('');
              }}
              useQuery={useGetStaffProfilesQuery}
              queryArgs={queryArgs}
              mapOption={mapStaffOption}
              enabled={open}
              disabled={isSubmitting}
              renderOption={(props, option) => (
                <li {...props} key={option.value}>
                  <Stack sx={{ typography: 'body2' }}>
                    <Typography
                      variant="body2"
                      sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                    >
                      {option.name || option.label}
                    </Typography>
                    {option.email && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', textTransform: 'none' }}
                      >
                        {option.email}
                      </Typography>
                    )}
                  </Stack>
                </li>
              )}
            />
            {selectedStaff.length > 0 && (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', mt: 1, display: 'block' }}
              >
                {selectedStaff.length} staff member{selectedStaff.length === 1 ? '' : 's'} selected
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          color="primary"
          onClick={handleAssign}
          loading={isSubmitting}
          disabled={selectedStaff.length === 0}
        >
          Assign ({selectedStaff.length})
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

AssignStaffDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  requirement: PropTypes.object,
  organizationId: PropTypes.string,
  isSiteManager: PropTypes.bool,
  siteManagerBranchId: PropTypes.string,
  initialStaff: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};