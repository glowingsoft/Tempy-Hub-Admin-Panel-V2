import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { getAssignedBranch } from 'src/sections/org-rollup/utils';
import { useGetBranchesQuery, useGetBranchQuery } from 'src/store/Reducer/branches-api';
import {
  useCreateKioskMutation,
  useUpdateKioskMutation,
} from 'src/store/Reducer/kiosks-api';

// ----------------------------------------------------------------------

const DEVICE_TYPE_OPTIONS = [
  { value: 'ipad', label: 'iPad' },
  { value: 'android', label: 'Android' },
];

const mapBranchOption = (item) => ({
  value: item._id || item.id,
  label: item.name || '',
});

const schema = zod.object({
  branch: zod
    .object({ value: zod.string(), label: zod.string() })
    .nullable()
    .optional(),
  receptionIdentifier: zod.string().trim().min(1, 'Reception identifier is required'),
  locationLabel: zod.string().trim().min(1, 'Location label is required'),
  deviceType: zod.string().min(1, 'Device type is required'),
  fireEvacuation: zod.boolean().default(true),
});

// ----------------------------------------------------------------------

export default function QuickAddKioskModal({
  open,
  onClose,
  currentKiosk,
  ownerDashboard = false,
}) {
  const { organizationId, isOwner, user } = useCurrentOrganization();
  const isEdit = Boolean(currentKiosk);

  const [createKiosk, { isLoading: isCreating }] = useCreateKioskMutation();
  const [updateKiosk, { isLoading: isUpdating }] = useUpdateKioskMutation();

  const isFullOwner = ownerDashboard || isOwner;

  // Site manager's assigned branch
  const assigned = getAssignedBranch(user);
  const userBranchId =
    assigned?.id ||
    user?.branchId?._id ||
    user?.branchId ||
    (typeof user?.branch === 'object' ? user?.branch?._id : user?.branch) ||
    '';

  const { data: userBranchData } = useGetBranchQuery(
    { branchId: userBranchId, organizationId },
    { skip: !userBranchId || !organizationId || Boolean(assigned?.name) }
  );

  const userBranchName =
    assigned?.name ||
    userBranchData?.data?.name ||
    user?.branch?.name ||
    user?.branchName ||
    'Assigned Site';

  const defaultBranchOption = useMemo(() => {
    if (currentKiosk?.branch) {
      return {
        value: currentKiosk.branch._id || currentKiosk.branch.id || currentKiosk.branchId,
        label: currentKiosk.branch.name || 'Site',
      };
    }
    if (currentKiosk?.branchId) {
      return {
        value: currentKiosk.branchId,
        label: currentKiosk.branchName || currentKiosk.site?.name || 'Site',
      };
    }
    if (!isFullOwner && userBranchId) {
      return {
        value: userBranchId,
        label: userBranchName,
      };
    }
    return null;
  }, [currentKiosk, isFullOwner, userBranchId, userBranchName]);

  const defaultValues = useMemo(
    () => ({
      branch: defaultBranchOption,
      receptionIdentifier: currentKiosk?.receptionIdentifier || '',
      locationLabel: currentKiosk?.locationLabel || '',
      deviceType: currentKiosk?.deviceType || 'ipad',
      fireEvacuation: currentKiosk?.fireEvacuation ?? true,
    }),
    [currentKiosk, defaultBranchOption]
  );

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const kioskId = currentKiosk?._id || currentKiosk?.id;

      if (isEdit && kioskId) {
        // PATCH api/admin/kiosks/:kioskId
        const patchPayload = {
          kioskId,
          organizationId,
          receptionIdentifier: data.receptionIdentifier.trim(),
          locationLabel: data.locationLabel.trim(),
          deviceType: data.deviceType,
          fireEvacuation: Boolean(data.fireEvacuation),
        };

        await updateKiosk(patchPayload).unwrap();
        toast.success('Device updated successfully!');
      } else {
        // POST api/admin/kiosks
        const branchId = data.branch?.value || userBranchId;
        if (!branchId) {
          toast.error('Please select a site');
          return;
        }

        const createPayload = {
          organizationId,
          branchId,
          receptionIdentifier: data.receptionIdentifier.trim(),
          locationLabel: data.locationLabel.trim(),
          deviceType: data.deviceType,
          fireEvacuation: Boolean(data.fireEvacuation),
        };

        await createKiosk(createPayload).unwrap();
        toast.success('Device registered successfully!');
      }

      handleClose();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.data?.message ||
        error?.message ||
        (isEdit ? 'Failed to update device' : 'Failed to register device')
      );
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 2 }}>
          {isEdit ? 'Edit Device' : 'Register Device'}
        </DialogTitle>

        <DialogContent dividers>
          <Box
            sx={{
              pt: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            {/* Site / Branch Selection via InfiniteAutocomplete */}
            <Field.InfiniteAutocomplete
              name="branch"
              label="Site"
              placeholder="Search and select site..."
              useQuery={useGetBranchesQuery}
              queryArgs={{ organizationId }}
              mapOption={mapBranchOption}
              extraOptions={defaultBranchOption ? [defaultBranchOption] : []}
              enabled={open && Boolean(organizationId) && isFullOwner && !isEdit}
              disabled={!isFullOwner || isEdit}
              helperText={
                !isFullOwner
                  ? 'Locked to your assigned site'
                  : isEdit
                    ? 'Site cannot be changed after registration'
                    : undefined
              }
            />

            {/* Reception Identifier */}
            <Field.Text
              name="receptionIdentifier"
              label="Reception Identifier"
              placeholder="e.g. Main Entrance"
            />

            {/* Location Label */}
            <Field.Text
              name="locationLabel"
              label="Location Label"
              placeholder="e.g. Reception"
            />

            {/* Device Type */}
            <Field.Select name="deviceType" label="Device Type">
              {DEVICE_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            {/* Fire Evacuation */}
            <Field.Switch
              name="fireEvacuation"
              label="Fire Evacuation"
              helperText="Enable kiosk participation in fire evacuation rolls"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            Cancel
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            loading={isSubmitting || isCreating || isUpdating}
          >
            {isEdit ? 'Save Changes' : 'Register Device'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

QuickAddKioskModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  currentKiosk: PropTypes.object,
  ownerDashboard: PropTypes.bool,
};
